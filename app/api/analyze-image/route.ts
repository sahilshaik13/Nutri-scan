import { NextRequest, NextResponse } from 'next/server'

interface ImageAnalysisRequest {
  image_base64: string
  mime_type: string
  health_profile: {
    allergies?: string[]
    intolerances?: string[]
    medical_conditions?: string[]
    dietary_lifestyles?: string[]
  } | null
}

interface Question {
  id: string
  question: string
  type?: string
  options: string[]
  allow_specify?: boolean
  specify_placeholder?: string
}

interface AnalysisResponse {
  food_name: string
  ingredients: string[]
  serving_size: string
  confidence: string
  is_labeled_product?: boolean
  questions: Question[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageAnalysisRequest = await request.json()
    const { image_base64, mime_type, health_profile } = body

    if (!image_base64) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY environment variable' },
        { status: 500 }
      )
    }

    // Call Gemini Vision API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this food image and provide detailed information. Response must be valid JSON with this structure:
{
  "food_name": "exact name of the food",
  "ingredients": ["ingredient1", "ingredient2"],
  "serving_size": "estimated size like 1 cup, 150g",
  "confidence": "high/medium/low",
  "is_labeled_product": true/false,
  "questions": [
    {
      "id": "q1",
      "question": "specific question about the food",
      "type": "portion|ingredient|cooking",
      "options": ["option1", "option2"],
      "allow_specify": true,
      "specify_placeholder": "custom input hint"
    }
  ]
}

Provide 1-3 targeted questions to improve accuracy. Only include options that make sense.
${health_profile ? `User has: allergies=[${health_profile.allergies?.join(', ')}], intolerances=[${health_profile.intolerances?.join(', ')}], conditions=[${health_profile.medical_conditions?.join(', ')}]` : ''}`,
              },
              {
                inline_data: {
                  mime_type,
                  data: image_base64,
                },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extract the text response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!textContent) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      )
    }

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not parse analysis response' },
        { status: 500 }
      )
    }

    const analysis: AnalysisResponse = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

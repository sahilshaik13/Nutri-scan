import { NextRequest, NextResponse } from 'next/server'

interface QuickAnalyzeRequest {
  image_base64: string
  mime_type: string
  health_profile: {
    allergies?: string[]
    intolerances?: string[]
    medical_conditions?: string[]
    dietary_lifestyles?: string[]
  } | null
}

interface PersonalHealthImpact {
  condition: string
  impact_level: 'safe' | 'caution' | 'warning' | 'danger'
  explanation: string
  ingredients_of_concern: string[]
}

interface NutritionData {
  food_name: string
  ingredients: string[]
  serving_size: string
  calories: number
  total_fat: number
  saturated_fat: number
  trans_fat: number
  cholesterol: number
  sodium: number
  total_carbohydrates: number
  dietary_fiber: number
  total_sugars: number
  added_sugars: number
  protein: number
  vitamin_d: number
  calcium: number
  iron: number
  potassium: number
  health_score: number
  health_rating: string
  health_insights: string[]
  recommendations: string[]
  personal_health_impacts?: PersonalHealthImpact[]
}

export async function POST(request: NextRequest) {
  try {
    const body: QuickAnalyzeRequest = await request.json()
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

    // Call Gemini for quick analysis (without questions)
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
                text: `Analyze this food image and provide complete nutrition data. Response must be valid JSON:
{
  "food_name": "exact name",
  "ingredients": ["ingredient1", "ingredient2"],
  "serving_size": "standard serving size",
  "calories": 300,
  "total_fat": 15,
  "saturated_fat": 5,
  "trans_fat": 0,
  "cholesterol": 50,
  "sodium": 800,
  "total_carbohydrates": 35,
  "dietary_fiber": 4,
  "total_sugars": 8,
  "added_sugars": 2,
  "protein": 20,
  "vitamin_d": 1,
  "calcium": 200,
  "iron": 2,
  "potassium": 400,
  "health_score": 70,
  "health_rating": "good",
  "health_insights": ["insight1", "insight2"],
  "recommendations": ["recommendation1"],
  "personal_health_impacts": []
}

${health_profile ? generateHealthProfileContext(health_profile) : ''}

Provide realistic nutrition data and a health score 0-100. Be detailed and accurate.`,
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
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!textContent) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      )
    }

    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not parse analysis response' },
        { status: 500 }
      )
    }

    const analysis: NutritionData = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error in quick-analyze:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

function generateHealthProfileContext(profile: any): string {
  let context = 'User health profile: '
  const parts = []
  
  if (profile.allergies?.length) parts.push(`Allergies: ${profile.allergies.join(', ')}`)
  if (profile.intolerances?.length) parts.push(`Intolerances: ${profile.intolerances.join(', ')}`)
  if (profile.medical_conditions?.length) parts.push(`Medical Conditions: ${profile.medical_conditions.join(', ')}`)
  if (profile.dietary_lifestyles?.length) parts.push(`Dietary Lifestyle: ${profile.dietary_lifestyles.join(', ')}`)
  
  return context + parts.join(' | ')
}

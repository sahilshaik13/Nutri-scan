import { NextRequest, NextResponse } from 'next/server'

interface CalculateNutritionRequest {
  food_name: string
  initial_ingredients: string[]
  answers: Record<string, string>
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
    const body: CalculateNutritionRequest = await request.json()
    const { food_name, initial_ingredients, answers, health_profile } = body

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY environment variable' },
        { status: 500 }
      )
    }

    // Build context from user answers
    const answersContext = formatAnswers(answers)
    const healthContext = health_profile ? generateHealthProfileContext(health_profile) : 'No health profile provided'

    // Call Gemini to refine nutrition data based on answers
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
                text: `Based on the following information, calculate refined nutrition data:

Food: ${food_name}
Initial Ingredients: ${initial_ingredients.join(', ')}
User Answers: ${answersContext}
${healthContext}

Response must be valid JSON:
{
  "food_name": "exact name",
  "ingredients": ["ingredient1", "ingredient2"],
  "serving_size": "serving size",
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
  "health_insights": ["insight1"],
  "recommendations": ["recommendation1"],
  "personal_health_impacts": [
    {
      "condition": "condition name",
      "impact_level": "safe|caution|warning|danger",
      "explanation": "why this is important",
      "ingredients_of_concern": []
    }
  ]
}

Adjust values based on user answers for portion size, cooking method, and ingredients.
For health impacts, only include relevant conditions from: ${health_profile?.medical_conditions?.join(', ') || 'none'}
For allergies, check against: ${health_profile?.allergies?.join(', ') || 'none'}
Be realistic with calculations and provide actionable insights.`,
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
        { error: 'Failed to calculate nutrition' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!textContent) {
      return NextResponse.json(
        { error: 'No calculation generated' },
        { status: 500 }
      )
    }

    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not parse calculation response' },
        { status: 500 }
      )
    }

    const nutrition: NutritionData = JSON.parse(jsonMatch[0])
    return NextResponse.json(nutrition)
  } catch (error) {
    console.error('Error calculating nutrition:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Calculation failed' },
      { status: 500 }
    )
  }
}

function formatAnswers(answers: Record<string, string>): string {
  return Object.entries(answers)
    .filter(([, value]) => value && value !== 'Skipped')
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ') || 'No answers provided'
}

function generateHealthProfileContext(profile: any): string {
  const parts = ['Health Profile:']
  
  if (profile.allergies?.length) {
    parts.push(`Allergies: ${profile.allergies.join(', ')}`)
  }
  if (profile.intolerances?.length) {
    parts.push(`Intolerances: ${profile.intolerances.join(', ')}`)
  }
  if (profile.medical_conditions?.length) {
    parts.push(`Medical Conditions: ${profile.medical_conditions.join(', ')}`)
  }
  if (profile.dietary_lifestyles?.length) {
    parts.push(`Dietary Lifestyle: ${profile.dietary_lifestyles.join(', ')}`)
  }
  
  return parts.join(' | ') || 'No health profile provided'
}

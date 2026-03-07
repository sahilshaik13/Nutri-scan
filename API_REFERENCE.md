# NutriScan API Reference

## API Base URL

Development: `http://localhost:10000`
Production: Your deployed Vercel URL

## Endpoints

### 1. POST /api/analyze-image

**Purpose**: Analyze food image and return initial identification with 1-3 targeted follow-up questions.

**Request**:
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "mime_type": "image/jpeg",
  "health_profile": {
    "allergies": ["peanuts", "dairy"],
    "intolerances": ["lactose"],
    "medical_conditions": ["diabetes"],
    "dietary_lifestyles": ["vegetarian"]
  }
}
```

**Response** (Success):
```json
{
  "food_name": "Grilled Chicken Breast with Broccoli",
  "ingredients": ["chicken breast", "broccoli", "olive oil", "garlic", "salt"],
  "serving_size": "1 serving (6 oz chicken + 1 cup broccoli)",
  "confidence": "high",
  "is_labeled_product": false,
  "questions": [
    {
      "id": "q1",
      "question": "What size was your portion?",
      "type": "portion",
      "options": [
        "Small (4 oz chicken, 1/2 cup broccoli)",
        "Medium (6 oz chicken, 1 cup broccoli)",
        "Large (8 oz chicken, 1.5 cups broccoli)"
      ],
      "allow_specify": true,
      "specify_placeholder": "e.g., 180g chicken with 250g broccoli"
    },
    {
      "id": "q2",
      "question": "How much oil was used?",
      "type": "ingredient",
      "options": [
        "No oil (grilled without fat)",
        "Light (1 teaspoon)",
        "Moderate (1 tablespoon)"
      ],
      "allow_specify": true,
      "specify_placeholder": "e.g., 1.5 tablespoons"
    }
  ]
}
```

**Response** (Error):
```json
{
  "error": "Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY environment variable"
}
```

---

### 2. POST /api/quick-analyze

**Purpose**: Get complete nutrition analysis without requiring user questions.

**Request**:
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "mime_type": "image/jpeg",
  "health_profile": {
    "allergies": ["peanuts"],
    "intolerances": [],
    "medical_conditions": ["diabetes"],
    "dietary_lifestyles": ["low-carb"]
  }
}
```

**Response** (Success):
```json
{
  "food_name": "Caesar Salad",
  "ingredients": ["romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
  "serving_size": "2 cups",
  "calories": 280,
  "total_fat": 18,
  "saturated_fat": 4,
  "trans_fat": 0,
  "cholesterol": 25,
  "sodium": 650,
  "total_carbohydrates": 18,
  "dietary_fiber": 3,
  "total_sugars": 2,
  "added_sugars": 0,
  "protein": 12,
  "vitamin_d": 0,
  "calcium": 280,
  "iron": 1.5,
  "potassium": 320,
  "health_score": 72,
  "health_rating": "good",
  "health_insights": [
    "Good source of vitamins and minerals from lettuce",
    "Calcium content supports bone health",
    "Moderate calories for a complete meal"
  ],
  "recommendations": [
    "Consider reducing dressing for lower fat intake",
    "High sodium may affect blood pressure - monitor intake",
    "Add more vegetables for increased fiber"
  ],
  "personal_health_impacts": [
    {
      "condition": "Diabetes",
      "impact_level": "caution",
      "explanation": "Moderate carbohydrate content. Ensure proper portion control.",
      "ingredients_of_concern": ["croutons"]
    }
  ]
}
```

---

### 3. POST /api/calculate-nutrition

**Purpose**: Refine nutrition analysis based on user answers to follow-up questions.

**Request**:
```json
{
  "food_name": "Pad Thai",
  "initial_ingredients": ["rice noodles", "shrimp", "peanuts", "tamarind sauce", "lime", "eggs"],
  "answers": {
    "q1": "Medium (1.5 cups)",
    "q2": "Custom: 2 tablespoons peanut oil"
  },
  "health_profile": {
    "allergies": ["peanuts"],
    "intolerances": [],
    "medical_conditions": [],
    "dietary_lifestyles": []
  }
}
```

**Response** (Success):
```json
{
  "food_name": "Pad Thai (Medium Portion)",
  "ingredients": [
    "rice noodles - 1.5 cups",
    "shrimp - 6 oz",
    "peanuts - 2 tablespoons",
    "tamarind sauce - 2 tablespoons",
    "lime - 1/2",
    "eggs - 1 large",
    "peanut oil - 2 tablespoons"
  ],
  "serving_size": "1.5 cups",
  "calories": 520,
  "total_fat": 28,
  "saturated_fat": 8,
  "trans_fat": 0,
  "cholesterol": 190,
  "sodium": 1200,
  "total_carbohydrates": 52,
  "dietary_fiber": 4,
  "total_sugars": 8,
  "added_sugars": 2,
  "protein": 22,
  "vitamin_d": 2,
  "calcium": 120,
  "iron": 3.5,
  "potassium": 480,
  "health_score": 58,
  "health_rating": "moderate",
  "health_insights": [
    "Good protein content from shrimp and eggs",
    "High in omega-3 fatty acids from shrimp",
    "Contains antioxidants from tamarind"
  ],
  "recommendations": [
    "High sodium content - consider reducing sauce",
    "Balance with vegetables for more fiber",
    "High fat content - monitor portion frequency"
  ],
  "personal_health_impacts": [
    {
      "condition": "Peanut Allergy",
      "impact_level": "danger",
      "explanation": "Contains 2 tablespoons of peanuts and peanut oil. AVOID this meal.",
      "ingredients_of_concern": ["peanuts", "peanut oil"]
    }
  ]
}
```

---

## Response Format Details

### NutritionData Structure
```typescript
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
  health_score: number (0-100)
  health_rating: string ("excellent" | "good" | "moderate" | "poor" | "very poor")
  health_insights: string[]
  recommendations: string[]
  personal_health_impacts?: PersonalHealthImpact[]
}
```

### PersonalHealthImpact Structure
```typescript
interface PersonalHealthImpact {
  condition: string
  impact_level: "safe" | "caution" | "warning" | "danger"
  explanation: string
  ingredients_of_concern: string[]
}
```

### Question Structure
```typescript
interface Question {
  id: string
  question: string
  type?: "portion" | "ingredient" | "cooking" | string
  options: string[]
  allow_specify?: boolean
  specify_placeholder?: string
}
```

---

## Health Impact Levels

| Level | Color | Usage |
|-------|-------|-------|
| **safe** | Green | Food is safe for this condition |
| **caution** | Yellow | Some concern, monitor portions |
| **warning** | Orange | Significant concern, minimize intake |
| **danger** | Red | UNSAFE for this condition, avoid completely |

---

## Health Score Ranges

| Score | Rating | Color | Meaning |
|-------|--------|-------|---------|
| 80-100 | Excellent | Green | Highly nutritious |
| 60-79 | Good | Blue | Balanced nutrition |
| 40-59 | Moderate | Yellow | Some concerns |
| 20-39 | Poor | Orange | Many concerns |
| 0-19 | Very Poor | Red | Very unhealthy |

---

## Error Responses

### Missing API Key
```json
{
  "error": "Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY environment variable"
}
```

### Invalid Image
```json
{
  "error": "Failed to analyze image"
}
```

### API Rate Limit
```json
{
  "error": "API rate limit exceeded. Try again later."
}
```

### Missing Required Field
```json
{
  "error": "Missing image data"
}
```

---

## Usage Examples

### JavaScript/Node.js
```javascript
const response = await fetch('/api/analyze-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image_base64: base64String,
    mime_type: 'image/jpeg',
    health_profile: {
      allergies: ['peanuts'],
      intolerances: [],
      medical_conditions: ['diabetes'],
      dietary_lifestyles: []
    }
  })
})

const data = await response.json()
console.log(data)
```

### React Hook
```javascript
const [analysis, setAnalysis] = useState(null)

async function analyzeFood(imageBase64) {
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: imageBase64,
      mime_type: 'image/jpeg',
      health_profile: userHealthProfile
    })
  })
  
  const data = await response.json()
  setAnalysis(data)
}
```

### cURL
```bash
curl -X POST http://localhost:3000/api/analyze-image \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "iVBORw0KGgo...",
    "mime_type": "image/jpeg",
    "health_profile": {
      "allergies": ["peanuts"],
      "intolerances": [],
      "medical_conditions": ["diabetes"],
      "dietary_lifestyles": []
    }
  }'
```

---

## Rate Limiting & Quotas

- **Gemini API**: Depends on your billing tier
- **Database**: Supabase free tier allows ~200K/month
- **Vercel**: Free tier allows 100 requests/second

Monitor usage in:
- Google Cloud Console (Generative Language API)
- Supabase Dashboard (SQL Editor)
- Vercel Analytics (Functions)

---

## Troubleshooting

### API Returns 500
1. Check Gemini API key is set
2. Verify image is valid JPEG/PNG
3. Check Gemini API is enabled in Google Cloud
4. Review Vercel logs for full error

### API Returns 403
1. Verify API key has correct permissions
2. Check Google Cloud project billing
3. Ensure API is whitelisted

### Slow Response Times
1. Image too large - resize to < 5MB
2. Supabase connection slow - check network
3. Gemini API rate limit - implement backoff

---

## Support

For API issues:
1. Check logs in Vercel dashboard
2. Review full error message
3. Refer to Google Gemini docs
4. Check database logs in Supabase

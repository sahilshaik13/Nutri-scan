import fastapi
import fastapi.middleware.cors
from pydantic import BaseModel
import httpx
import os
import json
import re
import asyncio
import uuid
from typing import Any, Optional
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging

# Load the variables from the .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__) 

app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Safely allow Vercel, Localhost, or any branch preview
    allow_credentials=False,  # CRITICAL: Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API configuration
API_KEYS = [
    os.environ.get("GEMINI_API_KEY_1"),
    os.environ.get("GEMINI_API_KEY_2"),
    os.environ.get("GEMINI_API_KEY_3"),
    os.environ.get("GEMINI_API_KEY_4"),
]
# Clean the list to remove any None values if you haven't set all 4 yet
VALID_API_KEYS = [key for key in API_KEYS if key]
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    health_profile: dict | None = None

class FollowUpRequest(BaseModel):
    food_name: str
    initial_ingredients: list[str]
    answers: dict[str, str]
    health_profile: dict | None = None

class QuickAnalyzeRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    health_profile: dict | None = None
    guest_id: Optional[str] = None  # For guest user tracking

# In-memory guest session store (replace with database in production)
GUEST_SESSIONS = {}

# --- Helper Functions ---

def parse_json_response(response_text: str) -> dict:
    """Extract and parse JSON from response text"""
    # Using format strings to avoid markdown parser issues with triple backticks
    pattern = r"`{3}" + r"(?:json)?\s*([\s\S]*?)\s*" + r"`{3}"
    json_match = re.search(pattern, response_text)
    if json_match:
        response_text = json_match.group(1)
    
    response_text = response_text.strip()
    return json.loads(response_text)

def build_health_context(health_profile: dict | None) -> str:
    """Build health profile context string for prompts"""
    if not health_profile:
        return ""
    
    profile_parts = []
    if health_profile.get('allergies'):
        profile_parts.append(f"- Allergies: {', '.join(health_profile['allergies'])}")
    if health_profile.get('intolerances'):
        profile_parts.append(f"- Intolerances: {', '.join(health_profile['intolerances'])}")
    if health_profile.get('medical_conditions'):
        profile_parts.append(f"- Medical Conditions: {', '.join(health_profile['medical_conditions'])}")
    if health_profile.get('dietary_lifestyles'):
        profile_parts.append(f"- Dietary Preferences: {', '.join(health_profile['dietary_lifestyles'])}")
    
    if profile_parts:
        return "\n\nUser Health Profile:\n" + "\n".join(profile_parts)
    return ""

async def call_gemini_api(contents: list, max_retries: int = 2) -> str:
    """Call Gemini API with automatic Key Rotation and retry logic"""
    if not VALID_API_KEYS:
        raise fastapi.HTTPException(status_code=500, detail="No GEMINI_API_KEYS configured")
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "topK": 32,
            "topP": 1,
            "maxOutputTokens": 8192,
        }
    }
    
    last_error = None
    
    # Outer Loop: Try each key one by one
    for key_index, current_key in enumerate(VALID_API_KEYS):
        url = f"{GEMINI_API_URL}?key={current_key}"
        
        # Inner Loop: Retry network hiccups for the current key
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(url, json=payload)
                    
                    # 429 = Rate Limit / Quota Exhausted
                    if response.status_code == 429:
                        print(f"Key {key_index + 1} hit rate limit (429). Rotating to next key...")
                        break # Break inner loop to switch to the NEXT API key
                    
                    # Other API errors (e.g. 400 Bad Request)
                    if response.status_code != 200:
                        last_error = f"API Error {response.status_code}: {response.text}"
                        print(f"Key {key_index + 1} failed: {response.status_code}. Rotating...")
                        break
                    
                    # Success! Parse and return.
                    result = response.json()
                    
                    # Catch sneaky quota errors hidden inside a 200 OK
                    if "error" in result:
                        print(f"Key {key_index + 1} returned an embedded error. Rotating...")
                        break

                    if "candidates" not in result or not result["candidates"]:
                        raise fastapi.HTTPException(status_code=500, detail="Empty response from Gemini")
                    
                    return result["candidates"][0]["content"]["parts"][0]["text"]
                    
            except httpx.TimeoutException:
                last_error = "Request timed out"
                await asyncio.sleep(2)
            except Exception as e:
                last_error = str(e)
                await asyncio.sleep(2)
                
    # If we get here, the code has looped through ALL keys and failed
    raise fastapi.HTTPException(
        status_code=429, 
        detail=f"Overloaded: All {len(VALID_API_KEYS)} API keys have exhausted their limits."
    )

# --- Endpoints ---

@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {"status": "ok", "gemini_configured": len(VALID_API_KEYS) > 0}

@app.post("/api/guest/session")
async def create_guest_session():
    """Create a new guest session for unauthenticated users"""
    guest_id = str(uuid.uuid4())
    GUEST_SESSIONS[guest_id] = {
        "id": guest_id,
        "scans": [],
        "created_at": asyncio.get_event_loop().time(),
    }
    logger.info(f"[v0] Created guest session: {guest_id}")
    return {"guest_id": guest_id}

@app.get("/api/guest/session/{guest_id}")
async def get_guest_session(guest_id: str):
    """Retrieve guest session data"""
    if guest_id not in GUEST_SESSIONS:
        raise fastapi.HTTPException(status_code=404, detail="Guest session not found")
    logger.info(f"[v0] Retrieved guest session: {guest_id}")
    return GUEST_SESSIONS[guest_id]

@app.post("/api/guest/session/{guest_id}/scan")
async def save_guest_scan(guest_id: str, scan_data: dict):
    """Save a scan to guest session"""
    if guest_id not in GUEST_SESSIONS:
        raise fastapi.HTTPException(status_code=404, detail="Guest session not found")
    
    GUEST_SESSIONS[guest_id]["scans"].append(scan_data)
    logger.info(f"[v0] Saved scan for guest: {guest_id}")
    return {"success": True, "scan_count": len(GUEST_SESSIONS[guest_id]["scans"])}

@app.get("/api/ping")
async def ping():
    """
    Lightweight endpoint specifically designed for cron jobs.
    Returns a tiny payload to keep the server awake without burning resources.
    """
    return {"ping": "pong", "status": "awake"}

@app.get("/api/test-keys")
async def test_keys():
    """Admin endpoint to check the quota status of all configured keys."""
    results = {}
    
    # Minimal payload to save quota during tests
    payload = {
        "contents": [{"parts": [{"text": "Say 'ok'"}]}],
        "generationConfig": {"maxOutputTokens": 5}
    }
    
    for i, key in enumerate(VALID_API_KEYS):
        # Safely mask the key so we can print it without exposing your credentials
        masked_key = f"{key[:5]}...{key[-4:]}" if len(key) > 10 else "InvalidKey"
        url = f"{GEMINI_API_URL}?key={key}"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)
                
                # Print exactly what Google replies with in your terminal!
                print(f"\n--- Testing Key {i+1} ({masked_key}) ---")
                print(f"Status Code: {response.status_code}")
                print(f"Response Body: {response.text}")
                print("-----------------------------------")
                
                if response.status_code == 200:
                    # Double check if Google hid a quota error in the JSON
                    if "QUOTA" in response.text.upper() or "RATE_LIMIT" in response.text.upper():
                        results[f"Key_{i+1}"] = "Exhausted 🔴 (Hidden Quota Error)"
                    else:
                        results[f"Key_{i+1}"] = "Healthy 🟢"
                elif response.status_code == 429:
                    results[f"Key_{i+1}"] = "Exhausted 🔴 (429 Rate Limit)"
                else:
                    results[f"Key_{i+1}"] = f"Error {response.status_code} 🟡"
                    
        except Exception as e:
            print(f"Exception on Key {i+1}: {str(e)}")
            results[f"Key_{i+1}"] = f"Network Error 🔴"
            
    return {"key_status": results}

@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    """Initial food/label analysis to identify product and ingredients"""
    try:
        health_context = build_health_context(request.health_profile)
        
        prompt = f"""Analyze this image. It is either a photo of prepared food or a Nutrition Facts label from a product.

1. **Identify the Product**: Try to find the specific brand or product name (especially if it's a label). 
2. **Determine Ingredients**: List likely ingredients (from the 'Ingredients' list on a label or inferred from a food photo).
3. **Serving Size**: Extract or estimate the serving size.

{health_context}

Respond in JSON format only (no markdown):
{{
    "food_name": "Specific brand/product name OR dish name",
    "is_labeled_product": true/false,
    "ingredients": ["ingredient1", "ingredient2", ...],
    "serving_size": "extracted or approximate size",
    "confidence": "high/medium/low",
    "questions": [
        {{
            "id": "q_identity",
            "question": "I can see the nutrition facts, but what is the name of this specific food product?",
            "type": "multiple_choice",
            "options": ["Oikos Greek Yogurt", "Chobani Greek Yogurt", "Fage Total", "Store Brand"],
            "allow_specify": true,
            "specify_placeholder": "Enter exact name..."
        }}
    ]
}}

**CRITICAL LOGIC**:
- You MUST provide 2-4 plausible, realistic `options` for EVERY question you generate so the user can quickly select one.
- If the image is a Nutrition Facts label and you CANNOT see the product name clearly, you MUST include the "q_identity" question.
- ALWAYS include 2-3 additional questions about weight/portion, preparation method, or specific ingredients.
"""
        
        contents = [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": request.mime_type,
                        "data": request.image_base64
                    }
                }
            ]
        }]
        
        response_text = await call_gemini_api(contents)
        result = parse_json_response(response_text)
        return result
        
    except fastapi.HTTPException:
        raise
    except Exception as e:
        raise fastapi.HTTPException(status_code=500, detail=str(e))
        
@app.post("/api/calculate-nutrition")
async def calculate_nutrition(request: FollowUpRequest):
    """Calculate detailed nutrition based on food identification and user answers"""
    try:
        answers_text = "\n".join([f"- {k}: {v}" for k, v in request.answers.items()])
        health_context = build_health_context(request.health_profile)
        
        personalized_prompt = ""
        if request.health_profile:
            conditions = []
            if request.health_profile.get('allergies'):
                conditions.extend(request.health_profile['allergies'])
            if request.health_profile.get('intolerances'):
                conditions.extend(request.health_profile['intolerances'])
            if request.health_profile.get('medical_conditions'):
                conditions.extend(request.health_profile['medical_conditions'])
            if request.health_profile.get('dietary_lifestyles'):
                conditions.extend(request.health_profile['dietary_lifestyles'])
            
            if conditions:
                personalized_prompt = f"""
CRITICAL: The user has the following health conditions/preferences: {', '.join(conditions)}

You MUST analyze how this specific food affects their conditions and include in your response:
- "personal_health_impacts": An array of objects, each with:
  - "condition": the specific allergy/intolerance/medical condition/dietary preference
  - "impact_level": "safe", "caution", "warning", or "danger"
  - "explanation": detailed explanation of how this food affects this condition
  - "ingredients_of_concern": list of specific ingredients that trigger this concern

For example, if user has "Diabetes" and food has sugar:
{{"condition": "Diabetes", "impact_level": "caution", "explanation": "This food contains 15g of sugar which may spike blood glucose levels. Consider eating with protein to slow absorption.", "ingredients_of_concern": ["sugar", "refined flour"]}}

Be very specific and medically accurate. Flag ALL relevant concerns."""
        
        prompt = f"""Based on the following food analysis, provide detailed nutritional information:

Food: {request.food_name}
Identified Ingredients: {', '.join(request.initial_ingredients)}

User's answers to clarifying questions:
{answers_text}
{health_context}
{personalized_prompt}

Provide accurate nutritional estimates in JSON format only (no markdown, no code blocks):
{{
    "food_name": "{request.food_name}",
    "ingredients": ["final list of ingredients with specific types based on user answers"],
    "serving_size": "estimated serving size based on user's answer",
    "calories": number,
    "total_fat": grams as number,
    "saturated_fat": grams as number,
    "trans_fat": grams as number,
    "cholesterol": mg as number,
    "sodium": mg as number,
    "total_carbohydrates": grams as number,
    "dietary_fiber": grams as number,
    "total_sugars": grams as number,
    "added_sugars": grams as number,
    "protein": grams as number,
    "vitamin_d": mcg as number,
    "calcium": mg as number,
    "iron": mg as number,
    "potassium": mg as number,
    "health_score": 1-100 (100 being healthiest, consider user's health conditions),
    "health_rating": "Excellent/Good/Moderate/Poor/Very Poor",
    "health_insights": ["insight1", "insight2", "insight3"],
    "recommendations": ["recommendation1", "recommendation2"],
    "personal_health_impacts": [
        {{
            "condition": "condition name",
            "impact_level": "safe/caution/warning/danger",
            "explanation": "detailed explanation",
            "ingredients_of_concern": ["ingredient1", "ingredient2"]
        }}
    ]
}}

Be realistic with the nutritional values based on the specific portion size and preparation methods mentioned."""
        
        contents = [{"parts": [{"text": prompt}]}]
        
        response_text = await call_gemini_api(contents)
        result = parse_json_response(response_text)
        return result
        
    except fastapi.HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise fastapi.HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise fastapi.HTTPException(status_code=500, detail=str(e))

@app.post("/api/quick-analyze")
async def quick_analyze(request: QuickAnalyzeRequest):
    """Quick analysis that combines image analysis and nutrition calculation"""
    try:
        health_context = build_health_context(request.health_profile)
        
        personalized_prompt = ""
        if request.health_profile:
            conditions = []
            if request.health_profile.get('allergies'):
                conditions.extend(request.health_profile['allergies'])
            if request.health_profile.get('intolerances'):
                conditions.extend(request.health_profile['intolerances'])
            if request.health_profile.get('medical_conditions'):
                conditions.extend(request.health_profile['medical_conditions'])
            if request.health_profile.get('dietary_lifestyles'):
                conditions.extend(request.health_profile['dietary_lifestyles'])
            
            if conditions:
                personalized_prompt = f"""
CRITICAL: The user has the following health conditions/preferences: {', '.join(conditions)}

You MUST analyze how this specific food affects their conditions and include "personal_health_impacts" array with objects containing:
- "condition": the specific condition
- "impact_level": "safe", "caution", "warning", or "danger"  
- "explanation": detailed explanation
- "ingredients_of_concern": list of problematic ingredients"""
        
        prompt = f"""Analyze this food image and provide complete nutritional information.
{health_context}
{personalized_prompt}

Respond in JSON format only (no markdown, no code blocks):
{{
    "food_name": "name of the dish",
    "ingredients": ["ingredient1", "ingredient2", ...],
    "serving_size": "estimated serving size",
    "calories": number,
    "total_fat": grams as number,
    "saturated_fat": grams as number,
    "trans_fat": grams as number,
    "cholesterol": mg as number,
    "sodium": mg as number,
    "total_carbohydrates": grams as number,
    "dietary_fiber": grams as number,
    "total_sugars": grams as number,
    "added_sugars": grams as number,
    "protein": grams as number,
    "vitamin_d": mcg as number,
    "calcium": mg as number,
    "iron": mg as number,
    "potassium": mg as number,
    "health_score": 1-100 (100 being healthiest),
    "health_rating": "Excellent/Good/Moderate/Poor/Very Poor",
    "health_insights": ["insight1", "insight2", "insight3"],
    "recommendations": ["recommendation1", "recommendation2"],
    "personal_health_impacts": [
        {{
            "condition": "condition name",
            "impact_level": "safe/caution/warning/danger",
            "explanation": "detailed explanation",
            "ingredients_of_concern": ["ingredient1", "ingredient2"]
        }}
    ]
}}

Be realistic with nutritional values. The health score should reflect overall nutritional quality considering the user's health profile."""
        
        contents = [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": request.mime_type,
                        "data": request.image_base64
                    }
                }
            ]
        }]
        
        response_text = await call_gemini_api(contents)
        result = parse_json_response(response_text)
        return result
        
    except fastapi.HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise fastapi.HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise fastapi.HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import base64
import json
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Environment Variables (placeholders for API keys)
GEMINI_PRO_API_KEY = os.environ.get('GEMINI_PRO_API_KEY', 'YOUR_GEMINI_PRO_KEY_HERE')
GEMINI_VISION_API_KEY = os.environ.get('GEMINI_VISION_API_KEY', 'YOUR_GEMINI_VISION_KEY_HERE')
VERTEX_AI_API_KEY = os.environ.get('VERTEX_AI_API_KEY', 'YOUR_VERTEX_AI_KEY_HERE')
GOOGLE_TRANSLATE_API_KEY = os.environ.get('GOOGLE_TRANSLATE_API_KEY', 'YOUR_TRANSLATE_KEY_HERE')

# Define Models
class CropDiseaseAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_base64: str
    disease_name: str
    confidence: float
    treatment: str
    treatment_hi: str  # Hindi translation
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MarketPrice(BaseModel):
    crop_name: str
    crop_name_local: str
    msp_price: float
    mandi_price: float
    profit_margin: float
    recommendation: str
    recommendation_local: str

class GovernmentScheme(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_local: str
    description: str
    description_local: str
    eligibility: str
    eligibility_local: str
    link: str

class FarmTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_name: str
    task_name_local: str
    description: str
    description_local: str
    due_date: str
    priority: str
    completed: bool = False

class TranslationRequest(BaseModel):
    text: str
    target_language: str

class VoiceRequest(BaseModel):
    audio_base64: str
    language: str

# MOCK API FUNCTIONS (Replace these when you add your API keys)

async def mock_gemini_vision_analysis(image_base64: str) -> Dict[str, Any]:
    """Mock function for Gemini Vision API - Replace with actual API call"""
    # Simulated crop disease analysis
    diseases = [
        {"name": "Early Blight", "confidence": 92, "treatment": "Apply Mancozeb-based fungicide spray every 10-15 days", "treatment_hi": "हर 10-15 दिन में मैंकोजेब आधारित कवकनाशी छिड़काव करें"},
        {"name": "Leaf Spot", "confidence": 87, "treatment": "Use copper sulfate solution and improve air circulation", "treatment_hi": "कॉपर सल्फेट घोल का उपयोग करें और हवा का संचार सुधारें"},
        {"name": "Powdery Mildew", "confidence": 78, "treatment": "Apply sulfur-based fungicide and reduce humidity", "treatment_hi": "सल्फर आधारित कवकनाशी लगाएं और नमी कम करें"},
        {"name": "Healthy", "confidence": 95, "treatment": "Crop appears healthy. Continue regular monitoring", "treatment_hi": "फसल स्वस्थ दिखती है। नियमित निगरानी जारी रखें"}
    ]
    
    import random
    selected_disease = random.choice(diseases)
    
    return {
        "disease_name": selected_disease["name"],
        "confidence": selected_disease["confidence"],
        "treatment": selected_disease["treatment"],
        "treatment_hi": selected_disease["treatment_hi"]
    }

async def mock_gemini_pro_recommendation(prompt: str, language: str = "en") -> str:
    """Mock function for Gemini Pro API - Replace with actual API call"""
    recommendations = {
        "market": "Based on current market trends, wait 2-3 days before selling. Prices expected to rise by 8-12%",
        "market_hi": "वर्तमान बाजार रुझान के आधार पर, बेचने से पहले 2-3 दिन प्रतीक्षा करें। कीमतों में 8-12% वृद्धि की उम्मीद है",
        "farming": "For optimal growth, ensure adequate water supply and apply organic fertilizer every 15 days",
        "farming_hi": "इष्टतम वृद्धि के लिए, पर्याप्त पानी की आपूर्ति सुनिश्चित करें और हर 15 दिन में जैविक उर्वरक डालें"
    }
    
    if "market" in prompt.lower() or "price" in prompt.lower():
        return recommendations["market_hi"] if language == "hi" else recommendations["market"]
    else:
        return recommendations["farming_hi"] if language == "hi" else recommendations["farming"]

async def mock_translate_text(text: str, target_language: str) -> str:
    """Mock function for Google Translate API - Replace with actual API call"""
    # Sample translations for common farming terms
    translations = {
        "hi": {
            "Crop Disease Detection": "फसल रोग का पता लगाना",
            "Market Prices": "बाजार की कीमतें",
            "Government Schemes": "सरकारी योजनाएं",
            "My Farm": "मेरा खेत",
            "Upload Image": "चित्र अपलोड करें",
            "Capture Photo": "फोटो लें",
            "Healthy": "स्वस्थ",
            "Treatment": "उपचार",
            "Recommendation": "सिफारिश"
        },
        "ta": {
            "Crop Disease Detection": "பயிர் நோய் கண்டறிதல்",
            "Market Prices": "சந்தை விலைகள்",
            "Government Schemes": "அரசு திட்டங்கள்",
            "My Farm": "என் பண்ணை"
        }
    }
    
    return translations.get(target_language, {}).get(text, f"[Translated: {text}]")

async def mock_speech_to_text(audio_base64: str, language: str) -> str:
    """Mock function for Vertex AI STT - Replace with actual API call"""
    mock_responses = {
        "hi": "मुझे टमाटर की बीमारी के बारे में बताइए",
        "en": "Tell me about tomato diseases",
        "ta": "தக்காளி நோய்கள் பற்றி சொல்லுங்கள்"
    }
    return mock_responses.get(language, "Audio transcription not available")

async def mock_text_to_speech(text: str, language: str) -> str:
    """Mock function for Vertex AI TTS - Replace with actual API call"""
    # Return base64 encoded audio placeholder
    return "UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAC"  # Placeholder audio

# STATE-WISE MSP DATA - Complete Indian Agricultural States
STATE_MSP_DATA = {
    "Uttar Pradesh": [
        {"name": "Wheat", "name_hi": "गेहूं", "name_local": "गेहूं", "msp": 2275, "mandi": 2200},
        {"name": "Rice", "name_hi": "चावल", "name_local": "चावल", "msp": 2183, "mandi": 2100},
        {"name": "Sugarcane", "name_hi": "गन्ना", "name_local": "गन्ना", "msp": 315, "mandi": 310},
        {"name": "Potato", "name_hi": "आलू", "name_local": "आलू", "msp": 2500, "mandi": 2400}
    ],
    "Maharashtra": [
        {"name": "Jowar", "name_hi": "ज्वार", "name_local": "ज्वार", "msp": 3000, "mandi": 2850},
        {"name": "Bajra", "name_hi": "बाजरा", "name_local": "बाजरा", "msp": 2000, "mandi": 1950},
        {"name": "Soybean", "name_hi": "सोयाबीन", "name_local": "सोयाबीन", "msp": 4300, "mandi": 4150},
        {"name": "Cotton", "name_hi": "कपास", "name_local": "कापूस", "msp": 6080, "mandi": 5900},
        {"name": "Onion", "name_hi": "प्याज", "name_local": "कांदा", "msp": 2800, "mandi": 2650}
    ],
    "Punjab": [
        {"name": "Wheat", "name_hi": "गेहूं", "name_local": "ਕਣਕ", "msp": 2275, "mandi": 2200},
        {"name": "Rice", "name_hi": "चावल", "name_local": "ਚੌਲ", "msp": 2183, "mandi": 2100},
        {"name": "Mustard", "name_hi": "सरसों", "name_local": "ਸਰ੍ਹੋਂ", "msp": 5050, "mandi": 4900},
        {"name": "Maize", "name_hi": "मक्का", "name_local": "ਮੱਕੀ", "msp": 1962, "mandi": 1850}
    ],
    "Rajasthan": [
        {"name": "Bajra", "name_hi": "बाजरा", "name_local": "बाजरा", "msp": 2000, "mandi": 1950},
        {"name": "Mustard", "name_hi": "सरसों", "name_local": "सरसों", "msp": 5050, "mandi": 4900},
        {"name": "Barley", "name_hi": "जौ", "name_local": "जौ", "msp": 1735, "mandi": 1680},
        {"name": "Cumin", "name_hi": "जीरा", "name_local": "जीरा", "msp": 25000, "mandi": 24500}
    ],
    "Madhya Pradesh": [
        {"name": "Wheat", "name_hi": "गेहूं", "name_local": "गेहूं", "msp": 2275, "mandi": 2200},
        {"name": "Soybean", "name_hi": "सोयाबीन", "name_local": "सोयाबीन", "msp": 4300, "mandi": 4150},
        {"name": "Cotton", "name_hi": "कपास", "name_local": "कपास", "msp": 6080, "mandi": 5900},
        {"name": "Gram", "name_hi": "चना", "name_local": "चना", "msp": 5335, "mandi": 5200}
    ],
    "Gujarat": [
        {"name": "Cotton", "name_hi": "कपास", "name_local": "કપાસ", "msp": 6080, "mandi": 5900},
        {"name": "Groundnut", "name_hi": "मूंगफली", "name_local": "મગફળી", "msp": 5850, "mandi": 5700},
        {"name": "Bajra", "name_hi": "बाजरा", "name_local": "બાજરી", "msp": 2000, "mandi": 1950},
        {"name": "Cumin", "name_hi": "जीरा", "name_local": "જીરું", "msp": 25000, "mandi": 24500}
    ],
    "Haryana": [
        {"name": "Wheat", "name_hi": "गेहूं", "name_local": "गेहूं", "msp": 2275, "mandi": 2200},
        {"name": "Rice", "name_hi": "चावल", "name_local": "चावल", "msp": 2183, "mandi": 2100},
        {"name": "Mustard", "name_hi": "सरसों", "name_local": "सरसों", "msp": 5050, "mandi": 4900},
        {"name": "Cotton", "name_hi": "कपास", "name_local": "कपास", "msp": 6080, "mandi": 5900}
    ],
    "Karnataka": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "ಅಕ್ಕಿ", "msp": 2183, "mandi": 2100},
        {"name": "Ragi", "name_hi": "रागी", "name_local": "ರಾಗಿ", "msp": 3578, "mandi": 3450},
        {"name": "Cotton", "name_hi": "कपास", "name_local": "ಹತ್ತಿ", "msp": 6080, "mandi": 5900},
        {"name": "Sugarcane", "name_hi": "गन्ना", "name_local": "ಕಬ್ಬು", "msp": 315, "mandi": 310}
    ],
    "Andhra Pradesh": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "వరి", "msp": 2183, "mandi": 2100},
        {"name": "Cotton", "name_hi": "कपास", "name_local": "పత్తి", "msp": 6080, "mandi": 5900},
        {"name": "Groundnut", "name_hi": "मूंगफली", "name_local": "వేరుశెనగ", "msp": 5850, "mandi": 5700},
        {"name": "Chili", "name_hi": "मिर्च", "name_local": "మిర్చి", "msp": 8000, "mandi": 7800}
    ],
    "Telangana": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "వరి", "msp": 2183, "mandi": 2100},
        {"name": "Cotton", "name_hi": "कपास", "name_local": "పత్తి", "msp": 6080, "mandi": 5900},
        {"name": "Maize", "name_hi": "मक्का", "name_local": "మొక్కజొన్న", "msp": 1962, "mandi": 1850},
        {"name": "Turmeric", "name_hi": "हल्दी", "name_local": "పసుపు", "msp": 15000, "mandi": 14500}
    ],
    "Tamil Nadu": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "அரிசி", "msp": 2183, "mandi": 2100},
        {"name": "Sugarcane", "name_hi": "गन्ना", "name_local": "கரும்பு", "msp": 315, "mandi": 310},
        {"name": "Cotton", "name_hi": "कपास", "name_local": "பருத்தி", "msp": 6080, "mandi": 5900},
        {"name": "Groundnut", "name_hi": "मूंगफली", "name_local": "நிலக்கடலை", "msp": 5850, "mandi": 5700}
    ],
    "West Bengal": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "ধান", "msp": 2183, "mandi": 2100},
        {"name": "Jute", "name_hi": "जूट", "name_local": "পাট", "msp": 4750, "mandi": 4600},
        {"name": "Potato", "name_hi": "आलू", "name_local": "আলু", "msp": 2500, "mandi": 2400},
        {"name": "Mustard", "name_hi": "सरसों", "name_local": "সরিষা", "msp": 5050, "mandi": 4900}
    ],
    "Bihar": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "चावल", "msp": 2183, "mandi": 2100},
        {"name": "Wheat", "name_hi": "गेहूं", "name_local": "गेहूं", "msp": 2275, "mandi": 2200},
        {"name": "Maize", "name_hi": "मक्का", "name_local": "मक्का", "msp": 1962, "mandi": 1850},
        {"name": "Sugarcane", "name_hi": "गन्ना", "name_local": "गन्ना", "msp": 315, "mandi": 310}
    ],
    "Odisha": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "ଚାଉଳ", "msp": 2183, "mandi": 2100},
        {"name": "Groundnut", "name_hi": "मूंगफली", "name_local": "ମୁଗଫଳି", "msp": 5850, "mandi": 5700},
        {"name": "Sesame", "name_hi": "तिल", "name_local": "ତିଳ", "msp": 7307, "mandi": 7100},
        {"name": "Turmeric", "name_hi": "हल्दी", "name_local": "ହଳଦୀ", "msp": 15000, "mandi": 14500}
    ],
    "Kerala": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "അരി", "msp": 2183, "mandi": 2100},
        {"name": "Coconut", "name_hi": "नारियल", "name_local": "തെങ്ങ്", "msp": 12000, "mandi": 11500},
        {"name": "Rubber", "name_hi": "रबर", "name_local": "റബ്ബർ", "msp": 18000, "mandi": 17500},
        {"name": "Pepper", "name_hi": "काली मिर्च", "name_local": "കുരുമുളക്", "msp": 65000, "mandi": 63000}
    ],
    "Assam": [
        {"name": "Rice", "name_hi": "चावल", "name_local": "ধান", "msp": 2183, "mandi": 2100},
        {"name": "Tea", "name_hi": "चाय", "name_local": "চাহ", "msp": 35, "mandi": 32},
        {"name": "Jute", "name_hi": "जूट", "name_local": "পাট", "msp": 4750, "mandi": 4600},
        {"name": "Mustard", "name_hi": "सरसों", "name_local": "সৰিয়হ", "msp": 5050, "mandi": 4900}
    ]
}

GOVERNMENT_SCHEMES = [
    {
        "name": "PM-KISAN",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
        "description": "Direct income support of Rs 6,000 per year to small and marginal farmers",
        "description_hi": "छोटे और सीमांत किसानों को प्रति वर्ष 6,000 रुपये की प्रत्यक्ष आय सहायता",
        "eligibility": "Small and marginal farmers with landholding up to 2 hectares",
        "eligibility_hi": "2 हेक्टेयर तक भूमि वाले छोटे और सीमांत किसान",
        "link": "https://www.pmkisan.gov.in/"
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना",
        "description": "Crop insurance scheme providing financial support against crop loss",
        "description_hi": "फसल नुकसान के विरुद्ध वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना",
        "eligibility": "All farmers growing crops in notified areas",
        "eligibility_hi": "अधिसूचित क्षेत्रों में फसल उगाने वाले सभी किसान",
        "link": "https://pmfby.gov.in/"
    }
]

# API Routes

@api_router.get("/")
async def root():
    return {"message": "Kisan AI Backend - Voice-first Agricultural Assistant"}

@api_router.post("/analyze-crop-disease")
async def analyze_crop_disease(
    image_base64: str = Form(...),
    language: str = Form(default="en")
):
    """Analyze crop disease from uploaded image using Gemini Vision"""
    try:
        # Mock analysis - Replace with actual Gemini Vision API call
        analysis = await mock_gemini_vision_analysis(image_base64)
        
        # Save to database
        disease_record = CropDiseaseAnalysis(
            image_base64=image_base64,
            disease_name=analysis["disease_name"],
            confidence=analysis["confidence"],
            treatment=analysis["treatment"],
            treatment_hi=analysis["treatment_hi"]
        )
        
        await db.crop_analyses.insert_one(disease_record.dict())
        
        return {
            "success": True,
            "analysis": {
                "disease_name": analysis["disease_name"],
                "confidence": analysis["confidence"],
                "treatment": analysis["treatment"],
                "treatment_local": analysis["treatment_hi"] if language == "hi" else analysis["treatment"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.get("/market-prices/{state}")
async def get_market_prices(state: str, language: str = "en"):
    """Get MSP and mandi prices for crops by state"""
    try:
        crops_data = STATE_MSP_DATA.get(state, [])
        if not crops_data:
            raise HTTPException(status_code=404, detail="State not found")
        
        market_prices = []
        for crop in crops_data:
            profit_margin = ((crop["mandi"] - crop["msp"]) / crop["msp"]) * 100
            recommendation = await mock_gemini_pro_recommendation(f"market price for {crop['name']}", language)
            
            market_prices.append({
                "crop_name": crop["name"],
                "crop_name_local": crop.get("name_hi", crop["name"]),
                "msp_price": crop["msp"],
                "mandi_price": crop["mandi"],
                "profit_margin": round(profit_margin, 2),
                "recommendation": recommendation
            })
        
        return {"success": True, "state": state, "prices": market_prices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market prices: {str(e)}")

@api_router.get("/government-schemes")
async def get_government_schemes(language: str = "en"):
    """Get list of government schemes for farmers"""
    try:
        schemes = []
        for scheme in GOVERNMENT_SCHEMES:
            schemes.append({
                "name": scheme["name"],
                "name_local": scheme["name_hi"] if language == "hi" else scheme["name"],
                "description": scheme["description_hi"] if language == "hi" else scheme["description"],
                "eligibility": scheme["eligibility_hi"] if language == "hi" else scheme["eligibility"],
                "link": scheme["link"]
            })
        
        return {"success": True, "schemes": schemes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get schemes: {str(e)}")

@api_router.get("/farm-tasks")
async def get_farm_tasks(language: str = "en"):
    """Get personalized farm tasks and calendar"""
    try:
        # Mock farm tasks - can be personalized based on user's crop and location
        mock_tasks = [
            {
                "task_name": "Apply Fertilizer",
                "task_name_hi": "उर्वरक डालें",
                "description": "Apply NPK fertilizer to wheat crop",
                "description_hi": "गेहूं की फसल में NPK उर्वरक डालें",
                "due_date": "2025-01-20",
                "priority": "high"
            },
            {
                "task_name": "Irrigation",
                "task_name_hi": "सिंचाई",
                "description": "Water the crops in the morning",
                "description_hi": "सुबह के समय फसलों की सिंचाई करें",
                "due_date": "2025-01-18",
                "priority": "medium"
            }
        ]
        
        tasks = []
        for task in mock_tasks:
            tasks.append(FarmTask(
                task_name=task["task_name"],
                task_name_local=task["task_name_hi"] if language == "hi" else task["task_name"],
                description=task["description_hi"] if language == "hi" else task["description"],
                description_local=task["description_hi"] if language == "hi" else task["description"],
                due_date=task["due_date"],
                priority=task["priority"]
            ))
        
        return {"success": True, "tasks": [task.dict() for task in tasks]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get farm tasks: {str(e)}")

@api_router.post("/translate")
async def translate_text(request: TranslationRequest):
    """Translate text to target language"""
    try:
        # Mock translation - Replace with actual Google Translate API
        translated = await mock_translate_text(request.text, request.target_language)
        
        return {
            "success": True,
            "original_text": request.text,
            "translated_text": translated,
            "target_language": request.target_language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@api_router.post("/voice/speech-to-text")
async def speech_to_text(request: VoiceRequest):
    """Convert speech to text using Vertex AI STT"""
    try:
        # Mock STT - Replace with actual Vertex AI STT API
        transcription = await mock_speech_to_text(request.audio_base64, request.language)
        
        return {
            "success": True,
            "transcription": transcription,
            "language": request.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech to text failed: {str(e)}")

@api_router.post("/voice/text-to-speech")
async def text_to_speech(text: str = Form(...), language: str = Form(default="en")):
    """Convert text to speech using Vertex AI TTS"""
    try:
        # Mock TTS - Replace with actual Vertex AI TTS API
        audio_base64 = await mock_text_to_speech(text, language)
        
        return {
            "success": True,
            "audio_base64": audio_base64,
            "language": language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text to speech failed: {str(e)}")

@api_router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    languages = [
        {"code": "en", "name": "English", "native_name": "English"},
        {"code": "hi", "name": "Hindi", "native_name": "हिंदी"},
        {"code": "mr", "name": "Marathi", "native_name": "मराठी"},
        {"code": "bn", "name": "Bengali", "native_name": "বাংলা"},
        {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી"},
        {"code": "ta", "name": "Tamil", "native_name": "தமிழ்"},
        {"code": "te", "name": "Telugu", "native_name": "తెలుగు"},
        {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ"},
        {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം"},
        {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ"},
        {"code": "as", "name": "Assamese", "native_name": "অসমীয়া"},
        {"code": "or", "name": "Odia", "native_name": "ଓଡ଼ିଆ"},
        {"code": "ur", "name": "Urdu", "native_name": "اردو"},
        {"code": "sa", "name": "Sanskrit", "native_name": "संस्कृत"},
        {"code": "ne", "name": "Nepali", "native_name": "नेपाली"},
        {"code": "mni", "name": "Manipuri", "native_name": "ꯃꯤꯇꯩꯂꯣꯟ"}
    ]
    
    return {"success": True, "languages": languages}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
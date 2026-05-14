import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=api_key)

def generate_medical_report(data_dict: dict) -> dict:
    """
    Generates a human-readable AI medical report using Groq API.
    Takes structured patient data and ML predictions as input.
    Returns a dictionary matching the required JSON format.
    """
    if not api_key:
        return {
            "what_happened": "Groq API Key missing in environment variables.",
            "why_happened": "Could not connect to Groq. Please check your .env file.",
            "risk_factors": [],
            "doctor_suggestions": ["Configure Groq API Key"],
            "emergency_warning": "",
            "next_steps": ["Add GROQ_API_KEY to backend/.env"],
            "how_serious": "Urgency could not be assessed without API connection.",
            "ai_insights": [],
            "improvement_potential": ""
        }

    prompt = f"""
    You are an AI cardiologist. Based on the following patient data and ML prediction, generate a doctor-style, human-readable report.
    Use simple language for a normal person to understand. Maintain a professional, healthcare tone.
    DO NOT use overly technical jargon, scary wording, or guaranteed diagnosis wording.
    
    Patient Data & ML Results:
    {json.dumps(data_dict, indent=2)}
    
    You MUST return a JSON object with the following keys EXACTLY:
    "what_happened": A simple, clear, 2-3 sentence explanation of the overall analysis for a non-medical person.
    "why_happened": A 2-3 sentence explanation linking their specific risk factors to the heart strain.
    "how_serious": A reassuring but professional 1-2 sentence statement about the urgency level.
    "risk_factors": An array of strings, each being a clear cause (e.g., "Elevated Cholesterol", "Smoking History").
    "doctor_suggestions": An array of 3-5 specific medical recommendations.
    "emergency_warning": A calm but firm warning if risk is > 0.8, else an empty string.
    "next_steps": An array of 3-4 immediate actionable steps (e.g., "Schedule ECG", "Reduce Sodium").
    "ai_insights": An array of 2-3 "Smart Insights" that connect patterns (e.g., "High stress and low activity are compounding your cardiovascular strain").
    "improvement_potential": A motivating 1-2 sentence statement on how lifestyle changes can reduce this specific risk.
    
    Respond ONLY with valid JSON. Do not include markdown formatting like ```json.
    """
    
    try:
        message = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1024
        )
        
        text = message.choices[0].message.content
        
        # Clean up markdown code blocks if the model includes them
        text = text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(text)
    except Exception as e:
        print("Groq API Error:", e)
        return {
            "what_happened": "An error occurred while generating the report with Groq API.",
            "why_happened": str(e),
            "risk_factors": [],
            "doctor_suggestions": ["Please try again later."],
            "emergency_warning": "",
            "next_steps": ["Check the backend logs for more details."],
            "how_serious": "Error in severity assessment.",
            "ai_insights": [],
            "improvement_potential": ""
        }

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

def generate_medical_report(data_dict: dict) -> dict:
    """
    Generates a human-readable AI medical report using Google Gemini.
    Takes structured patient data and ML predictions as input.
    Returns a dictionary matching the required JSON format.
    """
    if not api_key:
        return {
            "what_happened": "Gemini API Key missing in environment variables.",
            "why_it_happened": "Could not connect to Google Gemini. Please check your .env file.",
            "risk_factors": [],
            "doctor_suggestions": ["Configure Gemini API Key"],
            "emergency_warning": "",
            "next_steps": ["Add GEMINI_API_KEY to backend/.env"]
        }

    prompt = f"""
    You are an AI cardiologist. Based on the following patient data and ML prediction, generate a doctor-style, human-readable report.
    Use simple language for a normal person to understand. Maintain a professional, healthcare tone.
    DO NOT use overly technical jargon, scary wording, or guaranteed diagnosis wording.
    
    Patient Data & ML Results:
    {json.dumps(data_dict, indent=2)}
    
    You MUST return a JSON object with the following keys EXACTLY:
    "what_happened": A 2-3 sentence explanation of the AI's analysis.
    "why_it_happened": A 2-3 sentence explanation of the specific reasons based on their data.
    "risk_factors": An array of strings, listing the main risk factors.
    "doctor_suggestions": An array of strings, listing 3-5 doctor recommendations.
    "emergency_warning": If risk is high, provide an emergency warning string. Else, provide an empty string or null.
    "next_steps": An array of strings, detailing the immediate next actions the patient should take.
    
    Respond ONLY with valid JSON. Do not include markdown formatting like ```json.
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text
        
        # Clean up markdown code blocks if the model includes them
        text = text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(text)
    except Exception as e:
        print("Gemini API Error:", e)
        return {
            "what_happened": "An error occurred while generating the report with Gemini API.",
            "why_it_happened": str(e),
            "risk_factors": [],
            "doctor_suggestions": ["Please try again later."],
            "emergency_warning": "",
            "next_steps": ["Check the backend logs for more details."]
        }

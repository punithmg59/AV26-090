import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# We will use a safe fallback if Groq API key is missing or call fails.
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def generate_medical_report(report_input):
    """
    Generates a structured medical report using Groq API.
    """
    if not GROQ_API_KEY:
        # Fallback if no API key
        return generate_fallback_report(report_input)
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are an expert AI radiologist. Generate a patient-friendly medical report based ONLY on the following findings.
    DO NOT hallucinate. Do not invent symptoms or diseases. Use exact values provided.
    
    Data:
    {json.dumps(report_input, indent=2)}
    
    Return ONLY a JSON object with these keys:
    - what_happened (String: clear explanation of the prediction)
    - why_happened (String: potential causes based strictly on the finding)
    - recommendations (List of strings: 3 actionable next steps)
    - urgency_level (String: Routine, Urgent, or Emergency based on risk_level)
    """
    
    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": "You are a precise AI medical assistant that outputs strictly valid JSON without markdown formatting."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 500
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
        
        # Clean potential markdown
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        report = json.loads(content)
        return report
    except Exception as e:
        print(f"Groq API error: {e}")
        return generate_fallback_report(report_input)

def generate_fallback_report(report_input):
    """
    Safe fallback report if AI generation fails.
    """
    prediction = report_input.get("prediction", "UNKNOWN")
    risk_level = report_input.get("risk_level", "LOW RISK")
    
    urgency = "Routine"
    if risk_level == "HIGH RISK":
        urgency = "Urgent"
    elif risk_level == "MODERATE RISK":
        urgency = "Moderate"
        
    return {
        "what_happened": f"The AI analysis indicates a classification of {prediction}.",
        "why_happened": "This is based on visual patterns detected in the uploaded X-ray.",
        "recommendations": [
            "Consult with a licensed radiologist or physician for a definitive diagnosis.",
            "Bring this preliminary report to your next medical appointment.",
            "Monitor for any physical symptoms like chronic cough or shortness of breath."
        ],
        "urgency_level": urgency
    }

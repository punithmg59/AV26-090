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
    
    Return ONLY a JSON object with these exact keys:
    - what_happened (String: clear, detailed explanation of the prediction and what the AI detected)
    - why_happened (String: potential causes, risk factors, or clinical interpretations based strictly on the finding)
    - next_steps (List of strings: 3-4 actionable next steps for the patient)
    - doctor_recommendations (List of strings: 2-3 specific types of specialists to consult and why. e.g. "Cardiologist - To evaluate heart rhythms.")
    - health_suggestions (List of strings: 3-4 lifestyle, dietary, or general health tips relevant to the diagnosis)
    - urgency_level (String: Routine, Moderate, Urgent, or Critical based on risk_level)
    - tumor_spot (String: Provide a medically plausible estimated location/spot of the tumor in the brain if the prediction is a brain tumor. E.g., 'Frontal Lobe' or 'Meninges'. If no tumor is detected, return 'N/A')
    - tumor_size (String: Provide a medically plausible estimated size range of the tumor if it is a brain tumor. E.g., '1.5 - 2.5 cm' or 'Small'. If no tumor is detected, return 'N/A')
    """
    
    payload = {
        "model": "llama-3.1-8b-instant",
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
        "why_happened": "This is based on visual patterns detected in the uploaded scan or provided health data.",
        "next_steps": [
            "Consult with a licensed radiologist or physician for a definitive diagnosis.",
            "Bring this preliminary AI report to your next medical appointment.",
            "Monitor for any physical symptoms or changes in health condition."
        ],
        "doctor_recommendations": [
            "Primary Care Physician - For initial evaluation and referrals.",
            "Specialist - Depending on the exact diagnosis, seek out an appropriate specialist."
        ],
        "health_suggestions": [
            "Maintain a healthy, balanced diet.",
            "Ensure adequate hydration and sleep.",
            "Avoid strenuous activities if feeling unwell."
        ],
        "urgency_level": urgency,
        "tumor_spot": "Unspecified Region" if "Tumor" in prediction or prediction not in ["NORMAL", "notumor"] else "N/A",
        "tumor_size": "Pending Clinical Evaluation" if "Tumor" in prediction or prediction not in ["NORMAL", "notumor"] else "N/A"
    }

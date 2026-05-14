import httpx
import json
import os

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

async def generate_llm_report(data_dict):
    """
    Calls OpenRouter API to generate a human-readable, doctor-style report.
    Returns a JSON dict with the expected keys.
    """
    prompt = f"""
    You are an AI cardiologist. Based on the following patient data and ML prediction, generate a doctor-style, human-readable report.
    Focus on normal people understanding and simple medical language.
    
    Patient Data & ML Results:
    {json.dumps(data_dict, indent=2)}
    
    You MUST return a JSON object with the following keys EXACTLY:
    "ai_prediction_result": a short, simple summary of the prediction result (e.g. "High Risk of Heart Disease").
    "what_happened": A 2-3 sentence explanation of the AI's analysis.
    "why_it_happened": A 2-3 sentence explanation of the specific reasons based on their data.
    "risk_factors": An array of strings, listing the main risk factors.
    "doctor_suggestions": An array of strings, listing 3-5 doctor recommendations.
    "emergency_warning": If risk is high, provide a stern emergency warning string. Else, provide an empty string.
    "next_steps": An array of strings, detailing the immediate next actions the patient should take.
    
    Respond ONLY with valid JSON. Do not include markdown formatting like ```json.
    """
    
    # Mock response if API key is empty
    if not OPENROUTER_API_KEY:
        risk_level = data_dict.get("risk_level", "Unknown")
        return {
            "ai_prediction_result": f"Simulation Result: {risk_level}",
            "what_happened": "This is a simulated response because the OpenRouter API key is not configured.",
            "why_it_happened": "The system cannot generate personalized insights without an active LLM integration.",
            "risk_factors": data_dict.get("reasons", ["No specific factors highlighted"]),
            "doctor_suggestions": [
                "Please configure the OpenRouter API key in the backend environment.",
                "Consult a real doctor for actual medical advice.",
                "Maintain a healthy lifestyle."
            ],
            "emergency_warning": "N/A - Simulation Mode" if risk_level != "HIGH RISK" else "Simulated Emergency Warning: Please configure API key for real insights.",
            "next_steps": [
                "Add OPENROUTER_API_KEY to your environment variables.",
                "Restart the FastAPI backend.",
                "Try the prediction again."
            ]
        }
        
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek/deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "You are a helpful AI health assistant that responds exclusively in JSON format."},
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Clean up markdown if present
            content = content.replace("```json", "").replace("```", "").strip()
            
            return json.loads(content)
            
    except Exception as e:
        print("LLM Generation Error:", e)
        # Return fallback
        return {
            "ai_prediction_result": "Error generating AI insights",
            "what_happened": f"There was an error communicating with the LLM API: {str(e)}",
            "why_it_happened": "API connection failure.",
            "risk_factors": [],
            "doctor_suggestions": ["Please try again later."],
            "emergency_warning": "",
            "next_steps": ["Check API status.", "Contact support."]
        }

def format_prediction_result(decoded_prediction):
    """
    Formats the raw decoded prediction into a standardized JSON-ready response.
    """
    class_name = decoded_prediction.get("class_name", "UNKNOWN")
    confidence = decoded_prediction.get("confidence", 0.0)
    
    # Determine risk level based on class and confidence
    if class_name == "PNEUMONIA":
        risk_level = "HIGH" if confidence > 80.0 else "MODERATE"
    elif class_name == "NORMAL":
        risk_level = "LOW"
    else:
        risk_level = "UNKNOWN"
        
    return {
        "prediction": class_name,
        "confidence": round(confidence, 1),
        "risk_level": risk_level
    }

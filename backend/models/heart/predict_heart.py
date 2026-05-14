import joblib
import numpy as np

from risk_engine import enhance_risk

# =========================================
# LOAD TRAINED MODEL
# =========================================

model = joblib.load("heart_model.pkl")

# =========================================
# USER INPUT DATA
# Format:
# [age, sex, cp, trestbps, chol, fbs, thalach, exang]
#
# age        = Age
# sex        = 1 male, 0 female
# cp         = Chest pain type
# trestbps   = Blood pressure
# chol       = Cholesterol
# fbs        = Fasting blood sugar
# thalach    = Heart rate
# exang      = Exercise angina
# =========================================

user_data = np.array([
    [45, 1, 2, 150, 240, 1, 160, 0]
])

# =========================================
# ML MODEL PREDICTION
# =========================================

prediction = model.predict(user_data)

# Probability score
probability = model.predict_proba(user_data)

# Base ML risk
base_risk = probability[0][1]

# =========================================
# ENHANCEMENT FEATURES
# =========================================

smoking = 1
stress_level = 9
short_breath = 1
fatigue = 1
chest_location = 1
left_arm_pain = 1
pain_severity = 3

# =========================================
# ENHANCED RISK CALCULATION
# =========================================

enhanced_risk = enhance_risk(
    base_risk=base_risk,
    smoking=smoking,
    stress_level=stress_level,
    short_breath=short_breath,
    fatigue=fatigue,
    chest_location=chest_location,
    left_arm_pain=left_arm_pain,
    pain_severity=pain_severity
)

# =========================================
# FINAL RISK CLASSIFICATION
# =========================================

if enhanced_risk < 0.30:
    risk_level = "LOW RISK"

elif enhanced_risk < 0.60:
    risk_level = "MODERATE RISK"

else:
    risk_level = "HIGH RISK"

# =========================================
# RESULT OUTPUT
# =========================================

print("\n========== HEART DISEASE ANALYSIS ==========\n")

print("Prediction:", prediction[0])

print(f"Base ML Risk Score: {base_risk:.2f}")

print(f"Enhanced Risk Score: {enhanced_risk:.2f}")

print("Final Risk Level:", risk_level)

print("\n========== ENHANCEMENT FEATURES ==========\n")

print("Smoking:", smoking)
print("Stress Level:", stress_level)
print("Short Breath:", short_breath)
print("Fatigue:", fatigue)
print("Chest Pain Location:", chest_location)
print("Left Arm Pain:", left_arm_pain)
print("Pain Severity:", pain_severity)

print("\n========== AI EXPLANATION ==========\n")

if risk_level == "HIGH RISK":
    print("High cardiovascular risk detected.")
    print("Possible reasons:")
    print("- Elevated blood pressure")
    print("- Chest pain symptoms")
    print("- Left arm pain")
    print("- Smoking history")
    print("- High stress level")
    print("\nRecommendation:")
    print("Consult a cardiologist immediately.")

elif risk_level == "MODERATE RISK":
    print("Moderate cardiovascular risk detected.")
    print("Lifestyle improvements and medical consultation recommended.")

else:
    print("Low cardiovascular risk detected.")
    print("Maintain a healthy lifestyle.")

print("\n===========================================\n")
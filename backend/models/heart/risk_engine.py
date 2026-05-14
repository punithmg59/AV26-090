def enhance_risk(
    base_risk,
    smoking,
    stress_level,
    short_breath,
    fatigue,
    chest_location,
    left_arm_pain,
    pain_severity
):

    risk = base_risk

    # Smoking
    if smoking == 1:
        risk += 0.08

    # High stress
    if stress_level >= 8:
        risk += 0.05

    # Short breath
    if short_breath == 1:
        risk += 0.09

    # Fatigue
    if fatigue == 1:
        risk += 0.04

    # Chest pain location
    if chest_location == 1:
        risk += 0.10

    # Left arm pain
    if left_arm_pain == 1:
        risk += 0.07

    # Pain severity
    if pain_severity == 3:
        risk += 0.10

    # Limit maximum
    risk = min(risk, 1.0)

    return risk
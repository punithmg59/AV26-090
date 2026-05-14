import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from xgboost import XGBClassifier

# =========================
# LOAD DATASET
# =========================

script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "..", "..", "datasets", "heart", "heart.csv")
df = pd.read_csv(csv_path)

# =========================
# SELECT FEATURES
# =========================

features = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "thalach",
    "exang"
]

X = df[features]

y = df["target"]

# =========================
# SPLIT DATA
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# =========================
# TRAIN MODEL
# =========================

model = XGBClassifier()

model.fit(X_train, y_train)

# =========================
# TEST ACCURACY
# =========================

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print(f"Accuracy: {accuracy * 100:.2f}%")

# =========================
# SAVE MODEL
# =========================

joblib.dump(model, "heart_model.pkl")

print("Model saved as heart_model.pkl")
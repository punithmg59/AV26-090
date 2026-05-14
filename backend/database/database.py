from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# =========================
# DATABASE URL
# =========================


DATABASE_URL = "postgresql://postgres:959146@localhost/healthcare_ai"

# =========================
# ENGINE
# =========================

engine = create_engine(DATABASE_URL)

# =========================
# SESSION
# =========================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =========================
# BASE
# =========================

Base = declarative_base()
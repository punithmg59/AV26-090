from sqlalchemy import text
from database.database import engine

def add_column():
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE heart_predictions ADD COLUMN IF NOT EXISTS report TEXT'))
        conn.commit()
    print("Column added successfully.")

if __name__ == "__main__":
    add_column()

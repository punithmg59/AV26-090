from database import engine
from db_models import Base

# Create tables
Base.metadata.create_all(bind=engine)
print(Base.metadata.tables.keys())

print("Database tables created successfully")
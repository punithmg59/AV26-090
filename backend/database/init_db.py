import sys
import os
from pathlib import Path

# Get absolute paths
current_file = Path(__file__).resolve()
database_dir = str(current_file.parent)
backend_dir = str(current_file.parents[1])

# Add backend to path and remove database_dir to prevent shadowing
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if database_dir in sys.path:
    sys.path.remove(database_dir)

try:
    from database.database import engine
    from database.db_models import Base
except ImportError:
    # Fallback for different environments
    from database import engine
    from db_models import Base

# Create tables
Base.metadata.create_all(bind=engine)
print(Base.metadata.tables.keys())

print("Database tables created successfully")
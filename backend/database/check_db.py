import psycopg2

conn = psycopg2.connect(
    dbname='healthcare_ai',
    user='postgres',
    password='959146',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
tables = cursor.fetchall()
print("Tables in healthcare_ai:")
for t in tables:
    print(f"- {t[0]}")
cursor.close()
conn.close()

from database import get_db_connection


connection = get_db_connection()

if connection:
    print("✅ MySQL connection successful!")
    connection.close()
else:
    print("❌ MySQL connection failed!")
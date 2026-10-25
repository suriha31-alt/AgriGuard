import mysql.connector
from mysql.connector import Error


# =========================================================
# MYSQL CONNECTION
# =========================================================

def get_db_connection():

    try:

        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="SANDY@123",
            database="agriguard"
        )

        if connection.is_connected():
            return connection

    except Error as e:

        print(f"MySQL connection error: {e}")

    return None


# =========================================================
# SAVE DISEASE PROGRESS
# =========================================================

def save_disease_progress(
    crop,
    disease,
    severity,
    observation_date,
    farmer_notes,
    location
):

    connection = get_db_connection()

    if not connection:
        return None

    try:

        cursor = connection.cursor()

        query = """
            INSERT INTO disease_progress
            (
                crop,
                disease,
                severity,
                observation_date,
                farmer_notes,
                location
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        values = (
            crop,
            disease,
            severity,
            observation_date,
            farmer_notes,
            location
        )

        cursor.execute(query, values)

        connection.commit()

        record_id = cursor.lastrowid

        return record_id

    except Error as e:

        print(f"Error saving disease progress: {e}")

        return None

    finally:

        if connection.is_connected():

            cursor.close()
            connection.close()


# =========================================================
# GET DISEASE PROGRESS
# =========================================================

def get_disease_progress():

    connection = get_db_connection()

    if not connection:
        return []

    try:

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                id,
                crop,
                disease,
                severity,
                observation_date,
                farmer_notes,
                location,
                created_at
            FROM disease_progress
            ORDER BY created_at DESC
        """

        cursor.execute(query)

        records = cursor.fetchall()

        return records

    except Error as e:

        print(f"Error fetching disease progress: {e}")

        return []

    finally:

        if connection.is_connected():

            cursor.close()
            connection.close()


# =========================================================
# DELETE ALL PROGRESS
# =========================================================
# Not used by the frontend currently.
# Kept here for development/testing if required later.

def delete_all_progress():

    connection = get_db_connection()

    if not connection:
        return False

    try:

        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM disease_progress"
        )

        connection.commit()

        return True

    except Error as e:

        print(f"Error deleting progress: {e}")

        return False

    finally:

        if connection.is_connected():

            cursor.close()
            connection.close()
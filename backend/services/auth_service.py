import mysql.connector
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB
from admin_config import ADMIN_USERNAME, ADMIN_PASSWORD

def get_db_connection(database=MYSQL_DB):
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=database
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

def init_db():
    # Connect without specifying database to create it if it doesn't exist
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
        conn.commit()
        cursor.close()
        conn.close()

        # Connect to the database and create tables
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255),
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        cursor.close()
        conn.close()
        print("MySQL Database and Tables initialized.")
    except mysql.connector.Error as err:
        print(f"Database Initialization Error: {err}")

# Initialize
init_db()

def register_user(username, password, email=None, role="user"):
    try:
        conn = get_db_connection()
        if conn is None:
            raise Exception("Database connection failed. Please check your MySQL configuration.")
            
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password, email, role) VALUES (%s, %s, %s, %s)", (username, password, email, role))
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return user_id
    except mysql.connector.Error as err:
        print(f"Registration Error: {err}")
        raise err

def authenticate_user(username, password, role="user"):
    # Check hardcoded admin first
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        if role == "admin":
            return {"id": 0, "username": ADMIN_USERNAME, "role": "admin", "created_at": "System"}
        else:
            print(f"Login Failure: Hardcoded admin '{username}' tried to login as '{role}'")
            return None
    
    try:
        conn = get_db_connection()
        if conn is None:
            return None
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user:
            if user["role"] == role:
                return user
            else:
                print(f"Login Failure: User '{username}' role mismatch (Requested: {role}, Actual: {user['role']})")
                return None
        return None
    except mysql.connector.Error as err:
        print(f"Authentication Error: {err}")
        return None

def get_all_users():
    try:
        conn = get_db_connection()
        if conn is None:
            return []
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return users
    except Exception as err:
        print(f"Fetch Users Error: {err}")
        return []

import sqlite3
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "database", "reports.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_type TEXT NOT NULL,
            species_id TEXT,
            species_name TEXT,
            lat REAL,
            lng REAL,
            image_data TEXT,
            issue_type TEXT,
            description TEXT,
            reporter TEXT DEFAULT 'Anonymous',
            status TEXT DEFAULT 'pending',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize when imported
init_db()

def create_sighting_report(species_name, lat, lng, description, image_data=None, reporter="Anonymous", species_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reports (report_type, species_name, species_id, lat, lng, description, image_data, reporter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('sighting', species_name, species_id, lat, lng, description, image_data, reporter))
    conn.commit()
    report_id = cursor.lastrowid
    conn.close()
    return report_id

def create_issue_report(species_name, issue_type, description, reporter="Anonymous", species_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reports (report_type, species_name, species_id, issue_type, description, reporter)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ('issue', species_name, species_id, issue_type, description, reporter))
    conn.commit()
    report_id = cursor.lastrowid
    conn.close()
    return report_id

def get_all_reports():
    conn = get_db_connection()
    reports = conn.execute('SELECT * FROM reports ORDER BY timestamp DESC').fetchall()
    conn.close()
    return [dict(row) for row in reports]

def update_report_status(report_id, status):
    conn = get_db_connection()
    conn.execute('UPDATE reports SET status = ? WHERE id = ?', (status, report_id))
    conn.commit()
    conn.close()
    return True

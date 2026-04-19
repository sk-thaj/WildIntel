# WildIntel - Endangered Species Explorer & Reporting Platform

WildIntel is a modern web application designed to help users explore endangered species and report sightings or data inaccuracies. It features a robust authentication system, an interactive species map, and an administrative dashboard for data management.

## 🚀 Features

- **Species Explorer**: Detailed information and high-quality images of endangered species.
- **Interactive Map**: Visualize species distribution and sighting locations.
- **Reporting System**: Users can report wildlife sightings or flag data issues.
- **Admin Dashboard**: Manage user accounts and review/approve reports.
- **Secure Authentication**: Role-based access control (User/Admin) with MySQL backend.
- **Premium UI**: Sleek, responsive design built with React and Shadcn UI.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: Python (Flask), MySQL (User data), SQLite (Reports data).
- **Mapping**: Leaflet / React-Leaflet.

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MySQL Server

### 1. Clone the Repository
```bash
git clone https://github.com/sk-thaj/WildIntel.git
cd WildIntel
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## ⚙️ Configuration

### MySQL Setup
1. Create a database named `wildintel_db`.
2. Use the following schema to create the users table:
```sql
USE wildintel_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
3. Copy `backend/config.py.example` to `backend/config.py` and update your MySQL credentials.

### Admin Setup
1. Copy `backend/admin_config.py.example` to `backend/admin_config.py` and set your preferred admin credentials.

## 📝 License
This project is for educational purposes.

---
Built with ❤️ for Wildlife Conservation.

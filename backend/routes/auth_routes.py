from flask import Blueprint, request, jsonify
from services.auth_service import register_user, authenticate_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        user_id = register_user(
            data["username"], 
            data["password"], 
            email=data.get("email"),
            role=data.get("role", "user")
        )
        return jsonify({"message": "User registered successfully", "user_id": user_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400
    
    user = authenticate_user(data["username"], data["password"], data.get("role", "user"))
    if user:
        # For simplicity, we return the user object (excluding password)
        # In a real app, you'd return a JWT
        user.pop("password", None)
        return jsonify({"message": "Login successful", "user": user}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@auth_bp.route("/users", methods=["GET"])
def get_users():
    # In a real app, you would verify the admin token here
    from services.auth_service import get_all_users
    users = get_all_users()
    return jsonify(users), 200

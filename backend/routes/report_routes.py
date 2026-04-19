from flask import Blueprint, request, jsonify
from services.report_service import create_sighting_report, create_issue_report, get_all_reports, update_report_status

report_bp = Blueprint("reports", __name__)

@report_bp.route("/reports", methods=["GET"])
def get_reports():
    try:
        reports = get_all_reports()
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/sighting", methods=["POST"])
def submit_sighting():
    data = request.json
    if not data or not data.get("species_name"):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        report_id = create_sighting_report(
            species_name=data.get("species_name"),
            lat=data.get("lat"),
            lng=data.get("lng"),
            description=data.get("description", data.get("notes", "")),
            image_data=data.get("image_data"),
            reporter=data.get("reporter", "Anonymous"),
            species_id=data.get("species_id")
        )
        return jsonify({"message": "Sighting reported successfully", "id": report_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/issue", methods=["POST"])
def submit_issue():
    data = request.json
    if not data or not data.get("species_name") or not data.get("issue_type"):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        report_id = create_issue_report(
            species_name=data.get("species_name"),
            issue_type=data.get("issue_type"),
            description=data.get("description", ""),
            reporter=data.get("reporter", "Anonymous"),
            species_id=data.get("species_id")
        )
        return jsonify({"message": "Issue reported successfully", "id": report_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/<int:report_id>/status", methods=["PUT"])
def update_status(report_id):
    data = request.json
    if not data or not data.get("status"):
        return jsonify({"error": "Missing status field"}), 400
    
    try:
        update_report_status(report_id, data.get("status"))
        return jsonify({"message": "Status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

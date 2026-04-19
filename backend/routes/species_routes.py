from flask import Blueprint, jsonify
from services.species_service import get_species

species_bp = Blueprint("species", __name__)

@species_bp.route("/species", methods=["GET"])
def species():
    data = get_species()
    return jsonify(data)
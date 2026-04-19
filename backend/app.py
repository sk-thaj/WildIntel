from flask import Flask
from flask_cors import CORS
from routes.species_routes import species_bp
from routes.report_routes import report_bp
from routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(species_bp)
app.register_blueprint(report_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
@app.route("/")
def home():
    return {"message": "WildIntel Backend Running"}

if __name__ == "__main__":
    app.run(debug=True)
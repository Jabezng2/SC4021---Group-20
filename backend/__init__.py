from flask import Flask
from flask_cors import CORS
from .feedback_store import load_feedback_scores
import logging
import sys

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://cryptopinions.vercel.app"]}})

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )

    # Load feedback memory once at startup
    load_feedback_scores()

    from .routes.search import search_bp
    from .routes.document import document_bp
    from .routes.feedback import feedback_bp

    app.register_blueprint(search_bp, url_prefix='/api')
    app.register_blueprint(document_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')

    return app
from flask import Flask
import logging
import sys

def create_app():
    app = Flask(__name__)

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    from .routes.search import search_bp
    from .routes.document import document_bp

    app.register_blueprint(search_bp, url_prefix='/api')
    app.register_blueprint(document_bp, url_prefix='/api')

    return app
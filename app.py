from backend import create_app
from backend.solr_client import test_solr_connection

if __name__ == '__main__':
    test_solr_connection()
    app = create_app()
    app.run(debug=True, port=5000)
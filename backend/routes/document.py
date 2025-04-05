import json
import logging
from flask import Blueprint, jsonify
from backend.solr_client import query_solr

document_bp = Blueprint('document', __name__)

logger = logging.getLogger(__name__)

@document_bp.route('/document/<doc_id>')
def view_document(doc_id):
    """View a single document with proper schema fields"""
    params = {
        'q': f'id:"{doc_id}"',
        'fl': '*',  # Request all fields
        'wt': 'json'
    }

    try:
        results = query_solr(params)

        if results['response']['numFound'] > 0:
            doc = results['response']['docs'][0]

            # Get related documents using parent_id from schema
            related_docs = []
            if 'parent_id' in doc and doc.get('parent_id'):
                parent_id = doc["parent_id"]
                if isinstance(parent_id, str):  # Check if parent_id is a string first
                    if parent_id.startswith('t1_') or parent_id.startswith('t3_'):
                        parent_id = parent_id.replace("t1_", "").replace("t3_", "")

                    parent_params = {
                        'q': f'id:"{parent_id}"',
                        'fl': '*',
                        'wt': 'json'
                    }

                    parent_results = query_solr(params)

                    if parent_results['response']['numFound'] > 0:
                        related_docs.append(parent_results['response']['docs'][0])

            # Process keywords and entities properly
            keywords = []
            entities = []

            # Handle keywords field - safely process regardless of type
            if 'keywords' in doc:
                keywords_data = doc['keywords']
                if isinstance(keywords_data, list):
                    keywords = keywords_data
                elif isinstance(keywords_data, str):
                    try:
                        if keywords_data.startswith('['):
                            keywords = json.loads(keywords_data.replace("'", '"'))
                        else:
                            keywords = [keywords_data]
                    except:
                        keywords = []

            # Handle entities field - safely process regardless of type
            if 'entities' in doc:
                entities_data = doc['entities']
                if isinstance(entities_data, list):
                    entities = entities_data
                elif isinstance(entities_data, str):
                    try:
                        if entities_data.startswith('['):
                            entities = json.loads(entities_data.replace("'", '"'))
                        else:
                            entities = [entities_data]
                    except:
                        entities = []

            return jsonify({
                "doc": doc,
                "related_docs": related_docs,
                "keywords": keywords,
                "entities": entities
            })

        else:
            return jsonify({"error": "Document not found"}), 404

    except Exception as e:
        logger.error(f"Solr document fetch error: {e}")
        return jsonify({'error': str(e)}), 500

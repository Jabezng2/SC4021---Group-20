import logging
from flask import Blueprint, request, jsonify
from backend.solr_client import solr  # Assuming solr is initialized as pysolr.Solr object

search_bp = Blueprint('search', __name__)
logger = logging.getLogger(__name__)

@search_bp.route('/api/suggest', methods=['GET'])
def suggest():
    query = request.args.get('query', '')
    if not query or len(query) < 2:
        return jsonify([])

    # Prepare Solr suggest parameters
    params = {
        'suggest': 'true',
        'suggest.build': 'false',
        'suggest.dictionary': 'keywordSuggester',
        'suggest.q': query,
        'wt': 'json'
    }

    try:
        response = solr.get('suggest', params=params)
        suggestions = []

        if 'suggest' in response:
            suggest_data = response['suggest'].get('keywordSuggester', {}).get(query, {})
            for entry in suggest_data.get('suggestions', []):
                suggestions.append(entry.get('term'))

        return jsonify(suggestions)

    except Exception as e:
        logger.error(f"Suggest API failed: {str(e)}")
        return jsonify({'error': str(e)}), 500
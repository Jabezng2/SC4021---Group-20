import logging
from flask import Blueprint, request, jsonify
from backend.solr_client import query_solr

search_bp = Blueprint('search', __name__)

logger = logging.getLogger(__name__)

@search_bp.route('/api/spellcheck', methods=['GET'])
def spellcheck():
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify([])

    # Prepare Solr spellcheck parameters
    params = {
        'q': query,
        'wt': 'json',
        'spellcheck': 'true',
        'spellcheck.build': 'false',
        'spellcheck.dictionary': 'default',
        'spellcheck.count': 5,
        'spellcheck.collate': 'true',
        'spellcheck.maxCollations': 3,
        'spellcheck.maxCollationTries': 5,
        'spellcheck.collateExtendedResults': 'true'
    }

    try:

        data = query_solr(params)

        suggestions = {}
        collation = None

        spellcheck_data = data.get('spellcheck', {})
        if 'suggestions' in spellcheck_data:
            suggestions_raw = spellcheck_data['suggestions']
            for i in range(0, len(suggestions_raw), 2):
                if i + 1 < len(suggestions_raw):
                    word = suggestions_raw[i]
                    suggestion_data = suggestions_raw[i+1]
                    if isinstance(suggestion_data, dict) and 'suggestion' in suggestion_data:
                        suggestions[word] = suggestion_data['suggestion']

        if 'collations' in spellcheck_data and spellcheck_data['collations']:
            collations = spellcheck_data['collations']
            for i in range(1, len(collations), 2):
                if isinstance(collations[i], dict) and 'collationQuery' in collations[i]:
                    collation = collations[i]['collationQuery']
                    break

        return jsonify({
            'original': query,
            'suggestions': suggestions,
            'collation': collation
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

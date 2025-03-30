from flask import Flask, request, jsonify
import requests
import json
import logging
import sys
from datetime import datetime, timedelta

app = Flask(__name__)

# Solr connection settings
SOLR_URL = "http://localhost:8983/solr/crypto_opinions"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def test_solr_connection():
    try:
        response = requests.get(f"{SOLR_URL}/admin/ping", timeout=5)
        response.raise_for_status()
        logger.info(f"Successfully connected to Solr at {SOLR_URL}")

        count_response = requests.get(f"{SOLR_URL}/select?q=*:*&rows=0&wt=json", timeout=5)
        count_data = count_response.json()
        doc_count = count_data.get("response", {}).get("numFound", 0)
        logger.info(f"Found {doc_count} documents in Solr index")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to Solr: {e}")
        return False

def get_facet_values(field_name):
    """Get facet values from Solr"""
    params = {
        'q': '*:*',
        'facet': 'true',
        'facet.field': field_name,
        'facet.mincount': 1,
        'facet.limit': 20,
        'rows': 0,
        'wt': 'json'
    }

    try:
        response = requests.get(f"{SOLR_URL}/select", params=params)
        response.raise_for_status()  # Raise exception for HTTP errors
        facets = response.json().get('facet_counts', {}).get('facet_fields', {})

        values = []
        if field_name in facets:
            field_facets = facets[field_name]
            for i in range(0, len(field_facets), 2):
                if i + 1 < len(field_facets) and field_facets[i + 1] > 0:
                    values.append(field_facets[i])

        return values
    except Exception as e:
        print(f"Error fetching {field_name} facets: {e}")
        return []  # Return empty list on error

@app.route('/api/search')
def search():
    raw_query = request.args.get('q', '*:*')
    original_query = raw_query

    platform = request.args.get('platform', '')
    source = request.args.get('source', '')
    content_type = request.args.get('type', '')
    exchange = request.args.get('exchange', '')
    sentiment = request.args.get('sentiment', '')
    feature = request.args.get('feature', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    rows = int(request.args.get('rows', 10))
    start = int(request.args.get('start', 0))

    fq = []
    if platform:
        fq.append(f'platform:"{platform}"')
    if source:
        fq.append(f'source:"{source}"')
    if content_type:
        fq.append(f'type:"{content_type}"')
    if exchange:
        fq.append(f'exchange:"{exchange}"')
    if sentiment:
        fq.append(f'sentiment:"{sentiment}"')
    if feature and feature != 'any':
        fq.append(f'{feature}:[0.5 TO *]')
    if start_date and end_date:
        fq.append(f'date:[{start_date}T00:00:00Z TO {end_date}T23:59:59Z]')

    solr_query = raw_query
    if raw_query != '*:*' and not raw_query.startswith('_text_:'):
        solr_query = f'text:"{raw_query}"'

    params = {
        'q': solr_query,
        'fq': fq,
        'rows': rows,
        'start': start,
        'facet': 'true',
        'facet.field': ['platform', 'sentiment', 'type'],
        'facet.mincount': 1,
        'facet.range': 'date',
        'facet.range.start': 'NOW-1YEAR',
        'facet.range.end': 'NOW',
        'facet.range.gap': '+1MONTH',
        'sort': 'reddit_score desc, rating desc',
        'fl': 'id,text,cleaned_text,platform,source,exchange,date,reddit_score,rating,word_count,sentiment,sentiment_score,fees,user_interface,customer_service,security,coin_listings,performance',
        'wt': 'json',
    }

    try:
        print(f"Solr Query: {solr_query}")
        print(f"Filter Queries: {fq}")

        response = requests.get(f"{SOLR_URL}/select", params=params)
        response.raise_for_status()
        results = response.json()

        # Get the actual number of results
        num_found = results['response'].get('numFound', 0)

        # Handle pagination edge cases
        if num_found == 0:
            pass
        elif start >= num_found:
            # Start is beyond available results, go to last page
            start = (num_found // rows) * rows
            if start == num_found:  # Handle exact division case
                start = max(0, start - rows)

            # Re-fetch with corrected pagination
            params['start'] = start
            response = requests.get(f"{SOLR_URL}/select", params=params)
            response.raise_for_status()
            results = response.json()
        
        exchanges = get_facet_values('exchange')
        content_types = get_facet_values('type')

        features = [
            {'id': 'fees', 'name': 'Exchange Fees'},
            {'id': 'user_interface', 'name': 'User Interface'},
            {'id': 'customer_service', 'name': 'Customer Service'},
            {'id': 'security', 'name': 'Security'},
            {'id': 'coin_listings', 'name': 'Coin Listings'},
            {'id': 'performance', 'name': 'Performance'},
            {'id': 'any', 'name': 'Any Feature'}
        ]

        return jsonify({
            "query": original_query,
            "solr_query": solr_query,
            "results": results['response']['docs'],
            "num_found": num_found,
            "start": start,
            "rows": rows,
            "exchanges": exchanges,
            "content_types": content_types,
            "features": features,
            "selected_exchange": exchange,
            "selected_type": content_type,
            "selected_sentiment": sentiment,
            "selected_feature": feature,
            "start_date": start_date,
            "end_date": end_date
        })
    except Exception as e:
        error_message = f"Error searching Solr: {str(e)}"
        logger.error(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/document/<doc_id>')
def view_document(doc_id):
    """View a single document with proper schema fields"""
    params = {
        'q': f'id:"{doc_id}"',
        'fl': '*',  # Request all fields
        'wt': 'json'
    }

    try:
        response = requests.get(f"{SOLR_URL}/select", params=params)
        response.raise_for_status()
        results = response.json()

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

                    parent_response = requests.get(f"{SOLR_URL}/select", params=parent_params)
                    parent_response.raise_for_status()
                    parent_results = parent_response.json()

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
                # "related_docs": related_docs,
                "keywords": keywords,
                "entities": entities
            })

        else:
            return jsonify({"error": "Document not found"}), 404

    except Exception as e:
        logger.error(f"Solr document fetch error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    test_solr_connection()
    app.run(debug=True, port=5000)
import logging
from flask import Blueprint, request, jsonify
from backend.solr_client import query_solr, get_facet_values
from backend.feedback_store import bulk_feedback_scores
import math

search_bp = Blueprint('search', __name__)

logger = logging.getLogger(__name__)

def fetch_spellcheck_suggestions(query):
    params = {
        "q": f"cleaned_text:({query})",
        "wt": "json"
    }
    data = query_solr('spell', params)
    suggestions = []
    if "spellcheck" in data and "suggestions" in data["spellcheck"]:
        raw_suggestions = data["spellcheck"]["suggestions"]
        for i in range(0, len(raw_suggestions), 2):
            if i + 1 < len(raw_suggestions):
                word = raw_suggestions[i]
                suggestion_info = raw_suggestions[i + 1]
                for s in suggestion_info.get("suggestion", []):
                    suggestions.append(s["word"])
        return suggestions
    return []

@search_bp.route('/search')
def search():
    raw_query = request.args.get('q', '*:*')
    original_query = raw_query

    platform = request.args.get('platform', '')
    source = request.args.get('source', '')
    type = request.args.get('type', '')
    exchange = request.args.get('exchange', '')
    sentiment = request.args.get('sentiment', '')
    feature = request.args.get('feature', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    rows = int(request.args.get('rows', 10))
    start = int(request.args.get('start', 0))
    enable_feedback_rerank = request.args.get('rerank', 'true').lower() == 'true'

    fq = []
    if platform:
        fq.append(f'platform:"{platform}"')
    if source:
        if source.lower() == "reddit":
            fq.append('source:r/*')
        else:
            fq.append(f'source:"{source}"')
    if type:
        fq.append(f'type:"{type}"')
    if exchange:
        exchanges = exchange.split('+')
        exchange_query = ' '.join([f'exchange:"{ex}"' for ex in exchanges])
        if raw_query == '*:*':
            solr_query = exchange_query
        else:
            solr_query = f'text:"{raw_query}" {exchange_query}'
    if sentiment:
        fq.append(f'sentiment:"{sentiment}"')
    if feature and feature != 'any':
        fq.append(f'{feature}:[0.5 TO *]')
    if start_date and end_date:
        fq.append(f'date:[{start_date}T00:00:00Z TO {end_date}T23:59:59Z]')

    if raw_query != '*:*' and not raw_query.startswith('text:'):
        solr_query = f'text:"{raw_query}"'
    else:
        solr_query = raw_query

    # Fetch more docs to enable reranking
    solr_rows = 50 if enable_feedback_rerank else rows

    params = {
        'defType': 'lucene',
        'q': solr_query,
        'fq': fq,
        'rows': solr_rows,
        'start': start,
        'facet': 'true',
        'facet.field': ['platform', 'sentiment', 'type'],
        'facet.mincount': 1,
        'facet.range': 'date',
        'facet.range.start': 'NOW-1YEAR',
        'facet.range.end': 'NOW',
        'facet.range.gap': '+1MONTH',
        'sort': 'reddit_score desc, rating desc',
        'fl': 'id,text,cleaned_text,platform,source,type,exchange,date,reddit_score,rating,word_count,sentiment,sentiment_score,fees,user_interface,customer_service,security,coin_listings,performance',
        'wt': 'json',
        'spellcheck': 'on',
        'spellcheck.dictionary': 'default',
        'spellcheck.count': 5,
        'spellcheck.collate': 'true',
        'spellcheck.maxCollations': 3,
        'spellcheck.maxCollationTries': 5,
        'spellcheck.collateExtendedResults': 'true'
    }

    def get_normalized_score(doc, feedback_score=0):
        # Normalize Reddit score to the range of 0–5 using logarithmic scaling
        max_reddit_score = 1000  # Adjust based on typical Reddit score ranges
        raw_reddit_score = doc.get('reddit_score', 0)

        # Prevent math domain error by clamping to a minimum of 0
        safe_reddit_score = max(raw_reddit_score, 0)
        normalized_reddit = math.log(safe_reddit_score + 1) / math.log(max_reddit_score + 1) * 5

        # Normalize rating (already in the range of 0–5)
        normalized_rating = doc.get('rating', 0)

        # Weights for combining scores
        weight_reddit = 0.6
        weight_rating = 0.4
        feedback_weight = 10

        # Composite score
        composite_score = (weight_reddit * normalized_reddit) + (weight_rating * normalized_rating)

        # Final score with feedback adjustment
        final_score = composite_score + (feedback_score * feedback_weight)

        return final_score

    try:
        print(f"Solr Query: {solr_query}")
        print(f"Filter Queries: {fq}")

        results = query_solr('select', params)
        docs = results['response'].get('docs', [])
        num_found = results['response'].get('numFound', 0)

        spellcheck_alternatives = []
        if num_found == 0 and raw_query and raw_query != '*:*':
            spellcheck_alternatives = fetch_spellcheck_suggestions(raw_query)

        if num_found > 0 and enable_feedback_rerank:
            doc_ids = [doc['id'] for doc in docs]
            feedback_map = bulk_feedback_scores(doc_ids)
            docs.sort(
                key=lambda d: get_normalized_score(d, feedback_map.get(d['id'], 0)),
                reverse=True
            )
            docs = docs[:rows]  # only return top N after rerank

        if start >= num_found:
            start = (num_found // rows) * rows
            if start == num_found:
                start = max(0, start - rows)
            params['start'] = start
            results = query_solr('select', params)

        exchanges = get_facet_values('exchange')
        content_types = get_facet_values('type')
        
        '''
        features = [
            {'id': 'fees', 'name': 'Exchange Fees'},
            {'id': 'user_interface', 'name': 'User Interface'},
            {'id': 'customer_service', 'name': 'Customer Service'},
            {'id': 'security', 'name': 'Security'},
            {'id': 'coin_listings', 'name': 'Coin Listings'},
            {'id': 'performance', 'name': 'Performance'},
            {'id': 'any', 'name': 'Any Feature'}
        ]
        '''

        return jsonify({
            "query": original_query,
            "solr_query": solr_query,
            "results": docs,
            "num_found": num_found,
            "start": start,
            "rows": rows,
            "exchanges": exchanges,
            "content_types": content_types,
            # "features": features,
            "selected_exchange": exchange,
            "selected_type": type,
            "selected_sentiment": sentiment,
            "selected_feature": feature,
            "start_date": start_date,
            "end_date": end_date,
            "spellcheck_alternatives": spellcheck_alternatives
        })
    except Exception as e:
        error_message = f"Error searching Solr: {str(e)}"
        logger.error(error_message)
        return jsonify({"error": error_message}), 500
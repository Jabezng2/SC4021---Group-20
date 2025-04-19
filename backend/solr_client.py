import requests
import logging
from config import SOLR_URL

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

def query_solr(type, params):
    response = requests.get(f"{SOLR_URL}/{type}", params=params)
    response.raise_for_status()
    return response.json()
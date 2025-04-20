import requests
import time

queries = [{"query": "best trading"},
    {"query": "bad platform"},
    {"query": "coinbase customer service"},
    {"query": "dogecoin"},
    {"query": "crypto scam"}]

SOLR_URL = "http://localhost:8983/solr/crypto_opinions/select"
top_k = 1

def run_test():
    total_time = 0

    for q in queries:
        params = {
            "q": f'cleaned_text:({q["query"]})',
            "rows": top_k,
            "fl": "id"  # Only retrieve the document ID
        }

        start = time.time()
        response = requests.get(SOLR_URL, params=params)
        elapsed = time.time() - start
        total_time += elapsed

        try:
            solr_json = response.json()
            docs = solr_json['response']['docs']
        except Exception as e:
            print(f"Error decoding JSON: {e}")
            print(f"Raw response:\n{response.text}")
            continue

        if not docs:
            print(f"Query: {q['query']} | No results found | Time: {elapsed*1000:.2f} ms")
            continue

        for doc in docs:
            doc_id = doc.get('id', 'No ID available')
            print(f"Query: {q['query']} | Time: {elapsed*1000:.2f} ms | Document ID of First Result: {doc_id}")

    avg_time = total_time / len(queries)
    print(f"\nAverage Query Time: {avg_time*1000:.2f} ms")


if __name__ == "__main__":
    run_test()
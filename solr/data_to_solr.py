import pandas as pd
import pysolr
import json
import ast
from datetime import datetime
from tqdm import tqdm

# Connect to Solr
solr = pysolr.Solr('http://localhost:8983/solr/crypto_opinions/', always_commit=True)

df = pd.read_csv('../data/crypto_exchange_data.csv')
# Convert dataframe to Solr documents
documents = []
for _, row in tqdm(df.iterrows(), total=len(df), desc="Preparing documents"):
    # Create a basic document
    doc = {
        'id': str(row['id']),
        'platform': row['platform'] if pd.notna(row['platform']) else "unknown",
        'source': row['source'] if pd.notna(row['source']) else "unknown",
        'reddit_score': int(row['reddit_score']) if pd.notna(row['reddit_score']) else 0,
        'rating': int(row['rating']) if pd.notna(row['rating']) else 0,
    }
    # Add text content fields
    if pd.notna(row['text']):
        doc['text'] = row['text']

    if pd.notna(row['cleaned_text']):
        doc['cleaned_text'] = row['cleaned_text']

    # Add post type
    if 'type' in row and pd.notna(row['type']):
        doc['type'] = row['type']

    # Add parent_id for comments
    if 'parent_id' in row and pd.notna(row['parent_id']):
        doc['parent_id'] = row['parent_id']

    # Add date if available
    if 'date' in row and pd.notna(row['date']):
        try:
            # Handle different date formats
            date_str = row['date']
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                except ValueError:
                    # Try handling Unix timestamp
                    date_obj = datetime.fromtimestamp(float(date_str))
            doc['date'] = date_obj.isoformat() + 'Z'
        except Exception as e:
            print(f"Error parsing date {row['created_utc']}: {e}")

    # Add sentiment fields
    if 'sentiment' in row and pd.notna(row['sentiment']):
        doc['sentiment'] = row['sentiment']

    if 'sentiment_score' in row and pd.notna(row['sentiment_score']):
        doc['sentiment_score'] = float(row['sentiment_score'])

    # Add word count
    if 'word_count' in row and pd.notna(row['word_count']):
        doc['word_count'] = int(row['word_count'])

    # Add duplicate flag
    if 'is_duplicate' in row and pd.notna(row['is_duplicate']):
        doc['is_duplicate'] = True if row['is_duplicate'] == True or row['is_duplicate'] == 'True' else False

    # Add features if available
    feature_fields = ['fees', 'user_interface', 'customer_service', 'security', 'coin_listings', 'performance']
    for field in feature_fields:
        if field in row and pd.notna(row[field]):
            doc[field] = float(row[field])

     # Add entities and keywords if available
    if 'entities' in row and pd.notna(row['entities']):
        try:
            if isinstance(row['entities'], str):
                # Handle both JSON and string list formats
                if row['entities'].startswith('[') and row['entities'].endswith(']'):
                    try:
                        doc['entities'] = json.loads(row['entities'])
                    except:
                        try:
                            # Try parsing with ast for Python list literals
                            doc['entities'] = ast.literal_eval(row['entities'])
                        except:
                            pass
            else:
                doc['entities'] = row['entities']
        except Exception as e:
            print(f"Error parsing entities: {e}")
    
    if 'keywords' in row and pd.notna(row['keywords']):
        try:
            if isinstance(row['keywords'], str):
                # Handle both JSON and string list formats
                if row['keywords'].startswith('[') and row['keywords'].endswith(']'):
                    try:
                        doc['keywords'] = json.loads(row['keywords'])
                    except:
                        try:
                            # Try parsing with ast for Python list literals
                            doc['keywords'] = ast.literal_eval(row['keywords'])
                        except:
                            pass
            else:
                doc['keywords'] = row['keywords']
        except Exception as e:
            print(f"Error parsing keywords: {e}")
    
    documents.append(doc)

# Index documents in batches
batch_size = 500
for i in tqdm(range(0, len(documents), batch_size), desc="Indexing batches"):
    batch = documents[i:i + batch_size]
    try:
        solr.add(batch)
    except Exception as e:
        print(f"Error indexing batch {i}-{i + batch_size}: {e}")

print("Indexing complete!")
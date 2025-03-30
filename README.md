# Cryptocurrency Exchange Opinion Search Engine
## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Jabezng2/SC4021---Group-20.git
   cd SC4021---Group-20
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Apache Solr Setup and Guide:
- Download and install Solr 9.x from https://solr.apache.org/downloads.html
- Download the BINARY Release
- Navigate to your Solr 9.x root directory
- Start Solr:
```
bin/solr start (Unix) or bin\solr.cmd start (Windows)
```
- Start Solr in standalone mode not cloud
- Verify by navigating to http://localhost:8983/solr/
- Create a core:
```
bin/solr create -c crypto_opinions (Unix) or bin\solr.cmd create -c crypto_opinion(Windows)
```
- Copy schema and configuration:
  ```
  cp solr/managed-schema.xml <solr_installation>/server/solr/crypto_opinions/conf/
  ```
- Restart Solr: `bin/solr restart` (Unix) or `bin\solr.cmd restart` (Windows)
- Stop Existing Process:
  ```
  bin/solr stop
  ```
  OR
  ```
  lsof -i :<port number>
  kill -9 <pid>
  ```

5. Indexing
- Ensure that Solr is running. Restart if needed.
- Import data to Solr:
```
cd solr
python data_to_solr.py
```
- Indexing is completed

6. Start Flask Server
- Navigate to root directory
```
python app.py
```

7. Postman API Testing (Example URL)
```
http://127.0.0.1:5000/api/search
```

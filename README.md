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

6. Bash Commands to Setup Things Faster
- Ensure that you have CMake installed
- Ensure that you installed solr-9.8.1 and that solr-9.8.1 folder is in the solr directory
- Ensure that you have the virtual environment activated
- In the root directory run the dev.sh script to generate the build folder
```
./dev.sh start_backend
```
```
./dev.sh start_frontend
```

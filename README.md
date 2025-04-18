# Cryptocurrency Exchange Opinion Search Engine

## Project Overview
The objective of this assignment is to design and develop an opinion search engine that performs sentiment analysis on public opinions related to cryptocurrency exchanges. This information retrieval system aims to uncover key user concerns and preferences—such as transaction fees, platform reliability, and overall user experience—by analyzing discussions from online platforms. Insights gathered can help existing and future crypto exchanges better understand user expectations and improve their services. The project will focus on seven major exchanges: Binance, Coinbase, Kraken, OKX, KuCoin, Crypto.com, and Bybit.

## Project Structure
```
📁 SC4021---Group-20
 ├── 📂 backend            # Backend API Endpoints and Logic
 ├── 📂 crawler            # Notebooks containing crawling code
 ├── 📂 data               # Contains our csv files
 ├── 📂 frontend           # Next.js frontend
 ├── 📂 processing         # Dataset preprocessing code
 ├── 📂 classification     # Classification
 ├── README.md             # Project documentation
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jabezng2/SC4021---Group-20.git
   cd SC4021---Group-20
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apache Solr Setup and Guide:
- Download and install Solr 9.8.1 from https://solr.apache.org/downloads.html
- Download the BINARY Release
- Unzip the .tgz and copy the solr-9.8.1 folder to the solr folder in the repository
- Now navigate to solr/solr-9.8.1 from root directory
- Start Solr:
```bash
bin/solr start (Unix / MacOS) or bin\solr.cmd start (Windows)
```
- Start Solr in standalone mode not cloud
- Verify by navigating to http://localhost:8983/solr/
- In the solr-9.8.1 directory, create a core by running:
```bash
bin/solr create -c crypto_opinions (Unix / MacOS) or bin\solr.cmd create -c crypto_opinions(Windows)
```
- Verify that the core has been created by checking if crypto_opinions folder exists in solr-9.8.1/server/solr
- Copy schema and configuration to the conf folder in the core:
```bash
cp ../managed-schema.xml server/solr/crypto_opinions/conf/
```
- Verify that the managed-schema.xml has been copied to the conf folder in the core
- Restart Solr: `bin/solr restart` (Unix) or `bin\solr.cmd restart -p 8983` (Windows)

- Stop Existing Process:
 ```bash
 bin/solr stop / bin/solr stop -all
 ```
OR
```bash
lsof -i :<port number>
kill -9 <pid>
```

5. Indexing
- Ensure that Solr is running. Restart if needed.
- Import data to Solr:
```bash
cd solr
python data_to_solr.py
```
- Indexing is completed

6. Start Flask Server
- In root directory, ensure that venv is activated, run:
```bash
python app.py
```

7. Start Next.js frontend
- In root directory, run:
```bash
cd frontend
npm install
npm run dev
```


8. Bash Commands to Setup Things Faster
- Ensure that you have CMake installed
- Ensure that you installed solr-9.8.1 and that solr-9.8.1 folder is in the solr directory
- Ensure that you have the virtual environment activated
- In the root directory run the dev.sh script to generate the build folder
```bash
./dev.sh start_backend
```
```bash
./dev.sh start_frontend
```

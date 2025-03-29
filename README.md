# Cryptocurrency Exchange Opinion Search Engine

# Project Overview

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

4. Set up Apache Solr:
   - Download and install Solr 9.x from https://solr.apache.org/downloads.html
   - Start Solr: `bin/solr start` (Unix) or `bin\solr.cmd start` (Windows)
   - Create a core: `bin/solr create -c streaming_opinions` (Unix) or `bin\solr.cmd create -c streaming_opinions` (Windows)
   - Copy schema and configuration:
     ```
     cp solr_files/schema.xml <solr_installation>/server/solr/streaming_opinions/conf/
     ```
   - Restart Solr: `bin/solr restart` (Unix) or `bin\solr.cmd restart` (Windows)
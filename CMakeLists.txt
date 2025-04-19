cmake_minimum_required(VERSION 3.16)
project(DevRunner)

# Detect the Solr start command and Python based on OS
if(WIN32)
    set(SOLR_START_CMD bin\\solr.cmd)
    set(PYTHON_EXEC python)  # Assuming python is in PATH
else()
    set(SOLR_START_CMD bin/solr)
    set(PYTHON_EXEC python3) # Change if you want `python` on Mac too
endif()

# Start backend
add_custom_target(start_backend
    COMMAND ${CMAKE_COMMAND} -E echo "== Starting Backend =="
    # Copy managed-schema.xml
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/solr/managed-schema.xml ${CMAKE_SOURCE_DIR}/solr/solr-9.8.1/server/solr/crypto_opinions/conf/managed-schema.xml
    # Copy solrconfig.xml
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/solr/solrconfig.xml ${CMAKE_SOURCE_DIR}/solr/solr-9.8.1/server/solr/crypto_opinions/conf/solrconfig.xml
    # Start Solr
    COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR}/solr/solr-9.8.1 ${SOLR_START_CMD} start
    # Run data_to_solr.py
    COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR}/solr ${PYTHON_EXEC} data_to_solr.py
    # Start Flask backend
    COMMAND ${PYTHON_EXEC} app.py
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Running Solr, ingesting data, and starting Flask app"
)

# Start frontend
add_custom_target(start_frontend
    COMMAND ${CMAKE_COMMAND} -E echo "== Starting Frontend =="
    COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR}/frontend npm run dev
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Running frontend dev server"
)
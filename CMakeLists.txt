cmake_minimum_required(VERSION 3.16)
project(DevRunner)

# Detect the Solr start command based on OS
if(WIN32)
    set(SOLR_START_CMD "${CMAKE_SOURCE_DIR}/solr/solr-9.8.1/bin/solr.cmd")
else()
    set(SOLR_START_CMD bin/solr)
endif()

# Start backend
add_custom_target(start_backend
    COMMAND ${CMAKE_COMMAND} -E echo "== Starting Backend =="
    COMMAND ${CMAKE_COMMAND} -E echo "Copying managed-schema.xml..."
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_SOURCE_DIR}/server/solr/crypto_opinions/conf
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/solr/managed-schema.xml ${CMAKE_SOURCE_DIR}/server/solr/crypto_opinions/conf/
    
    COMMAND ${CMAKE_COMMAND} -E echo "Starting Solr..."
    COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR}/solr/solr-9.8.1 ${SOLR_START_CMD} start

    COMMAND ${CMAKE_COMMAND} -E echo "Running data_to_solr.py..."
    COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR}/solr python data_to_solr.py

    COMMAND ${CMAKE_COMMAND} -E echo "Starting Flask app..."
    COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR} python app.py

    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Running Solr, ingesting data, and starting Flask app"
)

# Start frontend
add_custom_target(start_frontend
    COMMAND ${CMAKE_COMMAND} -E echo "== Starting Frontend =="
    COMMAND ${CMAKE_COMMAND} -E chdir frontend npm run dev
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Running frontend dev server"
)
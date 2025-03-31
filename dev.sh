#!/bin/bash

mkdir -p build
cd build
cmake .. > /dev/null 2>&1
cmake --build . --target "$1"
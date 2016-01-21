#!/bin/bash
cd src
npm update
cd ..
mkdir -p src/debug
./src/node_modules/node-static/bin/cli.js -p 8082 src/debug &
gulp --cwd src debug

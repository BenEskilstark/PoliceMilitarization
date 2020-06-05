#!/bin/bash

mkdir bin

# flow transform
# npm run babel -- --presets flow index.js
npm run babel -- js/ -d bin

# scrape for todos
# printf "<----- ../TODO\n\n" > todos/INLINE
# grep -r "TODO" js >> todos/INLINE

# clientside require everything into a single bundle.js file
npm run browserify -- bin/index.js -o bin/bundle.js





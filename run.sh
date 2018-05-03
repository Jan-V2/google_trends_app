#!/usr/bin/env bash
browserify ./trends_game/libs/unbundled_browserify.js -o  ./trends_game/libs/bundle.js
node build_markdown.js
gulp dev
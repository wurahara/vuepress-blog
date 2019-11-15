#!/usr/bin/env sh

# make sure the script throws exception encountered
set -e

echo "\033[44;30m PRE \033[0m Generating the distribution files..." 

# delete the old version of distribution files
rm -rf docs/.vuepress/dist

# generate distribution files
npm run docs:build

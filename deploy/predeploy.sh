#!/usr/bin/env sh

# make sure the script throws exception encountered
set -e

echo "\033[44;30m PRE \033[0m Generating the distribution files..." 

# delete the old version of distribution files
sudo rm -rf docs/.vuepress/dist

# generate distribution files
sudo npm run docs:build
sudo chmod 777 docs/.vuepress/dist

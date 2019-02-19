#!/usr/bin/env sh

# make sure the script throws exception encountered
set -e

echo "\033[42;30m POST \033[0m Work finished.\n"

# delete the old version of distribution files
rm -rf docs/.vuepress/dist

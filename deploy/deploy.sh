#!/usr/bin/env sh

# make sure the script throws exception encountered
set -e

echo "\033[44;30m DEP \033[0m Deploying to github...\n"

# enter the folder of distribution files
cd docs/.vuepress/dist

# specify the custom domain
echo 'herculas.cn' > CNAME

# version control
git init
git add -A
git commit -m 'vuepress automatically deploy script'

# post to github
git push -f git@github.com:wurahara/wurahara.github.io.git master

echo "\033[42;30m POST \033[0m Work finished.\n"
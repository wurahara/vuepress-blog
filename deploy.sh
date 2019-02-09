#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 是发布到自定义域名
echo 'herculas.cn' > CNAME

git init
git add -A
git commit -m 'vuepress automatically deploy script'

# 发布到 https://<USERNAME>.github.io
git push -f git@github.com:wurahara/wurahara.github.io.git master

cd -

rm -rf docs/.vuepress/dist

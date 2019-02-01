---
title: 基于Vue.js的前端工程的容器化与自动构建
tags:
  - JavaScript
  - Vue.js
  - Docker
date: 2018-04-19 10:48:19
---


在前端工程中，部署是运维工程师经常面临的一个难题。对于大部分现代前端工程来说，工程师首先需要在服务器上配置好操作系统，一般是某个 Linux 发行版；接下来是配置 Node 环境和 NPM 包管理器，这是前端工程进行依赖安装和工程构建的必须环境；然后，工程师需要将构建好的 dist 文件部署到代理服务器程序上，一般使用 Nginx 或者 Apache。

在上述过程中，配置环境工作本身毫无技术含量，但是耗时长久，枯燥乏味，是对运维时间的极大浪费。此外，运维工程师还经常会遭遇到另一个噩梦般的问题，那就是依赖项的版本兼容性问题。当开发环境和部署环境的依赖版本不同（这几乎必然会发生）时，部署将会有很大概率失败。接下来将是漫长的 Debug 的时间，运维将耗费大量的时间精力去寻找冲突项。

为了解决上述难题，Docker 应运而生。Docker 和容器化思想将运行环境和依赖项都构建成独立镜像，让各工程独立运行在由这些镜像构建出的容器之中。这样可以轻松实现环境依赖的定制化，并且在大规模部署中可以做到一劳永逸，不需要考虑部署服务器的具体环境，只需要部署机上安装 Docker 守护程序即可。
考虑到现下网上尚未有比较全面的介绍基于Vue的前端工程的容器化的文章，本文将基于工程实践介绍将 Vue 工程 Docker 化并使用云平台进行自动构建的大致流程。

<!-- more -->

## 本地容器化

### 手动工程构建

我们先在本地使用Docker构建一个容器感受一下。首先手动使用NPM构建一下工程：

```bash
$ npm run build
```
这样，webpack就会构建出工程的dist发行版。

### Dockerfile

接下来，我们需要在工程的根目录下编写Dockerfile：

```Dockerfile
# 从官方镜像仓库拉取latest版本的nginx作为基础镜像
FROM nginx:latest

# 删除nginx的默认配置，用自定义配置替换
RUN rm /etc/nginx/conf.d/default.conf
ADD default.conf /etc/nginx/conf.d/

# 将生成的dist文件拷贝到nginx的运行目录下
COPY dist/ /usr/share/nginx/html/
```

### Nginx配置文件

然后，编写nginx的配置文件`default.conf`:

```conf
server {
    listen 8080;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        
        # redirect server error pages to the static page /50x/html
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root html;
        }
    }
}

```

### 创建镜像和容器

接下来，我们就将基于Dockerfile构建一个容器，在该容器中已经存在一个Nginx镜像，可以自动代理运行一个前端工程。

```bash
$ docker build -t ad-sys .
$ docker run -d -p 8080:8080 ad-sys
```

简要解释一下上述命令。

第一条命令将基于我们刚编写的Dockerfile构建一个名为`ad-sys`的镜像。参数`-t`用于指示生成镜像的标签信息。

第二条命令将会基于上述镜像创建一个新容器。参数`-d`指示容器可以在后台自动运行；`-p`指示将镜像端口映射到本地主机端口，在本例中，我们将容器的8080端口映射到本地主机的8080端口上。

这样，我们就成功在本地创建一个可以运行的基于nginx服务器的前端工程实例。在浏览器中输入`localhost:8080`即可看到运行结果。

## 云端容器化与自动构建

我们在上一部分介绍了在本地构建一个基于Docker的前端工程。但是该实例还不能充分利用Docker的所有优势。首先，在上述实例中，还有一部分操作需要由我们手动完成；此外，想要将构建的镜像部署到其它机器上，还需要进行机械的导入导出工作。因此，我们接下来将基于云平台构建一个完全自动化的Docker工程。

### 修改Dockerfile

我们可以将所有工作都交给Docker来自动地完成，这就需要我们修改Dockerfile的构建指令。在新容器中，我们需要完成工程的dist构建和nginx服务器部署。因此，新镜像中需要包含Node和Nginx环境。我们可以选用官方的Node镜像作为我们的基础镜像，然后在镜像中添加Nginx环境。参考官方的Nginx的Dockerfile，我们新的构建命令如下：

```Dockerfile
FROM node:latest

# add https support for nginx ca-certificates
RUN apt-get update && apt-get install -y apt-transport-https

# get key for apt-get nginx source upgrade
RUN apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
RUN echo "deb https://nginx.org/packages/mainline/debian/ stretch nginx" >> /etc/apt/sources.list.d/nginx.list

# set nginx environment
ENV NGINX_VERSION 1.13.12-1~stretch

RUN apt-get install -y ca-certificates nginx
RUN rm -rf /var/lib/apt/lists/*

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

RUN mkdir -p /var/www/html
WORKDIR /var/www/html

# build vue work with npm
COPY package.json /var/www/html/
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install
COPY . /var/www/html
RUN npm run build

# config nginx
ADD default.conf /etc/nginx/conf.d/
RUN cp -r /var/www/html/dist/. /usr/share/nginx/html/

# expose ports
EXPOSE 80 8080

# auto executing command
CMD ["nginx", "-g", "daemon off;"]
```

### 自动构建(Auto-building)

诸多Docker云平台都提供了自动构建的服务。我们可以选用Docker官方的Docker Hub和中国的DaoCloud。本文并不会详细介绍在云平台进行自动构建的详细步骤，仅对相关概念进行提纲挈领式的介绍。

在这些云平台中，我们可以将工程和GitHub的工程库绑定。这样，当有新的代码提交到GitHub版本库中时，云平台将会自动拉取新的代码，并基于代码库中的Dockerfile自动构建新的Docker镜像。如果绑定了自己的VPS主机，还可以将镜像自动部署到这些主机上。这样，就实现了“代码提交-自动构建-自动部署”的全自动化流程。

## 不足与改进

上述过程是否已经完美无缺了呢？其实不是。Docker最佳实践告诉我们，一个镜像和容器最好只做一件事情，要构建最精简的镜像，让每个镜像的用途都集中、单一。而我们为了自动化构建工程，将Node和Nginx环境都集成在了一个镜像之中。事实上，这个镜像构建完成后极其巨大，达1.13GB。在之后的文章中，我们将会介绍基于Docker Compose将过于庞大的镜像拆分成几个单一的小镜像，并构建一条编译流水线的方法。

## 参考文献

1. [使用docker基于daocloud自动化部署到自己的主机](https://segmentfault.com/a/1190000012677120)
2. [通过Nginx镜像部署Vue项目](https://blog.csdn.net/jason_jeson/article/details/78200623)

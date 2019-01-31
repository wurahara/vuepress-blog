---
title: webpack学习笔记
date: 2017-08-15 13:56:03
tags: webpack
---
# webpack学习笔记

## webpack简介

webpack 是一个现代 JavaScript 应用程序的模块打包器(_module bundler_)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(_dependency graph_)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成少量的_bundle_，由浏览器加载。

## webpack和Gulp与Grunt的区别

Grunt和Gulp都是前端工作流程自动化工具(_Task Runner_)，可以实现CSS、JS压缩，Less编译等操作。而Webpack是一种模块化解决方案，将项目中的复杂模块依赖关系打包成为浏览器可以识别并运行的JS文件。Webpack也可以完成一部分Grunt和Gulp的工作。

<!-- more -->

## webpack的简单配置

### 安装

```bash
# 全局安装Webpack
$ npm install -g webpack
```

### 配置文件

在项目根目录下新建文件`webpack.config.js`，并写入如下代码：
```JavaScript
const path = require('path');

module.exports = {
  entry: "./app/main.js",       //入口起点文件
  output: {
    path: path.resolve(__dirname, 'dist'),  //出口文件存放目录
    filename: "bundle.js"                   //打包文件名
  }
}
```

### 执行打包任务
在项目根目录下执行webpack命令，webpack将自动寻找到项目根目录下的配置文件，并按照文件的要求进行打包任务。在日常工作实践中，我们一般将webpack打包命令封装进`package.json`的`script`中。

```JSON
"scripts": {
    "build": "webpack"
  },
```
之后，我们就可以在终端或命令行中使用`npm run build`命令进行webpack打包了。

## webpack中的加载器(Loaders)
loader 用于对模块的源代码进行转换。loader 可以使你在 import 或"加载"模块时预处理文件。因此，loader 类似于其他构建工具(如_Gulp_或_Grunt_)中“任务(_task_)”，并提供了处理前端构建步骤的强大方法。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript，或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 `import` CSS文件！

项目中所需的Loaders需要在`npm`中单独安装，并在webpack配置文件的`modules`字段下配置，其配置选项主要包括以下几项：

- `test`：一个用以匹配loaders所处理文件的拓展名的正则表达式
- `loader`：loader的名称
- `include/exclude`(optional):手动添加必须处理的文件（文件夹）或屏蔽不需要处理的文件（文件夹）
- `query`(optional：为loaders提供额外的设置选项

以下是某个Loader配置实例：
```JavaScript
module: {
   rules: [
     {
       test: /\.js$/,
       loader: 'babel-loader',
       include: [resolve('src'), resolve('test')]
     },
     {
       test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
       loader: 'url-loader',
       options: {
         limit: 10000,
         name: utils.assetsPath('img/[name].[hash:7].[ext]')
       }
     },
     {
       test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
       loader: 'url-loader',
       options: {
         limit: 10000,
         name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
       }
     }
   ]
 }
```
在[官方文档](https://doc.webpack-china.org/loaders/ "Loaders")中详细介绍了各种Loaders的配置和功能，需要使用时可以作为参考。

## webpack中的插件(Plugins)

插件是 wepback 的支柱功能，其目的在于解决 loader 无法实现的其他事情。

Loaders和Plugins常常被弄混，但是他们其实是完全不同的东西。实际上，loaders是在打包构建过程中用来处理源文件的（JSX，Scss，Less..），一次处理一个，插件并不直接操作单个文件，它直接对整个构建过程其作用。

与Loaders类似，使用Plugins需要在`npm`中单独安装，然后在配置文件的`plugins`字段下添加插件的一个实例（plugins是一个数组）。以下是一个plugins配置实例：

```JavaScript
plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
```

### 常用的插件

__HtmlWebpackPlugin__

这个插件的作用是依据一个简单的index.html模板，生成一个自动引用你打包后的JS文件的新index.html。这在每次生成的js文件名称不同时非常有用（比如添加了hash值）。

__HotModuleReplacementPlugin__

`HotModuleReplacementPlugin`(_HMR_)也是webpack里很有用的一个插件，它允许你在修改组件代码后，自动刷新实时预览修改后的效果。

在webpack中实现HMR也很简单，只需要做两项配置:

- 在webpack配置文件中添加HMR插件
- 在Webpack Dev Server中添加“hot”参数

__其他优化插件__

- `OccurenceOrderPlugin`: 为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID
- `UglifyJsPlugin`: 压缩JS代码；
- `ExtractTextPlugin`: 分离CSS和JS文件

在[官方文档](https://doc.webpack-china.org/plugins/ "Plugins")中同样详细介绍了各种Plugins的配置和功能，需要使用时可以作为参考。

## webpack的其他常用功能

### 别名

实际项目中源文件不会放在项目的根目录中，而是集中放在某个文件夹内，比如`src`等。并且文件夹中又会再次将文件分类，例如分为`srcipts`和`styles`，`scripts`中又会添加为`components`和`utils`。`components`中下又有具体的组件文件夹等等。所以在引用模块或者组件时常常会发生这样的情况，引用名称冗长无比：

```JavaScript
require('./src/scripts/components/checkbox/checkbox.js');
```

然而仔细观察，`./src/scripts/components`这个路径是非常累赘的，几乎每个引用组件的语句都要使用到，所以我们可以在webpack配置文件中添加一个“代号”代指这个路径。这就是`alias`字段。`alias`字段必须添加在`resolve`字段下：

```JavaScript
module.exports = {
  // ...
  resolve: {
    alias: {
      '@': resolve('src'),
      'src': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'components': path.resolve(__dirname, '../src/components'),
      'views': path.resolve(__dirname, '../src/views'),
      'styles': path.resolve(__dirname, '../src/styles'),
      'api': path.resolve(__dirname, '../src/api'),
      'utils': path.resolve(__dirname, '../src/utils'),
      'store': path.resolve(__dirname, '../src/store'),
      'router': path.resolve(__dirname, '../src/router'),
      'mock': path.resolve(__dirname, '../src/mock'),
      'vendor': path.resolve(__dirname, '../src/vendor'),
      'static': path.resolve(__dirname, '../static')
    }
  },
  // ...
}
```
那么当我们需要引用`./src/components`目录下的组件时，引用的路径只是`components/checkbox.js`就可以了。

### Source Map

打包后的文件在调试时难以定位出错的位置，`Source Map`就是用于解决这一问题的工具。Webpack提供了生成`Source Map`的功能，为我们提供了一种对应编译文件和源文件的方法，使得编译后的代码可读性更高，也更容易调试。

在配置文件中添加`devtool`字段，就可以生成`Source Map`了。它有以下四种不同的配置选项，各具优缺点，描述如下：

|`devtool`选项|配置结果|
|:---:|:------------:|
|`source-map`|在一个单独的文件中产生一个完整且功能完全的文件。这个文件具有最好的`source map`，但是它会减慢打包速度|
|`cheap-module-source-map`|在一个单独的文件中生成一个不带列映射的`map`，不带列映射提高了打包速度，但是也使得浏览器开发者工具只能对应到具体的行，不能对应到具体的列（符号），会对调试造成不便|
|`eval-source-map`|使用`eval`打包源文件模块，在同一个文件中生成干净的完整的`source map`。这个选项可以在不影响构建速度的前提下生成完整的`source map`，但是对打包后输出的JS文件的执行具有性能和安全的隐患。在开发阶段这是一个非常好的选项，在生产阶段则一定不要启用这个选项|
|`cheap-module-eval-source-map`|这是在打包文件时最快的生成`source map`的方法，生成的`Source Map`会和打包后的JavaScript文件同行显示，没有列映射，和`eval-source-map`选项具有相似的缺点|


### 本地服务器

Webpack提供一个基于node.js构建的本地开发服务器，可以让浏览器监听代码的修改，并自动刷新显示修改后的结果。在webpack中进行配置之前需要单独安装它作为项目依赖：

```bash
$ npm install --save-dev webpack-dev-server
```

以下是`DevServer`的一些常用配置选项:

|`DevServer`的配置选项|功能描述|
|:-|:-|
|`contentBase`|默认`webpack-dev-server`会为根文件夹提供本地服务器，如果想为另外一个目录下的文件提供本地服务器，应该在这里设置其所在目录|
|`port`|设置默认监听端口，如果省略，默认为`8080`|
|`inline`|设置为`true`，当源文件改变时会自动刷新页面|
|`historyApiFallback`|在开发单页应用时非常有用，它依赖于`HTML5 history API`|

更多配置选项，请参考[官方文档](https://doc.webpack-china.org/configuration/dev-server/ "DevServer")。

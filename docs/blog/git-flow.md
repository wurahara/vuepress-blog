---
title: git-flow工作流程
tags: git
date: 2018-04-04 14:10:26
---


最近重启了招生办的项目。为了协调团队内的工作流程，大师兄建议我们学习一下git-flow，用来统一团队成员的版本管理风格。这篇文章就是对git-flow的简单总结。

<!-- more -->

## 分支的模式

git-flow会预设两个主分支在版本库中，分别是：

1. `master`：该分支只能用来容纳产品代码。任何团队成员在任何情况下都不能直接向`master`分支提交代码，只能通过操作其它指定的、独立的特性分支，并由这些分支向`master`分支合并代码。

2. `develop`：该分支是程序员进行开发的基础分支。当要开始一个新的功能分支时，`develop`应该是新分支的基础。此外，`develop`也应该汇集所有已经完成的功能，并等待被合并到`master`分支中。

以上两个分支被称为长期分支，会存活在项目的整个生命周期中。其他的分支，如针对特定功能的分支或针对发行的分支，都只是临时的分支，根据需要被创建出来，在完成任务后将会被立即删除。

## 新功能开发

### 开始新功能
```shell
git flow feature start rss-feed
```
输入上述指令，git-flow将会从`develop`签出一个名为`feature/rss-feed`的新分支，并直接转换到该分支。

 ![feature start](http://images.herculas.cn/image/blog/statecode/feature1.png)

### 完成新功能
```shell
git flow feature finish rss-feed
```
输入上述指令，git-flow会将该功能分支合并到`develop`分支中，并删除该分支，将工作流转换回`develop`分支中。

![feature finish](http://images.herculas.cn/image/blog/statecode/feature2.png)

接下来，在`develop`中保存的工作应该按照以下步骤处理：
1. 进行更广泛地、在开发背景下的全面测试；
2. 和积累在`develop`分支中的其他新功能一并合并到`master`分支中并发布。

## 管理releases

### 创建release
当程序员认为现在存在于`develop`分支中的代码已经成熟，可以进行发布时，这通常意味着：
1. 它包括了现有的全部新功能；
2. 它对已发现的所有bug和错误都做了必要的修复；
3. 它已经被系统地测试过了。

这样，生成新的`release`版本的时机已经成熟。
```shell
git flow release start 1.1.5
```

![release start](http://images.herculas.cn/image/blog/statecode/release1.png)

`release`分支通常以版本号命名。当完成`release`后，git-flow会自动的使用版本号在`master`分支标记那些`release`提交。创建`release`后，程序员需要在最终`release`前做最后的准备工作。

### 完成release
在准备工作全部完成后，就可以提交本次`release`了。
```shell
git flow release finish 1.1.5
```
上述命令将完成如下的操作：
1. git-flow拉取远程库，以确保目前的库是最新版本；
2. 将`release`内容合并到`master`和`develop`分支中。这样，不仅产品代码是最新版本，新的功能开发也将基于最新的代码；
3. 为了便于识别并作为历史参考，`release`提交将会被标记上该`release`的版本号；
4. git-flow删除该`release`分支，并转换到`develop`分支。

![release finish](http://images.herculas.cn/image/blog/statecode/release2.png)

## hotfix与热修复

`release`版本也难免会出现错误，此时需要进行紧急的修复工作。在这种情况下，不管使用`release`流程还是`feature`流程都是不恰当的。因此，git-flow提供了特定的`hotfix`工作流程以满足这种需求。

### 创建hotfix
```shell
git flow hotfix start missing-link
```
上述命令将创建一个名为`hotfix/missing-link`的修复分支。考虑到修复工作通常是直接针对已发布的代码的，所以该分支直接由`master`分支签出。

![hotfix start](http://images.herculas.cn/image/blog/statecode/hotfix1.png)

这就是`hotfix`流程和`release`流程的最显著的区别：`release`分支都是基于`develop`分支的，因为还未完成开发的代码，不存在修复的问题。
此外，修复错误还会直接影响到项目的版本号。

### 完成hotfix
```shell
git flow hotfix finish missing-link
```
完成`hotfix`的过程非常类似于`release`的过程：
1. 将完成的改动合并到`master`和`develop`分支中；
2. 在`master`分支中标记此次`hotfix`以供参考；
3. 删除该`hotfix`分支，然后转换到`develop`分支上。

![hotfix finish](http://images.herculas.cn/image/blog/statecode/hotfix2.png)

## 回顾
综合上述几个步骤，在一个系统、庞大的工程中，代码通常按照如下图的方式流动：

![git-model](http://nvie.com/img/git-model@2x.png)
<center>* [_A successful Git branching model_](http://nvie.com/posts/a-successful-git-branching-model/), Vincent Driessen (__License__: CC BY-SA)</center>

## 总结

1. git-flow并不扩展git的任何功能，而仅使用脚本封装了一系列git操作并以此构建一系列工作流程；
2. 定义明确的工作流程规范会使团队工作更加高效，但最关键的问题就是如何设计合适的规范；
3. git-flow并非唯一的工作流程方案，没有必要囿于成规；
4. 当正确地理解工作流程的基本组成和目标后，可以基于自己工作的实际情况设计新的工作流程规范。

## 参考文献

1. [git-flow 的工作流程](https://www.git-tower.com/learn/git/ebook/cn/command-line/advanced-topics/git-flow)
2. [git-flow 备忘清单](https://danielkummer.github.io/git-flow-cheatsheet/index.zh_CN.html)
3. [《Git版本控制管理》, Jon Loeliger, Matthew McCullough](https://book.douban.com/subject/26341974/)
4. [《GitHub入门与实践》, 大塚 弘記](https://book.douban.com/subject/26462816/)

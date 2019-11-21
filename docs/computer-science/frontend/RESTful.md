---
title: RESTful接口实现指南
categories: Frontend
tags: RESTful
date: 2017-12-17 15:44:42
---


在经过几次大的变革之后，Web 服务现在更倾向于使用前后端分离的架构来实现工作分离和关注点分离 (SoC, Seperation of Concerns)。面对前端设备的快速迭代和多样化，传统的前后端高度耦合的架构显然不再适应现代的开发环境。因此，需要有一种新的方式来协调前后端的数据流和交互逻辑。在此基础上，业界形成了各种 API 设计理论。其中，RESTful 是比较成熟且具有高度可行性的一套理论，现在被广泛应用于各种工程实践场合中。

本文旨在简要介绍 RESTful API 的设计细节，并在此基础上探讨如何设计一个健壮、可扩展并且好用的 RESTful API。

<!-- more -->

## REST和RESTful

REST 这个词，由[Roy Thomas Fielding](https://en.wikipedia.org/wiki/Roy_Fielding)于 2000 年在其[博士论文](http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)中提出。Fielding 是 HTTP1.0 和 HTTP1.1 的主要设计者，Apache 的作者之一，Apache 基金会的第一任主席。

REST 是 _Representational State Transfer_ 的缩写，即“表现层状态转移”。如果一个接口设计符合 REST 的原则，我们就称其为 RESTful 架构。想要理解 RESTful 架构，就必须先理解什么是“表现层状态转移”。

1. **资源(Resources)**

“表现层状态转移”中的主语是什么呢？实际上是“（资源的）表现层”。所谓资源，指的是具体的信息，比如文本、图片等。可以用一个 URL 指向它，也就是说，想要访问一个资源，只需要访问其 URL 即可。

2. **表现层(Representation)**

“资源”作为信息实体，有多种表现形式。资源具体的表现形式，就是其”表现层“。比如，对于同一段文本信息，我们可以用 txt 格式、HTML 格式、XML 格式、JSON 格式来表现；对于同一内容的图片，可以采用 JPEG 格式，PNG 格式、GIF 格式等表现。

URL 只用于表现资源的实体，不代表其格式。因此，按照这种标准，有些网址最后的”.html“是不符标准的，因为该后缀名表示格式，属于“表现层”，而 URL 只用于表示资源的定位。具体的格式信息，因包含在 HTTP 的请求头中，由 _Accept_ 和 _Content-Type_ 字段制定。

3. **状态转移(State Transfer)**

众所周知，HTTP 协议是一个无状态协议。这意味着所有的状态都保存在服务器中。如果客户端想要操纵服务器，就需要使用某种方法，使服务器发生状态变化。由于该转化发生在表现层，所以就有“表现层状态转移”。

通常，客户端通过 HTTP 协议中的动词来实现基本的状态操作，具体方法我们将在下面介绍。

## REST 对请求体 (Request) 的基本约定

基于上面的叙述，RESTful 架构利用 HTTP 协议的几种请求动词，实现 API 接口的高度语义化。在请求层面，RESTful 规范可以抽象为以下两个原则：

1. 使用请求 API 的 URL 定位资源；
2. 使用请求 API 的 METHOD 表示对该资源的具体操作。

下面，我们将针对以上两点，简要介绍如何设计出一个 RESTful 的接口。

## 定位：API 的 URL

如上所述，URL 用于定位资源，必须跟要进行的操作分离。这就意味着，URL 中不能出现任何动词。下面是一些错误的示范：

```
/api/getUser/
/api/createApp/
/api/searchResult/
/api/deleteAllUsers/
```

上面的案例中，get，create，search 等动词都不应该出现在 RESTful 架构的后端接口路径中。

在 RESTful 架构中，URL 应该满足如下要求：

1. URL 中不应该出现任何表示操作的动词，定位符只用于对应资源；
2. URL 中应该单复数严格区分，推荐的实践是永远只用复数，比如：
    ```
    GET /api/users
    GET /api/users/123
    ```
3. 按照资源的逻辑层级，对URL进行嵌套。

## 操作：API的METHOD

在很多传统的接口系统开发实践中，程序员几乎只使用 GET 和 POST 方法来完成所有的操作，这没有很好地利用 HTTP 协议的强大功能。在 RESTful 架构中，我们通常可以使用以下几个请求方法：GET、POST、PUT、PATCH、DELETE 等。这几种方法都可以和对数据的 CRUD 操作对应起来。

1. __Create(C)__

    资源的创建，主要使用 POST 方法。POST 是一个非幂等 (Indempotent) 方法，多次对该方法的调用会出现不同的结果。

2. __Read(R)__

    资源的读取，主要使用 GET 方法。GET 方法应该实现为一个安全方法，用于获取数据而不产生任何副作用。

3. __Update(U)__

    资源的更新，主要用 PUT 和 PATCH 方法。PUT 和 PATCH 方法都应该实现为幂等方法，即多次同样的更新请求应对服务器产生同样的副作用。
    PUT 用于更新服务器的全部信息，在请求的 body 中要传入修改后的全部资源主体。
    PATCH 用于局部更新，在 body 中只需传入需要改动的资源片段。

4. __Delete(D)__

    资源的删除，主要使用 DELETE 方法。DELETE 方法也应该被实现为一个幂等方法，对此请求删除同一个资源产生的副作用是服务器上的该资源不存在。

## 分页 (Pagination) 和过滤 (Filtering)

RESTful 风格的接口地址也可以用于资源的聚合。当设定接口参数时，允许只返回满足某些条件的资源列表。

1. 支持以 offset 和 limit 参数来进行分页，如：
    ```
    GET /api/users?offset=0&limit=20
    ```

2. 支持提供关键字进行搜索和排序，如：
    ```
    GET /api/users?keyword=john&sort=age
    ```

3. 支持根据字段进行过滤，如：
    ```
    GET /api/users?gender=male
    ```

## 状态码 (Status Codes)

服务器通过向客户端返回状态码来进行操作状态提示。按照第一位，状态码通常如下分类：

|状态码首位|类信息|简介|说明|
|:-:|:----:|:--:|:-----------------:|
|1|Informational|信息|服务器在完成请求并发送最终响应前用于传递连接状态或请求进度的临时响应。服务器不应向客户端发送1xx响应。|
|2|Successful|成功|客户端请求已被成功接收(Received)，理解(Understood)和接受(Accepted)。|
|3|Redirection|重定向|用户需要进一步行动来完成请求。|
|4|Client Error|客户端错误|客户端似乎有错误。服务器将返回包含错误情况解释的信息，以及说明这是临时情况还是永久状态。|
|5|Server Error|服务器错误|服务器知道其已经发生错误或无法完成请求的方法。服务器将返回包含错误情况解释的信息，以及说明这是临时情况还是永久状态。|

常见的状态码有如下的这些：

|状态码|状态信息|HTTP方法|说明|
|:--:|:----:|:------:|:---------------------:|
|200|OK|GET|服务器成功返回请求的数据|
|201|Created|POST/PUT/PATCH|用户新建或修改数据成功|
|202|Accepted|-|请求（异步任务）已进入后台排队|
|204|No Content|DELETE|用户删除数据成功|
|400|Bad Request|POST/PUT/PATCH|用户的请求有误，服务器未进行新建或修改操作|
|401|Unauthorized|-|用户未得到权限（令牌、用户名或密码错误）|
|403|Forbidden|-|与401相对，表示用户虽得到授权，但访问被禁止|
|404|Not Found|-|用户发出的请求针对的是不存在的记录，服务器没有进行操作|
|406|Not Acceptable|GET|用户请求的格式不可得（如用户请求JSON，但只有XML）|
|410|Gone|GET|用户请求的资源被永久删除|
|422|Unprocesable Entity|POST/PUT/PATCH|当创建一个对象时，发生一个验证错误|
|500|Internal Server Error|-|服务器发生错误，用户将无法判断发出的请求是否成功|



完整的状态码列表，请参看 [RCF7231](https://www.rfc-editor.org/rfc/pdfrfc/rfc7231.txt.pdf)。

## 错误处理(Error Handling)

若状态码是 4xx，服务器就应当向用户返回错误信息。一般地，返回的信息中将以 error 作为键名，错误提示信息作为键值，如：

```JSON
{
    error: "Invalid API key"
}
```

## 返回体(Request Body)

针对不同的操作和方法，服务器应向客户端返回一定格式的结果，具体如下：

```
GET /collection //返回资源对象的列表（数组）
GET /collection/resource //返回单个资源对象
POST /collection //返回新生成的资源对象
PUT /collection/resource //返回完整的资源对象
PATCH /collection/resource //返回完整的资源对象
DELETE /collection/resource //返回一个空文档
```

## 参考文献

1. [RESTful API设计指南](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)
2. [理解RESTful架构](http://www.ruanyifeng.com/blog/2011/09/restful.html)
3. [RESTful接口实现简明指南](https://zhuanlan.zhihu.com/p/28674721)

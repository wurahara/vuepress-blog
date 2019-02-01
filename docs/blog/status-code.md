---
title: HTTP的状态码
tags: HTTP
date: 2018-04-02 16:09:28
---


之前在 [RESTful 架构简介](./RESTful.html) 一文中，我们已经简要地介绍了常用的几个 HTTP 状态码，但该文还不够全面，也不够系统。所以此次特地用这篇文章更详细地讨论 HTTP 状态码的基本知识和工程实践中的具体应用。

<!-- more -->

## 规范历史
在[《图解HTTP》](https://book.douban.com/subject/25863515/)一书中，作者介绍 HTTP 状态码的主要参考文献是 RFC 文档 [RFC2616](https://tools.ietf.org/html/rfc2616)。该文档规范完成于 1999 年 6 月，是最早的关于 HTTP/1.1 的文档草案。该文档之后被一系列新的规范扩充和取代，他们分别是：
1. [RFC7230，关于消息语法和路由 (Message Syntax and Routing)](https://tools.ietf.org/html/rfc7230)；
2. [RFC7231，关于语义和内容 (Semantics and Content)](https://tools.ietf.org/html/rfc7231)；
3. [RFC7232，关于条件请求 (Conditional Requests)](https://tools.ietf.org/html/rfc7232)；
4. [RFC7233，关于范围请求 (Range Requests)](https://tools.ietf.org/html/rfc7233)；
5. [RFC7234，关于缓存 (Caching)](https://tools.ietf.org/html/rfc7234)；
6. [RFC7235，关于认证 (Authentication)](https://tools.ietf.org/html/rfc7235)。

关于HTTP状态码的内容主要记录在 RFC7231 中。此外，还有一份补充文件记录了一些附加的状态码，即 2012 年 3 月通过的 [RFC6585](https://tools.ietf.org/html/rfc6585)，该文档扩展了 4XX 和 5XX 的一些状态。

## 状态码的分类
状态码通常由三位数字组成，其首位揭示了该状态码的类别信息。

|状态码|类信息|简介|说明|
|:-:|:----:|:--:|:-----------------:|
|1xx|Informational|信息性状态码|服务器在完成请求并发送最终响应前用于传递连接状态或请求进度的临时响应。服务器不应向客户端发送1xx响应。|
|2xx|Success|成功状态码|服务器成功地处理了客户端发送的请求，并返回响应。|
|3xx|Redirection|重定向状态码|客户端需要进行附加的操作已完成请求。|
|4xx|Client Error|客户端错误状态码|客户端似乎有错误，服务器无法处理本次请求。|
|5xx|Server Error|服务器错误状态码|服务端在处理本次请求时出错。|

## 常用的状态码
[RCF7231](https://www.rfc-editor.org/rfc/pdfrfc/rfc7231.txt.pdf) 中规定了数量众多的状态码，但是在工程中通常只实现全部状态的一个子集。下面对工程中经常用到的 14 个状态码进行详细介绍。

### 2XX 成功(Success)

1. **200 OK**

表示服务器正常处理了客户端发送的请求，并按照客户端的要求返回响应。

2. **204 No Content**

服务器已经正常处理了请求，但是返回的响应报文的实体中不含主体部分。当客户端收到服务端返回的 204 状态的报文时，浏览器不应更新页面。

3. **206 Partial Content**

表示客户端进行了**范围请求** (Range Request)，而服务器正确理解并执行了该请求。在响应报文中，首部应包含`Content-Range`字段以指定实体内容的范围。

### 3XX 重定向(Redirection)

1. **301 Moved Permanently**

永久性重定向。表示客户端请求的资源已经被分配了新的URI。

2. **302 Found**

临时性重定向。表示客户端请求的资源已经被分配了新的 URI，并希望用户在本次能够使用新的 URI 进行访问。和 301 响应不同，302 响应表明，已移动的资源对应的 URI 在将来还有可能发生改变。

3. **303 See Other**

表示由于请求的资源存在着另一个 URI，应使用 GET 方法重新定向获取请求的资源。

::: tip
HTTP/1.1 以前的很多浏览器不能正确理解 303 状态。虽然 RFC 的很多文档不允许客户端在重定向时改变请求方法，但是很多浏览器将 302 响应视为 303 响应并使用 GET 方法访问 Location 中规定的 URI，而无视原先的请求方法。
:::
::: tip
当 301、302 和 303 状态返回时，几乎所有的浏览器都会将 POST 方法改为 GET 方法，并删除报文主体，之后请求会自动再次发送。
:::

4. **304 Not Modified**

表示客户端发送了**条件请求** (Conditional Request，指采用 GET 方法的请求报文中包含`If-Match`、`If-Modified-Since`、`If-None-Match`、`If-Range`或`If-Unmodified-Since`中的任一首部)，但是请求的资源没有满足请求条件。此时服务端会返回 304 状态，代表服务端的资源未被改变，客户端可以直接使用未过期的缓存。

::: tip
奇怪的是，304 虽然被划分在 3XX Redirection 类别中，但与重定向毫无关系。
:::

5. **307 Temporary Redirect**

临时性重定向。该状态码在实践中和 302 Found 含义相同。

### 4XX 客户端错误(Client Error)

1. **400 Bad Request**

表示请求报文中可能存在语法错误，服务端无法理解并解析该请求。一般地，浏览器会像对待 200 OK 一样对待该类响应。

2. **401 Unauthorized**

表示发送的请求需要有通过 HTTP 认证（Basic 认证或 Digest 认证）的认证信息。如果之前已经进行过一次请求，并已经收到过一次 401 响应，则表示用户的 HTTP 认证失败。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/statecode/401.png"
    width="70%"
    alt="401响应"
/>
</div>

3. **403 Forbidden**

表示服务器拒绝了客户端对所请求的资源的访问。服务器没有义务给出拒绝请求的具体原因。

4. **404 Not Found**

表示服务器上无法找到所请求的资源。此外，当服务器想拒绝某次请求且不想说明理由时，也可返回 404 状态。

::: warning CAUTION
需要注意的是，404 状态在工程实践中常被滥用，一些本应使用其他 4XX 状态的响应都被冠以 404 状态返回。
:::

### 5XX 服务端错误(Server Error)

1. **500 Internal Server Error**

表示服务端在解析请求时发生了错误，这可能是 Web 应用的 bug 或者临时性故障造成的。

2. **503 Service Unavailable**

表示服务器目前处在超负荷状态或者正在停机维护，无法立时处理请求。如果服务器能够预测解决目前状况所需的时间，可以在响应报文的首部中写入`Retry-After`字段，以指示客户端在一定时间后重新发出请求。

## 参考文献

1. [《图解HTTP》, 上野 宣](https://book.douban.com/subject/25863515/)

---
series: 简易区块链加密货币构建教程
title: 交易
enable html: true
categories: NaiveCoin
tags:
    - blockchain
    - cryptocurrency
    - cryptography
date: 2019-09-20 14:25:20
---

在本系列的上一节中，我们介绍了一个最小的区块链实现，并在区块链中加入了工作量证明作为共识机制。但是我们还没有向区块链中加入交易系统。这意味着，在之前的版本中，我们无法激励矿工们主动创造区块。在一个成熟的区块链加密货币系统中，矿工们每当创造一个区块时，总能获取报酬，这激励他们解决计算难题并创造区块。

在本节中，我们将向我们的系统中引入交易系统，这将把我们的系统从一个通用的区块链应用转化为一个区块链加密货币。在本节结束时，我们系统的使用者能够向指定地址交付指定数量的货币，只要他能够证明他确实持有这些货币。

<!-- more -->

## 公钥密码学与数字签名

在介绍交易之前，我们首先需要简要介绍一下公钥密码学与数字签名的相关内容，这些技术在加密货币交易中会被使用到。

### 公钥密码体制

和传统的对称密码学不同，公钥密码学是非对称的，它使用两个独立的密钥——即公钥和私钥——来实现互补运算，例如加密与解密，或者生成签名与验证签名。在公钥密码体制中，加密过程将产生一个密钥对。其中的私钥由用户持有，公钥由用户公开给加密通信方。

当处于加密通信场景下，假如 Bob 要向 Alice 发送消息，则 Bob 用 Alice 的公钥对消息进行加密。Alice 收到消息后，使用自己的私钥对消息解密。由于只有 Alice 持有自身的私钥，所以该消息只能由 Alice 解密，其他任何人无法解密出消息。

### 数字签名

数字签名是公钥密码学的一个应用。在通信过程中，我们可以通过加密和消息认证的手段防止第三方的攻击。但是这些手段无法防止通信双方自身发生的攻击行为。

假设现在有 John 向 Mary 发送了一条信息，设想下面的两种情况：

- Mary 可以伪造一条消息，并声称该消息来自 John；
- John 可以否认曾向 Mary 发送过这条消息。

上述两种情况分别称为接收方抵赖和发送方抵赖。这两种情况在现实中都会发生。比如，对于第一种情形，在电子资金转帐时，接收方可以擅自增加转账交易资金，并声称这是来自发送方的转账金额；对于第二种情况，股票经纪人收到有关电子邮件消息，要他进行一笔交易，而这笔交易后来赔钱了，于是发送方可以伪称从未发送过这条消息。

在收发双方不能建立信任的情况下，就需要认证之外的手段来解决问题。数字签名是解决该问题的最好方法。

### 椭圆曲线数字签名算法 (ECDSA, Elliptic Curve Digital Signature Algorithm)



## 交易 (Transaction)

在着手开始编码之前，让我们先简要介绍一下一笔交易的结构。一笔交易包含两个部分：输入部分和输出部分。输出部分指定了交易中货币的接收方，而输入部分证明交易中给出的货币确实存在，且属于发送方。每笔交易的输入部分通常就是已有的某些交易的（未花费的）输出部分。

### 交易的输入与输出

#### 输出部分

每个交易输出记录都包含两个部分，目的地址`address`和交易金额`amount`。地址`address`其实就是 ECDSA 的公钥。这意味着只有拥有和该公钥配对的私钥的用户才能获得这笔金额的所有权。

```Java
public class TransactionOutput {
    private String address;
    private Double amount;
}
```

#### 输入部分

交易输入部分提供了用于交易的货币的来源信息。事实上，每笔交易的每个输入部分都来自该交易之前的某个交易的输出部分。在输入部分，货币被解锁从而可以用于交易。而数字签名证明了，只有拥有和接收地址相匹配的私钥的用户才能创建交易。

```Java
public class TransactionInput {
    private String transactionOutputId;
    private Integer transactionOutputIndex;
    private String signature;
}
```

需要说明的是，交易输入部分只包含由私钥产生的数字签名，而不包含私钥本身。而区块链记录了公钥和签名，也不包含私钥数据。

因此，我们可以这样理解：交易输入解锁了货币，而交易输出重新将所得的货币上锁。

### 交易的结构

一笔交易的结构很简单，由其中包含的交易输入和交易输出构成：

```Java
public class Transaction {
    private String transactionId;
    private List<TransactionInput> transactionInputs;
    private List<TransactionOutput> transactionOutputs;
}
```

交易的`transactionId`就是交易内容的哈希值，由以下方法计算。

```Java
private String getTransactionId(Transaction transaction) {
    String inputsDigest = transaction
        .getTransactionInputs()
        .parallelStream()
        .map(transactionInput ->
             transactionInput.getTransactionOutputId() + 
             transactionInput.getTransactionOutputIndex())
        .reduce("", (a, b) -> a + b);
    String outputsDigest = transaction
        .getTransactionOutputs()
        .parallelStream()
        .map(transactionOutput ->
             transactionOutput.getAddress() + 
             transactionOutput.getAmount())
        .reduce("", (a, b) -> a + b);
    return HashGenerator.generateHash(inputsDigest + outputsDigest);
}
```

### 交易签名

交易的内容当然是不能随意更改的。然而交易信息是公开的，每个人都可以访问，所以需要对交易进行签名。在对交易进行签名的时候，仅需要对交易输入的`transactionId`字段进行签名。因为如果交易中的任何其他信息发生了改变，都会导致`transactionId`字段发生变化，因此只需要关注这个字段即可。

```Java
private String signTransactionInput(Transaction transaction, String privateKeyInString) {
    String dataToSign = transaction.getTransactionId();
    return TransactionSigner.generateTransactionSignature(privateKeyInString, dataToSign);
}
```

让我们假设一种交易信息被篡改的情况：

1. 攻击者收到了一个交易信息，里面记录了“AAA 向 BBB 发送了 10 个货币”，该交易的`transactionId`为`0x555...`；
2. 攻击者将接收者的地址改成了 CCC，并将该信息向全网广播。现在，这个交易的内容变成了“AAA 向 CCC 发送了 10 个货币”；
3. 因为接收者地址发生了变化，原有的`transactionId`失效。新的合法的`transactionId`为`0x567...`；
4. 如果`transactionId`字段被重新设定为`0x567...`，该交易的签名就会失效；该交易的签名只和`0x555...`相匹配；
5. 因为`transactionId`和签名发生了冲突，被修改的交易不会被其他节点接受。

### 未花费的交易输出

我们前面介绍了，一个交易输入记录必定对应着之前的某个未被花费的交易输出记录。这就表示，当你在区块链中拥有了一些货币，它的实际意义其实是你在区块链中拥有着一系列的未花费交易输出记录，这些记录的地址（即公钥）对应着你持有的私钥。

```Java
public class UnspentTransactionOutput {
    private String transactionOutputId;
    private Integer transactionOutputIndex;
    private String address;
    private Double amount;
}
```

当需要进行交易验证时，我们其实只需关注未花费交易输出记录列表就好。而未花费交易输出记录表可以从区块链中得到。

### 更新未花费交易输出

每当一个新区块被加入到主链中时，我们都需要更新未花费交易输出记录表。这是因为新的交易将会花掉未花费交易输出记录表中的一些项目，并向表中添加一些新的项目。

因此，我们首先需要从新区块中获取所有的未花费交易输出记录。

接下来，我们需要知道，在已有的未花费交易输出记录中，有哪些在新区块中被花掉了。这项工作需要检查新区块的交易输入记录表。

最后，我们可以生成新的未花费交易输出记录表，只需要将已花费的交易输出剔除，再加上新的未花费交易输出记录即可。

### 交易验证

下面，我们重新整理以下验证一项交易合法性的几个重要步骤。

#### 检查交易结构

#### 验证交易ID

#### 验证交易输入列表

#### 验证交易输出数值

### 创币交易 (Coinbase Transaction)

我们前面说了，每笔交易的输入都是之前的某笔交易的输出。但是最初的货币从何而来？

事实上，在区块链加密货币中，有一类特殊的交易，被称为创币交易，只包含交易输出，而没有交易输入。这意味着创币交易会向交易池中添加新的货币。

在我们的简单实现中，我们指定每笔创币交易会凭空产生 50 个单位的货币。

创币交易一般都是每个区块链中记录的第一笔交易，用以奖励生成该区块的矿工。

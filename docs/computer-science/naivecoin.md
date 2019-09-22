---
series: 简易区块链加密货币构建教程
title: 骨干区块链的构建
enable html: true
categories: NaiveCoin
tags:
    - blockchain
    - cryptocurrency
    - cryptography
date: 2019-09-20 09:48:15
---

本系列教程将从零开始教你构建一个加密货币。本教程旨在探讨区块链的基本概念和运行机制，教程最后所实现的加密货币并不适合生产环境的部署，但包含了区块链加密货币的几乎全部组成部分，很适合学习和理解。本教程参考自 Lauri Hartikka 的[教程](http://lhartikk.github.io/)。

今天的第一节，我们首先搭建一个区块链的骨干架构。

<!-- more -->

在今天的教程结束时，我们能够实现以下目标：

- 实现基础的区块和区块链；
- 实现向区块链中添加包含任意数据信息的区块的方法；
- 实现区块链的工作量证明。

## 区块链的最小实现

### 区块的结构

在开始，我们首先需要定义区块链的最小单元——区块的结构。在现阶段，我们的区块只包含最简单的元素：

- **index**：区块在链中的索引，即区块的高度 (height)；
- **data**：区块链中包含的数据，在现阶段为字符串类型；
- **timestamp**：区块的时间戳；
- **hash**：自区块的其他字段生成的 SHA-256 哈希；
- **previousHash**：本区块前一个区块的哈希值。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/blockchain/01/blockchain.png"
    width="90%"
    alt="区块链"
/>
</div>

使用 Java 语言实现的区块类如下：

```Java
public class Block {
    private Integer index;
    private String hash;
    private String previousHash;
    private Long timestamp;
    private String data;
}
```

上述代码中我们省略了 POJO 类的`getter`、`setter`方法和全参构造器。

### 区块哈希

区块哈希是区块中最重要的字段，由区块中其他所有字段计算得到。这意味着如果恶意篡改者篡改了区块中的某个字段，这个哈希值就不再有效。且每一个区块的哈希都会传递到下一个区块中，这意味着所有区块都通过哈希值联系在了一起。单独修改任何区块的任何一个字段都可以通过检测哈希值来发现。

```Java
public static String generateHash(String data) {
    try {
        MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
        byte[] hashByteCode = messageDigest.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder buffer = new StringBuilder(hashByteCode.length * 2);
        for (byte b : hashByteCode) {
            buffer.append(String.format("%02x", b & 0xff));
        }
        return buffer.toString();
    } catch (NoSuchAlgorithmException e) {
        throw new BlockchainException(ExceptionStatusEnum.HASH_ERROR);
    }
}

public static String generateBlockHash(Integer index, String previousHash, Long timestamp, String data) {
    return generateHash(index + previousHash + timestamp + data);
}
```

换句话说，想要修改某个字段，就要修改这个区块之前的所有区块的哈希值。这意味着，一个区块在链中越深的位置，它就越难被篡改，因为篡改需要修改的区块太多。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/blockchain/01/hash_conflict.png"
    width="90%"
    alt="区块哈希"
/>
</div>

### 创世区块 (Genesis Block)

创世区块是区块链中的第一个区块，作为一个特殊的区块，它没有`previousHash`字段。一般我们使用硬编码的手段将创世区块写入区块链：

```Java
Block genesisBlock = new Block(
    0,
    "c815f1f1fb1055bd4b2e7018329c863bfe6d7550673aea8aa841f150b06d6a73",
    "",
    new Date().getTime(),
    "Genesis Block")
```

### 生成区块

在生成新区块时，我们必须要知道前一个区块的哈希值。终端使用者向区块提供`data`字段，其他字段由以下代码生成：

```Java
public Block generateBlock(String data) {
    Block latestBlock = this.getLatestBlock();
    Integer index = latestBlock.getIndex() + 1;
    String previousHash = latestBlock.getHash();
    Long timestamp = new Date().getTime() / 1000;
    String hash = HashGenerator.generateBlockHash(index, previousHash, timestamp, data);
    Block newBlock = new Block(index, hash, previousHash, timestamp, data);
    return newBlock;
}
```

### 区块完整性验证

考虑到一个区块链节点有可能在任意时刻收到其他节点发来的新区块，我们必须能够在任意时刻都能验证区块和区块链的完整性和正确性。对于一个有效的区块，以下条件必须满足：

- 该区块的`index`字段必须比链中现存高度最高的区块的`index`字段大 1；
- 该区块的`previousHash`字段必须和链中现存高度最高的区块的`hash`字段完全相同；
- 该区块自身的`hash`字段必须有效。

基于以上标准，我们可以实现以下方法：

```Java
public static Boolean validateBlock(Block previousBlock, Block currentBlock) {
    if (previousBlock.getIndex() + 1 != currentBlock.getIndex()) {
        return false;
    } else if (!previousBlock.getHash().equals(currentBlock.getPreviousHash())) {
        return false;
    } else return BlockValidator.validateHash(currentBlock);
}
```

接下来，我们还要实现对区块链全链的完整性验证。对于全链的验证，我们主要需要完成以下两个部分的工作：

- 验证创世区块；
- 用我们上面介绍的区块验证方法验证之后的每个区块与其前一区块之间的完整性。

```Java
public Boolean validateBlockchain(List<Block> blocks) {
    Block genesisBlockReceived = blocks.get(0);
    if (!BlockValidator.validateGenesisBlock(genesisBlockReceived))
        return false;
    
    for (int index = 1; index < blocks.size(); index++)
        if (!BlockValidator.validateBlock(blocks.get(index - 1), blocks.get(index)))
            return false;
    return true;
}
```

### 选择最长链

在任意时刻，区块链主链只能有一条。为了防止区块链分叉，我们必须要有一种解决区块分叉的方法。一般地，我们总是接受两条链中较长的一条作为主链。如果两条链长度相同，就等待某一条链先产生新区块，就接受该链作为主链，并丢弃另一条链。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/blockchain/01/longest_chain.png"
    width="90%"
    alt="选择最长链"
/>
</div>

```Java
public List<Block> replaceBlockchain(List<Block> blocks) {
    if (this.validateBlockchain(blocks) && blocks.size() > this.getBlockchain().size()) {
        System.out.println("Received blockchain is valid. Replacing current blockchain with received blockchain.");
        return blocks;
    }
    System.out.println("Received blockchain invalid. Dropped.");
    return null;
}
```

## 工作量证明 (PoW, Proof of Work)

上一部分中，我们实现了一个最小版本的区块链。在这个区块链中，任何人都可以在不花费任何代价的情况下向区块链中添加新区块。在这个部分中，我们将向我们的区块链中添加工作量证明系统，这样想向区块链中添加新区块的人必须要先解决一个计算难题。解决计算难题的过程，就是我们通称的“挖矿 (mining)”。

除此之外，工作量证明系统还能够控制出块的大致时间间隔。通过控制计算难题的难度，就可以调整出块的时间间隔到一个比较合理的区间范围内。

### 工作量证明难题

想要实现 PoW 系统，我们需要先在我们定义的区块类中添加两个新属性：`difficulty`和`nonce`。为了说明添加这两个属性的目的，我们首先介绍 PoW 难题。

PoW 难题指的是寻找一个块哈希，这个块哈希的前缀由一定数量的`0`组成。`difficulty`字段指示了为了使该区块有效，需要哈希值的前多少位都为`0`。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/blockchain/01/difficulty_in_pow.png"
    width="90%"
    alt="选择最长链"
/>
</div>

```Java
public static Boolean validateDifficulty(String hash, Integer difficulty) {
    String hashInBinary = RadixConverter.hexToBinary(hash);
    String requiredPrefix = new String(new char[difficulty]).replace("\0", "0");
    return hashInBinary.startsWith(requiredPrefix);
}
```

然而，对于固定的区块内容，其产生的哈希值理论上是固定的。如何调整哈希值使得其前缀为固定位数的`0`呢？这时候就需要一个不固定的属性`nonce`了。`nonce`就是一个随机数，用于调整区块的哈希值。因此，“挖矿”的具体工作其实就是寻找一个`nonce`使得哈希值满足`difficulty`的要求。

加入了新的字段的`Block`类如下：

```Java
public class Block {
    private Integer index;
    private String hash;
    private String previousHash;
    private Long timestamp;
    private String data;
    private Integer difficulty;
    private Integer nonce;
}
```

### 挖矿

如上所述，为了寻找满足`difficulty`要求的块哈希，我们不断需要改变`nonce`的值来测试新生成的哈希值是否满足要求。

```Java
private Block mineBlock(Integer index, String previousHash, Long timestamp, 
                        String data, Integer difficulty) {
    Integer nonce = 0;
    while (true) {
        String hash = HashGenerator.generateBlockHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (BlockValidator.validateDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
}
```

### 工作难度共识

我们现在已经有了基于`difficulty`计算合法哈希值的方法，但尚未说明`difficulty`由什么方法决定。在分布系统中，节点必须有一个商定`difficulty`的共识机制。我们通过引入下面的一些新规则来实现`difficulty`的定义：

- `BLOCK_GENERATION_INTERVAL`：定义了区块的出块时间间隔。在比特币中，该值固定为 10 分钟；
- `DIFFICULTY_ADJUSTMENT_INTERVAL`：定义了调整一次`difficulty`的间隔，在比特币中，该值固定为每产生 2016 个区块调整一次。

在我们的系统中，我们先设定出块时间间隔为 10 秒，每产生 10 个区块调整一次`difficulty`。区块链每增长 10 个区块，系统就检查一次产生这 10 个区块的时间间隔和期望时间间隔的差，并以此为依据调整`difficulty`的值。

```Java
private Integer adjustedDifficulty(Block latestBlock) {
    final int BLOCK_GENERATION_INTERVAL = 10;
    final int DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
    
    if (latestBlock.getIndex() % DIFFICULTY_ADJUSTMENT_INTERVAL == 0 &&
        latestBlock.getIndex() != 0) {
        return latestBlock.getDifficulty();
    } else {
        Block previousAdjustedBlock = blockRepository
            .findById(latestBlock.getIndex() - BLOCK_GENERATION_INTERVAL)
            .orElseThrow();
        int timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
        long timeTaken = latestBlock.getTimestamp() - previousAdjustedBlock.getTimestamp();
        if (timeTaken < timeExpected / 2) {
            return previousAdjustedBlock.getDifficulty() + 1;
        } else if (timeTaken > timeExpected * 2) {
            return previousAdjustedBlock.getDifficulty() - 1;
        } else {
            return previousAdjustedBlock.getDifficulty();
        }
    }
}
```

### 累计难度

在上一部分中，我们通过选择较长的链来避免分叉。在引入了`difficulty`之后，我们可以采用更合理的方法选择链。现在，我们选择的不是最长的链，而是累计难度最大的链。也就是说，我们认可的链是需要更多的计算资源才能产生的链。

计算链的累计长度，我们实际上计算的是每个区块的`2 ^ difficulty`的值，并将这些值叠加。我们使用`2 ^ difficulty`而不是简单的将`difficulty`相加，是因为指数才能反映出产生连续`0`的概率。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/blockchain/01/cumulative_difficulty.png"
    width="90%"
    alt="选择最长链"
/>
</div>

```Java
private Integer getAccumulatedDifficulty(List<Block> blocks) {
    return blocks
        .stream()
        .map(Block::getDifficulty)
        .map(difficulty -> (int) Math.pow(2, difficulty))
        .reduce(0, Integer::sum);
}
```

此外，需要说明的是，我们在计算每个区块的`2 ^ difficulty`值时，采用的是该区块的`difficulty`值，而不是该区块实际的前缀`0`个数。比方说，如果一个区块的`difficulty`是 4，而其块哈希是`000000a34c...`，我们计算的`difficulty`是 4 而不是 6。

累计难度又被称为“中本共识”，因为这是中本聪在创造比特币时引入的一个重要设计。在主链发生分叉时，矿工必须选择其中的一条链继续向下工作。由于矿工们的目的都是生产能够被接受进主链的区块，这个共识激励矿工们选择相同的链作为他们继续工作的区块链。

## 总结

在本节中，我们搭建了一个通用功能的区块链系统，并且在这个区块链系统上实现了一个工作量证明的共识机制。工作量证明难题的一个重要的特性就是难于解决，但是易于验证。在我们的 PoW 实现中，发现一个满足指定要求的 SHA-256 哈希值难度堪比中大额彩票，但是验证这个哈希值是否满足难度要求却易如反掌。

在下一节中，我们将会把我们的区块链系统专用化，添加交易系统，进而把区块链升级成为一个加密货币系统。

## 参考文献

1. [Naivecoin: a tutorial for building a cryptocurrency.](http://lhartikk.github.io/)

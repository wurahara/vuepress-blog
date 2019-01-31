---
title: 算法与数据结构学习笔记——单词查找树
enable html: true
categories: Algorithms
tags:
  - algorithm
  - string
  - trie
date: 2018-11-20 14:23:36
---

上一篇中我们介绍了字符串的专用排序算法，这些专用算法能够获得比通用排序算法更好的性能。类似地，本篇中我们将介绍字符串的专用搜索算法和符号表实现。这些实现的优异性能体现在命中的时间复杂度和字符串键长度成正比，且能在未命中时很快停止搜索。

<!-- more -->

## 字符串键符号表

通用符号表的键和值都使用泛型参数，而字符串键符号表的键类型被限制在字符串类型上。

```Java
public class StringST<Value> {
    public StringST()
    public void put(String key, Value val)
    public Value get(String key)
    public void delete(String key)
    public boolean contains(String key)
    public boolean isEmpty()
    public int size()
    public Iterable<String> keys()

    public String longestPrefixOf(String s)            // s的前缀中最长的键
    public Iterable<String> keysWithPrefix(String s)   // 所有以s为前缀的键
    public Iterable<String> keysThatMatch(String s)    // 所有和通配符s匹配的键
}
```

上述 API 引入了三个新的符号表方法：

1. `longestPrefixOf()`方法接受一个字符串参数，返回符号表中该字符串的前缀中最长的键；
2. `keysWithPrefix()`方法接受一个字符串参数，返回符号表中所有以该字符串为前缀的键；
3. `keysThatMatch()`方法接受一个字符串通配符，返回符号表中所有和该通配符匹配的键。通配符中，`.`可以匹配任意单个字符。

## 单词查找树 (Tries)

首先，我们介绍一种名为单词查找树的数据结构，该结构是字符串键中的字符构造而成的树，其特点如下：

- 使用结点保存字符串中的单个字符；
- 每个结点都有 $R$ 个子结点，其中 $R$ 为字母表的基数；
- 每个结点包含一个对应值，该值或为`null`，或为某个字符串键关联的值。

![单词查找树](http://images.herculas.cn/image/blog/algorithms/string2/tries.png)

### 键搜索

单词查找树的键搜索操作从根结点开始，按照键中字母出现的顺序遍历结点树，直到抵达键的最后一个字符指向的结点，或者遭遇空链接。这样，可能会出现以下几种情况：

- **搜索命中**：键的尾字符对应的结点的值非空；
- **搜索未命中**：键的尾字符对应的结点中的值为`null`，或者查找结果结束于一条空链接。

![键搜索](http://images.herculas.cn/image/blog/algorithms/string2/trie%20search.png)

### 键插入

和二叉搜索树类似，单词查找树在插入操作前需要首先进行搜索。那么对应于搜索可能发生的几种情况，插入操作将会采取不同的应对策略：

- 遭遇空链接：表明单词查找树中不存在与该键对应的分支，需要为键中未被检查的字符创建结点，并对尾结点赋值；
- 到达键的尾字符：无论尾字符结点关联值是否为`null`，都用新值覆盖它。

![键插入](http://images.herculas.cn/image/blog/algorithms/string2/trie%20insertion.png)

### 键删除

想要在单词查找树中删除一个键值对，首先要找到键所对应的结点，并将其对应值设为`null`。如果该结点还有非空链接指向其他结点，则不需要进行其他操作。否则，就需要在树中删去该节点。如果删去该结点导致其父结点也不存在非空子结点，且父结点中无关联值，则继续删除父结点。以此类推。

![键删除](http://images.herculas.cn/image/blog/algorithms/string2/trie%20deletion.png)

### 基础实现

对于单词查找树的实现，我们首先需要先定义结点的实现。考虑到每个结点都会产生 $R$ 条链接，这些链接指向每个可能的字符。因此需要使用一个数组来保存子结点的链接。

```Java
private static class Node {
    private Object value;
    private Node[] next = new Node[R];
}
```

可以发现，字符或者字符串都没有显式的被保存。键是由根结点到含有非空值的结点路径所隐式表示的。使用链接的索引表示该子结点指代的是哪一个具体的字符。因为这一重要特性，单词查找树使用的基数 $R$ 必须依赖严格的字母表定义。

下面是单词查找树的实现类：

```Java
public class TrieST<Value> {
    private static int R = 256;
    private Node root;

    private static class Node {
        private Object val;
        private Node[] next = new Node[R];
    }

    public Value get(String key) {
        Node x = get(root, key, 0);
        if (x == null)
            return null;
        return (Value) x.val;
    }

    private Node get(Node x, String key, int d) {
        if (x == null)
            return null;
        if (d == key.length())
            return x;

        char c = key.charAt(d);
        return get(x.next[c], key, d+1);
    }

    public void put(String key, Value val) {
        root = put(root, key, val, 0);
    }

    private Node put(Node x, String key, Value val, int d) {
        if (x == null)
            x = new Node();

        if (d == key.length()) {
            x.val = val;
            return x;
        }

        char c = key.charAt(d);
        x.next[c] = put(x.next[c], key, val, d+1);
        return x;
    }

    public void delete(String key) {
        root = delete(root, key, 0);
    }

    private Node delete(Node x, String key, int d) {
        if (x == null)
            return null;
        if (d == key.length())
            x.val = null;
        else {
            char c = key.charAt(d);
            x.next[c] = delete(x.next[c], key, d+1);
        }

        if (x.val != null)
            return x;

        for (char c = 0; c < R; c++)
            if (x.next[c] != null)
                return x;
        return null;
    }
}
```

### 键遍历

想要遍历单词查找树中的所有键，需要维护一个队列以保存所有字符串键。我们需要进行以下操作：

- 对单词查找树进行中序遍历，将各键加入到队列中；
- 维护从根结点到各椰子结点的各路径的字符序列。

![键遍历](http://images.herculas.cn/image/blog/algorithms/string2/ordered%20iteration.png)

```Java
public Iterable<String> keys() {
    Queue<String> queue = new Queue<String>();
    collect(root, "", queue);
    return queue;
}

private void collect(Node x, String prefix, Queue<String> q) {
    if (x == null)
        return;
    if (x.val != null)
        q.enqueue(prefix);

    for (char c = 0; c < R; c++)
        collect(x.next[c], prefix + c, q);
}
```

### 通配符匹配 (Wildcard Match)

和键遍历的实现方法类似，为`collect()`方法增加一个参数以指定匹配的模式。

![通配符匹配](http://images.herculas.cn/image/blog/algorithms/string2/wildcard%20match.png)

```Java
public Iterable<String> keysThatMatch(String pat) {
    Queue<String> q = new Queue<String>();
    collect(root, "", pat, q);
    return q;
}

public void collect(Node x, String pre, String pat, Queue<String> q) {
    int d = pre.length();

    if (x == null)
        return;
    if (d == pat.length() && x.val != null)
        q.enqueue(pre);
    if (d == pat.length())
        return;

    char next = pat.charAt(d);
    for (char c = 0; c < R; c++)
        if (next == '.' || next == c)
            collect(x.next[c], pre + c, pat, q);
}
```

### 最长前缀

寻找给定字符串的最长键前缀，需要记录搜索路径上的最长键长度，直到搜索到完整的字符串或遭遇空链接为止。

![最长前缀](http://images.herculas.cn/image/blog/algorithms/string2/longest%20prefix.png)

```Java
public String longestPrefixOf(String s) {
    int length = search(root, s, 0, 0);
    return s.substring(0, length);
}

private int search(Node x, String s, int d, int length) {
    if (x == null)
        return length;
    if (x.val != null)
        length = d;
    if (d == s.length())
        return length;

    char c = s.charAt(d);
    return search(x.next[c], s, d+1, length);
}
```

### 性能与优缺点

可以证明，单词查找树结构有如下性质：

1. 单词查找树的形状和键的插入删除顺序无关，给定的一组键必定构成唯一的单词查找树；
2. 单词查找树中单次的搜索和插入操作最多访问数组键长加 1；
3. 若字母表基数为 $R$，在一棵由 $N$ 个随机键构造的单词查找树中，未命中查找平均检查结点的数量约为 $\log_R N$；
4. 若字母表基数为 $R$，在一棵由 $N$ 个随机键构造的单词查找树中，链接总数介于 $RN$ 到 $RNw$ 之间，其中 $w$ 为键的平均长度。

由上述性质可以发现，单词查找树中每个结点都会产生 $R$ 条链接，这对存储空间是一个极大地浪费。

## 三向单词查找树 (TST, Ternary Search Tries)

考虑到 $R$ 路单词查找树的空间消耗过大，J. Bentley 和 R. Sedgewick 提出了三向单词查找树 (TST)。三向单词查找树的每个结点都只有三条链接，分别对应着当前字母小于、等于或大于结点字母的所有键。在 $R$ 路单词查找树中，每个非空链接依照索引隐式的保存它所对应的字符，而在三向单词查找树中，字符需要被显式地保存在结点中。

![三向单词查找树](http://images.herculas.cn/image/blog/algorithms/string2/TST.png)

### 键搜索与插入

三向单词查找树的搜索实现相比 $R$ 路单词查找树较为复杂。在搜索时，对于搜索路径上的每个结点，比较该结点所储存的字符和键中的指定位置字符：

- 如果键中字符较小：选择左链接；
- 如果键中字符较大：选择右链接；
- 如果相等：选择中链接，并且将键中的搜索字符后移一位。

当键搜索结束时结点的值非空，则搜索命中。若搜索过程遭遇空链接，或者键搜索结束时结点值为`null`，则搜索未命中。

![TST键搜索](http://images.herculas.cn/image/blog/algorithms/string2/tst%20search.png)

在键搜索的基础上，键插入的操作可以很简单地实现。在插入新键时，首先进行搜索，然后和 $R$ 路单词查找树一样，在树中补全键尾的所有结点。

### 实现

下面展示了 TST 的实现：

```Java
public class TST<Value> {
    private Node root;

    private class Node {
        char c;
        Node left, mid, right;
        Value val;
    }

    public Value get(String key) {
        Node x = get(root, key, 0);
        if (x == null)
            return null;
        return x.val;
    }

    private Node get(Node x, String key, int d) {
        if (x == null)
            return null;
        char c = key.charAt(d);

        if (c < x.c)
            return get(x.left,  key, d);
        else if (c > x.c)
            return get(x.right, key, d);
        else if (d < key.length() - 1)
            return get(x.mid, key, d+1);
        else
            return x;
    }

    public void put(String key, Value val) {
        root = put(root, key, val, 0);
    }

    private Node put(Node x, String key, Value val, int d) {
        char c = key.charAt(d);
        if (x == null) {
            x = new Node();
            x.c = c;
        }

        if (c < x.c)
            x.left  = put(x.left,  key, val, d);
        else if (c > x.c)
            x.right = put(x.right, key, val, d);
        else if (d < key.length() - 1)
            x.mid = put(x.mid, key, val, d+1);
        else
            x.val = val;

        return x;
}
```

### 性质

可以证明，三向单词查找树结构有如下性质：

1. 在一棵由 $N$ 个随机键构造的单词查找树中，链接总数介于 $3N$ 到 $3Nw$ 之间，其中 $w$ 为键的平均长度；
2. 在一棵由 $N$ 个随机键构造的单词查找树中，未命中查找平均需要比较字符约 $\ln N$ 次。

因此，TST 在没有较大时间损耗的基础上实现了空间的高效利用。

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

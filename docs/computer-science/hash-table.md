---
series: 算法与数据结构学习笔记
title: 散列表
enable html: true
categories: Algorithms
tags:
  - algorithm
  - hash table
date: 2018-11-02 10:59:34
---

回顾一下我们之前介绍的几种符号表实现，其中无序链表的实现基于相同验证`equals()`，而顺序数组和几种树结构都基于键比较`compareTo()`。现在考虑，如果可以直接将键作为访问数组的索引，我们就可以快速访问任意键的值。在本篇中，我们将介绍一种基于这种思路的符号表实现——散列表，它使用算数操作将键转化为数组的索引以快速访问数组中的键值对。

<!-- more -->

散列表能在时间和空间开销上取得平衡。因为如果没有空间限制，我们可以将所有键作为数组的索引，建立一张超大的符号表数组，这样所有的查找操作都只需要访问一次数组就可完成。如果没有空间限制，我们可以使用无序数组存储键值对，并在需要时进行顺序查找，这样我们仅需要很小的内存空间。散列表使用了适度的空间和时间并在以上两种极端之间取得平衡，这种理论基于概率论的几个经典结论。

实现散列表需要解决两个基本问题，

- 第一是使用**散列函数**将各种类型的键转换为数组的索引；
- 第二是需要处理**散列冲突**，即解决两个或更多键散列到相同的索引值的情况。

在下面的第一节，我们将介绍散列函数的实现，随后的两节我们将介绍基于拉链法和线性探测法的散列碰撞检测方法。

## 散列函数(Hash Function)

### Java的散列实现

散列函数实现的基本思想是，如果我们有一个空间为 $M$ 的数组，我们就需要一个能将任意键映射到区间 $[0, M - 1]$ 的函数，该函数即为散列函数。我们要找的散列函数应当易于计算且能够尽量均匀映射所有的键到区间内。

#### Java的基本约定

Java令所有数据类型都继承了 Object 类的`hashCode()`函数，该函数的返回值为 32bit 的`int`型数据。

根据散列函数的定义，如果`x.equals(y)`，则必有`x.hashCode() == y.hashCode()`，这称为`hashCode()`和`equals()`的**一致性**。相反地，如果`!x.equals(y)`，我们希望也有`x.hashCode != y.hashCode()`，但是这并不是一定正确的。

如果需要为自定义数据类型定义散列函数，需要同时重写`hashCode()`和`equals()`方法。如果没有复写的话，默认的类`hashCode()`方法将会返回对象的内存地址。

#### 基本类型的散列实现

对于整型数，因为 Java 的整型数为 32 位，与默认散列长度相同，所以 Java 内置的散列函数直接返回整型数的值：

```Java
public final class Integer {
    private final int value;

    public int hashCode() {
        return value;
    }
}
```

对于浮点数，因为 Java 的浮点数实现为 64 位，为了得到 32 位散列值且使得浮点数的所有元素都参与散列值的计算，就将 64 位的前 32 位和后 32 位进行异或运算：

```Java
public final class Double {
    private final double value;

    public int hashCode() {
        long bits = doubleToLongBits(value);
        return (int) (bits ^ (bits >>> 32));
    }
}
```

对于布尔型，Java对`true`和`false`返回固定整数值：

```Java
public final class Boolean {
    private final boolean value;

    public int hashCode() {
        if (value)
            return 1231;
        else
            return 1237;
    }
}
```

#### 字符串的散列实现

对于字符串，Java 采用 Horner 方法得到散列值：

```Java
public final class String {
    private final char[] s;

    public int hashCode() {
        int hash = 0;
        for (int i = 0; i < length(); i++)
            hash = s[i] + (31 * hash);
        return hash;
    }
}
```

对于长度为 $L$ 的字符串，Java 按照 Horner 方法计算得到的散列值如下：

$$
h=s[0] \cdot 31^{L-1} + s[1] \cdot 31^{L-2} + \ldots + s[L-2] \cdot 31^{1} + s[L-1] \cdot 31^{0}
$$

考虑到 Java 中的字符串是不可变类型 (Immutable Type)，优化的方法是在字符串对象初始化后将其散列值缓存在一个实例变量中，并在随后的散列调用中直接取出缓存值，以减少运算：

```Java
public final class String {
    private int hash = 0;
    private final char[] s;

    public int hashCode() {
        int h = hash;
        if (h != 0)
            return h;

        for (int i = 0; i < length(); i++)
            h = s[i] + (31 * h);
        hash = h;
        return h;
    }
}
```

#### 自定义对象的`hashCode()`方法

散列函数`hashCode()`的设计希望的是能够将键平均地散布为所有可能的 32 位整数，即对任意对象`x`，调用`x.hashCode()`将由均等的机会得到 $2^{32}$ 个不同整数中的任意一个 32 位整数。对于自定义数据类型，可以将其各个实例变量的散列值组合起来得到对象的散列值：

```Java
public final class Transaction implements Comparable<Transaction> {
    private final String who;
    private final Date when;
    private final double amount;

    public int hashCode() {
        int hash = 17;
        hash = 31 * hash + who.hashCode();
        hash = 31 * hash + when.hashCode();
        hash = 31 * hash + ((Double) amount).hashCode();
        return hash;
    }
}
```

初始值 17 和系数 31 根据具体情况选定，要求必须为素数。

### 散列函数的设计标准

设计自定义数据类型的散列函数有一些标准：

- 将各实例域按照 31x + y 的形式组合起来；
- 如果某个实例域是基本类型，就使用其包装类的`hashCode()`方法；
- 如果某个实例域是`null`，则使其散列值为 0；
- 如果某个实例域是一个对象，就递归调用该对象所属类型的`hashCode()`方法；
- 如果某个实例域是一个数组，就对数组中的每个元素分别求取散列值（或使用`Arrays.deepHashCode()`方法）。

### 除留余数法

Java 通用的散列值为 32 位，即范围为 $[-2^{31}, 2^{31} - 1]$。那么对于任意 $M$ 位数组范围的散列值应该如何求取？我们通常选用除留余数法。以整型数为例，对于任意正整数 $k$，计算 $k$ 除以 $M$ 的余数，该余数即为散列值。

```Java
private int hash(Key key) {
    return (key.hashCode() & 0x7fffffff) % M;
}
```

### 散列的均匀分布

对于优秀的散列算法，必须满足以下三个条件：

1. 一致性：等价的键必然产生相等的散列值；
2. 高效性：计算简便；
3. 均匀性：均匀地散列所有的键。

可以将散列的均匀分布问题等价为箱球问题 (Bins and Balls Problem)：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search4/bins%20and%20balls.png"
    width="70%"
    alt="箱球问题"
/>
</div>

问题的基本描述是向$M$个箱中投球，每次将球随即投入其中的一个箱中。基于概率论的基本理论，有如下几个结论：

- 生日问题：经过 $\sqrt{\frac{\pi M}{2}}$ 次投球后，会有一个箱中存在 2 个球；
- 赠券收集问题：经过 $M \ln M$ 次投球后，每个箱内都有大于等于 1 个球；
- 负载均衡问题：经过 $M$ 次投球后，球最多的箱内有 $\Theta (\frac{\log M}{\log \log M})$ 个球。

上述结论将有助于我们接下来对散列表性能的讨论。

## 基于拉链法的散列表(Hashing with Separate Chaining)

上一节中我们介绍的生日问题引出了一个结论，当存储空间有限时，散列碰撞是不可避免的；而赠券收集问题和负载均衡问题共同指出了这种碰撞的分布是随机且均匀的。因此，想要实现基于散列表的符号表，就必须高效地解决散列碰撞问题。

### 实现

首先，我们介绍的是基于**拉链法**的碰撞解决方法。该方法的思路是将大小为 $M$ 的数组中的每个元素指向一条链表，而链表中的每个结点都存储了散列值为该元素索引的键值对，示意图如下：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search4/separate%20chaining.png"
    width="50%"
    alt="基于拉链法的散列表"
/>
</div>

实现如下：

```Java
public class SeparateChainingHashST<Key, Value> {

    private int M = 17;                      // 散列表的大小
    private Node[] st = new Node[M];

    private static class Node {
        private Object key;
        private Object val;
        private Node next;
    }

    private int hash(Key key) {
        return (key.hashCode() & 0x7fffffff) % M;
    }

    public Value get(Key key) {
        int i = hash(key);
        for (Node x = st[i]; x != null; x = x.next)
            if (key.equals(x.key))
                return (Value) x.val;
        return null;
    }

    public void put(Key key, Value val) {
        int i = hash(key);
        for (Node x = st[i]; x != null; x = x.next)
            if (key.equals(x.key)) {
                x.val = val; return;
            }
        st[i] = new Node(key, val, st[i]);
    }
}
```

### 性能

可以证明，在一张含有$M$条链表和 $N$ 个键的散列表中，任意一条链表中的键的数量均在 $\frac{N}{M}$ 的常数因子范围内的概率无限趋近于 $1$。这样，我们可以认为在一张含有 $M$ 条链表和 $N$ 个键的散列表中，未命中的查找和插入操作所需的比较次数约为 $\frac{N}{M}$。这样，我们就将符号表的时间复杂度降到了常数级。

## 基于线性探测法的散列表(Hashing with Linear Probing)

另一种实现散列表的方法是使用大小为 $M$ 的数组保存 $N$ 个键值对，其中 $M > N$。我们依靠数组中的空位来解决散列碰撞冲突。基于这种策略的所有方法统称为**开放地址散列表**。

### 实现

开放地址散列表中最简单的方法为**线性探测法**。在插入阶段，将键做散列然后寻找数组中的相应位置，若该位置已被占用则查找后一个位置，直到寻找到空位置将新键插入数组中。在查找阶段，同样计算出键的散列值，搜索数组中相应索引位置，若未命中则移到下一位置，直到搜索成功或空键。

线性探测法的实现如下：

```Java
public class LinearProbingHashST<Key, Value> {
    private int M = 30001;
    private Value[] vals = (Value[]) new Object[M];
    private Key[] keys = (Key[]) new Object[M];

    private int hash(Key key) {
        return (key.hashCode() & 0x7fffffff) % M;
    }

    public void put(Key key, Value val) {
        int i;
        for (i = hash(key); keys[i] != null; i = (i+1) % M)
            if (keys[i].equals(key))
                break;
        keys[i] = key;
        vals[i] = val;
    }

    public Value get(Key key) {
        for (int i = hash(key); keys[i] != null; i = (i+1) % M)
            if (key.equals(keys[i]))
                return vals[i];
        return null;
    }
}
```

### 键簇(Cluster)

线性探测法的性能取决于元素在数组中聚集成的连续条目，称为键簇。显然，短小的键簇才能保证较高的效率。Knuth 停车问题对该现象进行了定量分析。假设有一定数量的车要停在有 $M$ 个车位的路边停车场中，且这些车所停的位置满足区间 $M$ 内的随机均匀分布。那么一辆车平均需要位移多少位置才能找到停车位呢？

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search4/knuth%20parking.png"
    width="80%"
    alt="Knuth停车问题"
/>
</div>

Knuth证明，当停车场内已经有 $\frac{M}{2}$ 辆车时，新车所需位移的期望约为 $\frac{3}{2}$；当停车场内快要停满，即已有接近 $M$ 辆车时，新车所需位移的期望约为 $\sqrt{\frac{\pi M}{8}}$。

Knuth思想实验证明，当插入的键越来越多时，搜索和插入所需要的时间将会急速上升。

### 性能

基于上述说明，可以证明再均匀散列情况下，一张大小为 $M$ 且含有 $N = \alpha M$ 个键的基于线性探测法的散列表中，命中和未命中查找所需的探测次数分别约为：

命中：
$$
\frac{1}{2} (1 + \frac{1}{1 - \alpha})
$$

未命中：
$$
\frac{1}{2} (1 + \frac{1}{(1 - \alpha)^2})
$$

当 $\alpha$ 约为 $\frac{1}{2}$ 时，命中所需的探测次数约为 $\frac{3}{2}$，未命中所需的探测次数约为 $\frac{5}{2}$。当 $\alpha$ 趋近于 $1$ 时，估计值的精确度会下降。

## 性能比较

下面是喜闻乐见的性能比较环节：

|数据结构|最坏查找|最坏插入|最坏删除|平均查找|平均插入|平均删除|
|:-----:|:----:|:-----:|:-----:|:----:|:----:|:----:|
|无序链表|$N$|$N$|$N$|$\frac{N}{2}$|$N$|$\frac{N}{2}$|
|有序数组|$\lg N$|$2N$|$N$|$\lg N$|$\frac{N}{2}$|$\frac{N}{2}$|
|二叉搜索树|$N$|$N$|$N$|$1.39 \lg N$|$1.39 \lg N$|$?$|
|2-3 树|$c \lg N$|$c \lg N$|$c \lg N$|$c \lg N$|$c \lg N$|$c \lg N$|
|红黑树|$2 \lg N$|$2 \lg N$|$2 \lg N$|$1.00 \lg N$|$1.00 \lg N$|$1.00 \lg N$|
|拉链法|$\lg N$|$\lg N$|$\lg N$|$3 - 5$|$3 - 5$|$3 - 5$|
|线性探测法|$\lg N$|$\lg N$|$\lg N$|$3 - 5$|$3 - 5$|$3 - 5$|

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part I, Princeton University.](https://www.coursera.org/learn/algorithms-part1/home/welcome)

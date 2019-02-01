---
title: 算法与数据结构学习笔记——基本符号表
enable html: true
categories: Algorithms
tags:
  - algorithm
  - symbol table
date: 2018-10-24 16:13:11
---

符号表是一张抽象的表格，它会将信息以 **值(Value)** 的形式存储，并通过 **键(Key)** 来索引信息。在不同的程序语言中，符号表也会被称为字典或索引，他们的本质都是相同的，即由键值对组成的符号表。本篇我们将介绍符号表的概念和两种基本的符号表的实现方式。

<!-- more -->

## API

### API接口设计

符号表需要向外界暴露的接口以提供查找、插入和删除等基本功能。

```Java
public class ST<Key, Value> {
    ST() {/* ... */}                            // 构造器，构造一张符号表

    void put(Key key, Value value) {/* ... */}  // 插入新的键值对
    Value get(Key key) {/* ... */}              // 获取对应键key的值
    void delete(Key key) {/* ... */}            // 删除键key及其对应值

    boolean contains(Key key) {/* ... */}       // 键key是否在表中
    boolean isEmpty() {/* ... */}               // 表是否为空
    int size() {/* ... */}                      // 表中键值对的数量

    Iterable<Key> keys() {/* ... */}            // 表中键构造的迭代器
}
```

### 设计决策

1. **重复键**
符号表原则上不允许重复键的存在，每个键只对应着一个值。当用例向表中存入的键值对和表中已有的键冲突时，新的值会覆写旧的值。

2. **空(null)键**
键不能为空。插入空键会导致一个运行时异常。

3. **空(null)值**
值也不能为空。考虑到我们在API定义中规定，当键不存在时`get()`方法返回`null`，这意味着任何不在表中的键的关联值为空。为了防止歧义，我们禁止表中存在空值。

4. **删除操作**
基于第3条，我们可以实现符号表的惰性删除机制，即当想删除某个键值对时，将该键对应的值置空，然后在指定时间删除所有值为空的键值对。

5. **便捷方法**
基于第3条和第4条的思路，我们可以优化`contains()`、`delete()`和`isEmpty()`的实现方法。

```Java
public class ST<Key, Value> {

    // 前略

    void delete(Key key) {
        put(key, null);
    }
    boolean contains(Key key) {
        return get(key) != null;
    }
    boolean isEmpty() {
        return size() == 0;
    }
}
```

6. **对象等价性**
必须对所有自定义的键类型实现`equals()`方法。此外，最好使用不可变类型数据作为键，否则无法保证表的内容一致性。

## 无序链表实现

使用链表可以实现一个简单的符号表。给每个结点存储一个键值对，将个结点首尾相连。`get()`方法的实现即为遍历整个链表，用`equals()`方法比较查找的键是否在表中。`put()`的实现同样需要遍历列表，如果找到相同的键，就用新值覆盖旧值，否则创建新的结点并插入到链表头。下图是基于链表的符号表的索引用例轨迹。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search1/linkedlist.png"
    width="90%"
    alt="无序链表轨迹"
/>
</div>

### 代码实现

基于链表的符号表的实现如下：

```Java
public class SequentialSearchST<Key, Value> {

    private Node first;

    private class Node {
        Key key;
        Value val;

        Node next;
        public Node(Key key, Value val, Node next) {
            this.key = key;
            this.val = val;
            this.next = next;
        }
    }

    public Value get(Key key) {
        for (Node x = first; x != null; x = x.next) {
            if (key.equals(x.key)) {
                return x.val;
            }
        }
        return null;
    }

    public void put(Key key, Value val) {
        for (Node x = first; x != null; x = x.next) {
            if (key.equals(x.key)) {
                x.val = val;
                return;
            }
        }
        first = new Node(key, val, first);
    }
}
```

### 性能表现

容易发现，对于含有 $N$ 个键值对的由无序链表实现的符号表，未命中的查找和插入操作都需要 $N$ 次比较。命中的查找在最坏情况下需要 $N$ 次比较。特别地，向一个空表中插入 $N$ 个不同的键值对需要约 $\frac{N^2}{2}$ 次比较。

因此，我们可以认为基于链表实现的符号表在面对查找和插入操作时是非常低效的。

## 有序数组与二分查找

使用一对平行的数组，我们也可以实现一个符号表。这对平行数组，一个存储键，一个存储值。对于数组，我们可以很容易地控制元素的顺序。而且，利用数组的索引，`get()`方法也可以得到更高效的实现。

有序数组实现的核心是`rank()`方法，该方法返回表中小于给定键的键的数量。那么对于`get()`方法，只要给定的键存在于表中，`rank()`方法就能精确地告诉我们能在哪里找到他。如果找不到就说明该键不在表中。使用了基于有序数组的符号表实现的索引用例轨迹如下图。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search1/binarysearch.png"
    width="90%"
    alt="有序数组实现轨迹"
/>
</div>

### 代码实现

```Java
public class BinarySearchST<Key extends Comparable<Key>, Value> {
    private Key[] keys;
    private Value[] vals;
    private int N;

    public BinarySearchST(int capacity) {
        keys = (Key[]) new Comparable[capacity];
        vals = (Value[]) new Comparable[capacity];
    }

    public int size() {
        return N;
    }

    public Value get(Key key) {
        if (isEmpty()) return null;
        int i = rank(key);
        if (i < N && keys[i].compareTo(key) == 0) {
            return vals[i];
        } else {
            return null;
        }
    }

    public int rank(Key key) {
        int lo = 0, hi = N-1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int cmp = key.compareTo(keys[mid]);
            if (cmp  < 0) 
                hi = mid - 1;
            else if (cmp  > 0)
                lo = mid + 1;
            else if (cmp == 0)
                return mid;
        }
        return lo;
    }

    public void put(Key key, Value val) {
        int i = rank(key);
        if (i < N && keys[i].compareTo(key) == 0) {
            vals[i] == val;
            return;
        }

        for (int j = N; j > i; j--) {
            keys[j] = keys[j - 1];
            vals[j] = vals[j - 1];
        }
        keys[i] = key;
        vals[i] = val;
        N++;
    }
}
```

### 性能表现

容易证明，在 $N$ 个键的有序数组中进行二分查找，无论是否成功，都最多需要 $\lg N + 1$ 次比较。插入新元素时，最坏需要访问约 $2N$ 次数组。那么，向一个空表中插入 $N$ 个元素在最坏情况下需要访问约 $N ^ 2$ 次数组。

可以发现，在查找上有序数组实现较无序链表实现有明显优势。但插入时，有序数组需要将大于该键的所有键值对依次向后顺移，这导致插入的性能不佳。

将两种实现的性能表现对比，我们可以得到如下表。

|数据结构|最坏查找|最坏插入|平均查找|平均插入|
|:-----:|:----:|:-----:|:-----:|:----:|
|无序链表|$N$|$N$|$\frac{N}{2}$|$N$|
|有序数组|$\lg N$|$2N$|$\lg N$|$N$|

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part I, Princeton University.](https://www.coursera.org/learn/algorithms-part1/home/welcome)

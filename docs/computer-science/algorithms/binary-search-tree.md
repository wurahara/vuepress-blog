---
series: 查找算法
title: 二叉搜索树
enable html: true
categories: Algorithms
tags:
  - algorithm
  - binary search tree
date: 2018-10-26 10:36:41
---

本篇介绍的是一种能将上一篇中链表插入操作的灵活性和有序数组查找的高效性结合起来的符号表实现——**二叉搜索树(Binary Search Tree)**。

我们在排序算法的第三篇中曾经介绍过二叉树的概念，在此不妨复习一下。二叉树指一种结点的有限集合，该集合或者为空，或者是由一个根结点加上两棵分别称为左子树和右子树的、互不相交的二叉树组成。一棵二叉搜索树首先是一棵二叉树，其中每个结点都含有一个键和一个值，且每个结点的键都大于其左子树中任意结点的键而小于其右子树中任意结点的键。

<!-- more -->

## BST的基本实现

二叉搜索树的每个结点都包含4个域，分别是键、值、指向左子树的指针和指向右子树的指针。

```Java
private class Node {
    private Key key;
    private Value val;
    private Node left;
    private Node right;
    private int count;       // (optional) 以该结点为根的子树中的结点总数

    public Node(Key key, Value val, int count) {
        this.key = key;
        this.val = val;
        this.count = count;
    }
}
```

那么，基于二叉搜索树的符号表的基本实现如下：

```Java
public class BST<Key extends Comparable<Key>, Value> {
    private Node root;

    private class Node {/* ...如上... */}

    public int size() {
        return this.size(root);
    }

    private int size(Node n) {
        if (n == null)
            return 0;
        else
            return n.count;
    }
}
```

### 查找操作(Search and Select)

通过递归的调用`get()`方法，我们可以比较得到需要查找的键值对。对于任意结点，若键比该结点的键小，则向左子树递归；若大于结点的键，则向右子树递归；若恰好相等，则找到了所需的结点。

```Java
public Value get(Key key) {
    return this.get(root, key);
}

private Value get(Node root, Key key) {
    if (root == null)
        return null;

    int cmp = key.compareTo(root.key);

    if (cmp < 0)
        return this.get(root.left, key);
    else if (cmp > 0)
        return this.get(root.right, key);
    else
        return root.val;
}
```

### 插入操作(Insert)

和查找类似，采用递归方法向各结点及其左右子树寻找对应的键值对。如果始终未找到，则在末端新增结点。最后的递归返回则更新递归序列上每个结点的计数器。

```Java
public void put(Key key, Value val) {
    this.root = this.put(this.root, key, val);
}

private void put(Node root, Key key, Value val) {
    if (root == null)
        return new Node(key, val, 1);

    int cmp = key.compareTo(root.key);

    if (cmp < 0)
        root.left = this.put(root.left, key, val);
    else if (cmp > 0)
        root.right = this.put(root.right, key, val);
    else
        root.val = val;

    root.count = this.size(root.left) + this.size(root.right) + 1;
    return root;
}
```

### 性能分析

二叉搜索树的性能在很大程度上取决于树的形状，而树的形状则由多个因素决定。即使相同的一组结点，在经过不同的插入顺序之后，也会构造出完全不同形状的二叉搜索树，如下图所示。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search2/tree%20shape.png"
    width="80%"
    alt="Tree shape"
/>
</div>

考虑到任何形状的树结构，其查找和插入所需的比较次数都是结点深度 + 1，我们可以得到以下结论：

1. 完全平衡的状态下，每个叶子结点到根结点的距离均为约 $\lg N$ ，即时间复杂度约为 $\lg N$ ；
2. 在最坏情况下，搜索路径上有 $N$ 个结点，时间复杂度为 $N$；
3. 由 $N$ 个随机键构造的二叉搜索树的查找命中平均所需的比较次数约为 $1.39 \lg N$。

这样，我们可以得到以下的性能分析比较表。

|数据结构|最坏查找|最坏插入|平均查找|平均插入|
|:-----:|:----:|:-----:|:-----:|:----:|
|无序链表|$N$|$N$|$\frac{N}{2}$|$N$|
|有序数组|$\lg N$|$2N$|$\lg N$|$N$|
|二叉搜索树|$N$|$N$|$1.39 \lg N$|$1.39 \lg N$|

## BST的顺序操作

二叉搜索树的另一个优势是它能够保持键的有序性。下面，我们将介绍维护BST有序性的相关API。

### 最小键(Min)和最大键(Max)

根据二叉搜索树的定义，最小键即为二叉树最左边的结点，而最大键即为二叉树最右边的结点。我们可以用递归的方法找到树的最左边缘和最右边缘。下列代码给出了最小键的实现，最大键的实现与此相同，仅需将符号和左右子树调换即可。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search2/minimum%20and%20maximum.png"
    width="50%"
    alt="Minimum and maximum"
/>
</div>

```Java
public Key min() {
    return this.min(this.root).key;
}

private Node min(Node root) {
    if (root.left == null)
        return root;

    return this.min(root.left);
}
```

### 向上取整(Floor)和向下取整(Ceiling)

向上取整(Floor)指的是树中小于指定键的最大结点，而向下取整(Ceiling)指的是树中大指定键的最小结点，如图所示。如果指定键`key`小于搜索树的根结点，那么`floor(key)`一定在根结点的左子树中；如果指定键`key`大于搜索树的根结点，那么只有在根结点的右子树中含有小于等于`key`的结点时，`floor(key)`才会出现在右子树中，否则根结点即为`floor(key)`。`ceiling()`的算法与此类似，不再赘述。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search2/floor%20and%20ceiling.png"
    width="50%"
    alt="Floor and ceiling"
/>
</div>

```Java
public Key floor(Key key) {
    Node x = this.floor(this.root, key);

    if (x == null)
        return null;
    else
        return x.key;
}

private Node floor(Node root, Key key) {
    if (root == null)
        return null;

    int cmp = key.compareTo(root.key);

    if (cmp == 0)
        return root;

    if (cmp < 0)
        return this.floor(root.left, key);

    Node temp = this.floor(root.right, key);
    if (temp != null)
        return temp;
    else
        return root;
}
```

### 选择(Select)与排名(Rank)

选择(select)操作指寻找搜索树中排名为 $k$ 的键（即树中恰好有 $k$ 个小于它的键）。如果左子树中的结点数 $t$ 大于 $k$，我们就递归地在左子树中查找排名为 $k$ 的键；如果左子树结点数 $t$ 恰好等于 $k$，则返回根结点的键；如果 $t$ 小于 $k$，就递归地在右子树中查找排名为 $k - t - 1$ 的键。

```Java
public Key select(int k) {
    return this.select(this.root, k).key;
}

private Node select(Node root, int k) {
    if (root == null)
        return null;

    int temp = this.size(root.left);

    if (temp > k)
        return this.select(root.left, k);
    else if (temp < k)
        return this.select(root.right, k - t - 1);
    else
        return root;
}
```

排名(Rank)是选择(Select)的逆算法，功能是返回指定键的排名。如果给定键和根结点的键相等，则返回左子树的结点总数 $t$；如果小于根结点，递归地返回该键在左子树中的排名；若大于根结点，递归地得到该键在右子树中的排名，并加上 $t + 1$。

```Java
public int rank(Key key) {
    return this.rank(this.root, key);
}

private int rank(Node root, Key key) {
    if (root == null)
        return 0;

    int cmp = key.compareTo(root.key);

    if (cmp  < 0)
        return this.rank(key, root.left);
    else if (cmp  > 0)
        return 1 + this.size(root.left) + this.rank(key, root.right);
    else
        return this.size(root.left);
}
```

### 中序遍历(Inorder Traversal)

对于树中的任意结点，中序遍历指的是先遍历结点的左子树中的所有结点，然后是根结点，最后遍历右子树中的所有结点。利用递归思想可以很容易地实现中序遍历。

```Java
public Iterable<Key> keys() {
    Queue<Key> queue = new Queue<Key>();
    inorder(this.root, queue);
    return queue;
}

private void inorder(Node root, Queue<Key> queue) {
    if (root == null)
        return;

    this.inorder(root.left, queue);
    queue.enqueue(root.key);
    this.inorder(root.right, queue);
}
```

### 基本操作的复杂度

这样，我们可以总结出符号表的不同实现下各个操作的时间复杂度，如下表所示。

||无序链表|有序数组|二叉搜索树|
|:---------:|:--------:|:-----: |:--:|
|搜索(search)|$N$|$\lg N$|$h$|
|插入(insert)|$N$|$N$|$h$|
|最小最大键(min/max)|$N$|$1$|$h$|
|向上向下取整(floor/ceiling)|$N$|$\lg N$|$h$|
|排名(rank)|$N$|$\lg N$|$h$|
|选择(select)|$N$|$1$|$h$|
|顺序遍历|$N \lg N$|$N$|$N$|

上表中 $h$ 表示二叉搜索树的深度，在随机插入键值对的情况下和 $\lg N$ 成正比。

## BST的元素删除

### 删除最大键和最小键

二叉搜索树中最难实现的方法就是`delete()`方法，即从符号表中删除一个键值对。作为热身，我们首先考虑删除最小键的方法`deleteMin()`。

对于删除最小键，我们要不断深入根结点的左子树中，直到遇到`null`，然后将指向该结点的指针指向该结点的右子树。这样，没有任何指针指向要被删除的结点，这样GC会清理掉该结点。随后，递归的回调会自动在递归路径上更新各个结点的计数器的值。`deleteMax()`的实现与此类似，不再赘述。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search2/delete%20the%20minimum.png"
    width="40%"
    alt="Delete the minimum"
/>
</div>

`deleteMin()`的具体实现如下：

```Java
public void deleteMin() {
    root = this.deleteMin(this.root);
}

private Node deleteMin(Node root) {
    if (root.left == null)
        return root.right;

    root.left = this.deleteMin(root.left);
    root.count = 1 + this.size(root.left) + this.size(root.right);
    return root;
}
```

### 删除任意键

对于任意结点的删除，可能会出现以下三种情况：

1. 要删除的结点没有子结点；
2. 要删除的结点只有左子树或右子树；
3. 要删除的结点左右子树俱在。

对于第1种情况，只要将指向该结点的父结点的指针置空即可。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search2/hibbard%20deletion%201.png"
    width="90%"
    alt="Case 1"
/>
</div>

对于第2种情况，只要将指向该结点的父结点的指针指向该结点的左子树或右子树即可。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search2/hibbard%20deletion%202.png"
    width="90%"
    alt="Case 2"
/>
</div>

对于第3种情况，需要用该结点的后继结点替代该结点的位置。后继结点即该结点的右子树中的最小结点。我们需要用3个步骤完成这个任务：

1. 找到`t`的后继结点`x`；
2. 删除`t`的右子树中的最小结点；
3. 将`x`置于`t`的原位置。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/search2/hibbard%20deletion%203.png"
    width="70%"
    alt="Case 3"
/>
</div>

删除任意键的实现如下：

```Java
public void delete(Key key) {
    root = this.delete(this.root, key);
}

private Node delete(Node root, Key key) {
    if (root == null)
        return null;

    int cmp = key.compareTo(root.key);

    if (cmp < 0)
        root.left  = this.delete(root.left, key);
    else if (cmp > 0)
        root.right = this.delete(root.right, key);
    else {
        if (root.right == null)
            return root.left;
        if (root.left == null)
            return root.right;

        Node t = root;
        root = this.min(t.right);
        root.right = this.deleteMin(t.right);
        root.left = t.left;
    }
    root.count = this.size(root.left) + this.size(root.right) + 1;
    return root;
}
```

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part I, Princeton University.](https://www.coursera.org/learn/algorithms-part1/home/welcome)

---
series: 排序算法
title: 优先级队列与堆排序
enable html: true
categories: Algorithms
tags:
  - algorithm
  - sort
  - heap
  - priority queue
date: 2018-10-21 15:06:44
---

本篇是排序部分的最后一篇，主要介绍优先级队列的二叉堆实现方法，进而介绍堆排序这种性能优异的排序算法。优先级队列适合应用于任务调度、场景模拟和数值计算等场景，是一种性能优秀、应用广泛的数据结构。

<!-- more -->

## 优先级队列(Priority Queue)

在有些场景中，我们需要处理有序的元素，但并不需要所有元素全部有序，或不需要将所有元素一次性排序。很多情况下，我们会收集一些元素，处理当前键值最大的元素，然后在处理剩余的元素里键值最大的元素，如此这般。在这种情况下，一个合适的数据结构应该支持两种操作，**删除最大元素**和**插入元素**。这样的数据结构就是**优先级队列**。

### 优先级队列的API

```Java
Public class MaxPQ<Key extends Comparable<Key>> {
    MaxPQ() {/* ... */}            // 创造一个优先级队列
    MaxPQ(int max) {/* ... */}     // 创造一个初始容量为max的优先级队列
    MaxPQ(Key[] a) {/* ... */}     // 用数组a[]中的元素创建一个优先级队列

    void insert(Key v){/* ... */}  // 向优先级队列中插入一个元素
    Key delMax() {/* ... */}       // 删除并返回最大元素
    Key max() {/* ... */}          // 返回最大元素

    boolean isEmpty() {/* ... */}
    int size() {/* ... */}
}
```

### 优先级队列的初级实现

#### 无序数组

无序数组的实现方法是在向队列内新增数组时简单的将新元素加入数据结构的末尾。当删除最大元素时，使用类似选择排序的方法，先将最大元素和末尾元素交换位置，然后删除位于末尾的最大元素。其具体实现如下：

```Java
public class UnorderedMaxPQ<Key extends Comparable<Key>> {
    private Key[] pq;       // pq[i] = ith element on pq
    private int N;          // number of elements on pq

    public UnorderedMaxPQ(int capacity) {
        pq = (Key[]) new Comparable[capacity];
    }

    public boolean isEmpty() {
        return N == 0;
    }

    public void insert(Key x) {
        pq[N++] = x;
    }

    public Key delMax() {
        int max = 0;
        for (int i = 1; i < N; i++)
            if (less(max, i)) max = i;
        exch(max, N-1);
        return pq[--N];
    }
}
```


#### 有序数组

有序数组实现方法和无序数组相反。当向队列内插入新元素时，将所有大于新元素的元素向右移动一位以确保数组始终有序，这样最大的元素始终位于最右位置上。删除操作即为简单的删除并返回数组索引最大的元素。

#### 性能比较

以上两种实现方法将时间复杂度分别分布于插入和删除阶段。下面是以上两种算法在最坏情况下的时间复杂度：

|数组结构|插入元素|删除最大元素|
|:-:|:-:|:-:|
|有序数组| $N$ |1|
|无序数组|1|$N$|

对于同样的外部操作，两种不同实现下的数据结构内部情况如下图所示：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/sort3/array%20implementation.png"
    width="90%"
    alt="数据结构"
/>
</div>

### 二叉堆(Binary Heap)

#### 基本概念

在介绍二叉堆之前，我们有必要先介绍几个基本概念。

1. **二叉树(Binary Tree)**

一棵二叉树是结点的有限集合，该集合或者为空，或者是由一个根结点加上两棵分别称为左子树和右子树的、互不相交的二叉树组成。

2. **满二叉树(Full Binary Tree)**

深度为 $k$ 的满二叉树是有 $2^k - 1$ 个结点的二叉树。满二叉树中，每一层结点都达到了最大个数。

3. **完全二叉树(Complete Binary Tree)**

若一棵有 $n$ 个结点深度为k的二叉树，它每一个结点都与高度为k的满二叉树中编号为前 $n$ 的结点一一对应，称这棵二叉树为完全二叉树。

基于以上概念，我们可以得到如下的性质：

1. 具有 $n$ 个结点的完全二叉树的深度为 $\lceil\log_2(n+1)\rceil$。

2. 将 $n$ 个结点的完全二叉树按自顶向下，同层自左向右编号1, 2, 3, ... ，然后按编号将结点元素存放在数组中，那么：
    - 结点 $k$ 的父结点编号为 $\frac{k}{2}$；
    - 结点 $k$ 的子结点编号为 $2k$ 和 $2k+1$。

#### 二叉堆

当一棵二叉树的每个结点都大于或等于其两个子结点时，称其堆有序。因此，根结点是堆有序的二叉树中最大的结点。二叉堆是一组能够用堆有序的完全二叉树排序的元素，并在数组中按照层级储存（但不使用数组的索引为0的位置）。

### 二叉堆算法

堆的操作首先会进行一些简单的改动，这会打破堆的状态。随后我们会遍历堆并按照要求恢复堆的状态。这个过程称为**堆的有序化(Reheapifying)**。在堆的有序化过程中，我们会遭遇到两种情况。当某个结点的优先级上升（或在堆底加入了一个新的元素）时，我们需要由下至上恢复堆的顺序。而当某个结点的优先级下降（比如将根结点替换为一个较小的元素）时，我们需要由上至下恢复堆的顺序。

#### 由下至上的堆有序化（上浮）

当堆中的某个结点比其父结点还要大时，我们需要采用上浮操作恢复堆的顺序。具体采用的方法是重复地将该结点和其父结点对调位置，直至堆有序。

```Java
private void swim(int k) {
    while (k > 1 && less(k/2, k)) {
        exch(k, k/2);
        k = k/2;
    }
}
```

下面是堆由下至上有序化的示意图：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/sort3/promotion.png"
    width="50%"
    alt="上浮"
/>
</div>

#### 由上至下的堆有序化（下沉）

当堆中的某个结点比其两个子结点或其中之一要小时，需要采用下沉操作恢复堆的顺序。具体方法是将重复地该结点和其较大的子结点互换位置，直至堆有序。

```Java
private void sink(int k) {
    while (2*k <= N) {
        int j = 2*k;
        if (j < N && less(j, j+1)) j++;
        if (!less(k, j)) break;
        exch(k, j);
        k = j;
    }
}
```

下面是堆由上至下有序化的示意图：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/sort3/demotion.png"
    width="45%"
    alt="下沉"
/>
</div>

#### 插入元素

将新元素插入到数组的末尾，然后将该元素上浮到合适的位置。

```Java
public void insert(Key x) {
    pq[++N] = x;
    swim(N);
}
```

#### 删除最大元素

从数组顶端删除最大元素，然后将数组末尾的元素移动到顶端，将该元素下沉至合适的位置。

```Java
public Key delMax() {
    Key max = pq[1];
    exch(1, N--);
    sink(1);
    pq[N+1] = null;
    return max;
}
```

#### 性能比较

将二叉堆实现优先级队列的时间复杂度和之前两种实现方法进行比较：

|数组结构|插入元素|删除最大元素|
|:-:|:-:|:-:|
|有序数组|$N$|1|
|无序数组|1|$N$|
|二叉堆|$\lg N$|$\lg N$|

## 堆排序(Heap Sort)

利用上面介绍的最大堆的构造方法，我们可以实现一种经典而且优雅的排序算法——堆排序。堆排序分为两个部分。在堆的构造过程中，我们将原始数组安排进一个最大堆中，在排序阶段，我们从堆中按顺序取出最大元素，然后重新对堆进行排序，直至堆空。

### 堆排序实现

```Java
public static void sort(Comparable[] a) {
    int N = a.length;

    for (int k = N/2; k >= 1; k--)       // 堆构造
        sink(a, k, N);

    while (N > 1) {                      // 堆排序
        exch(a, 1, N);
        sink(a, 1, --N);
    }
}
```

#### 堆的构造

从数组右至左用`sink()`方法构造子堆，示意图如下：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/sort3/construction.png"
    width="70%"
    alt="堆的构造"
/>
</div>

#### 堆的排序

将堆的最大元素删除，然后将数组末尾的元素交换到根部，对堆进行下沉排序。示意图如下：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/sort3/sortdown.png"
    width="70%"
    alt="堆的下沉排序"
/>
</div>

### 性能分析

1. 用下沉操作由 $N$ 个元素构造堆只需要少于 $2N$ 次比较和少于 $N$ 次交换。
2. 堆的排序中，每次下沉操作最大可能需要 $2 \lg N$ 次比较。
3. 综上，将 $N$ 个元素排序，堆排序只需要小于 $(2N \lg N + 2N)$ 次比较和小于 $(N \lg N + N)$ 次交换。

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part I, Princeton University.](https://www.coursera.org/learn/algorithms-part1/home/welcome)
3. [殷人昆，数据结构（用面向对象方法与C++语言描述）第二版](https://book.douban.com/subject/2162035/)

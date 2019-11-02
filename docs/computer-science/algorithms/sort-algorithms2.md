---
series: 排序算法
title: 高级排序算法：归并排序和快速排序
enable html: true
categories: Algorithms
tags:
  - algorithm
  - sort
date: 2018-10-18 19:50:00
---

上一篇中，我们介绍了几种基本的排序算法，包括选择排序 (Selection Sort)，插入排序 (Insertion Sort) 和希尔排序 (Shell Sort)。在本篇中，我们主要考察归并排序(Merge Sort)和快速排序(Quick Sort)这两种更高级的排序算法，学习这两种排序算法的的实现方法，并分析归排和快排的性能指标。

<!-- more -->

## 归并排序(Merge Sort)

归并排序基于将两个有序的数组归并成一个更大的有序数组的操作。因此，想要对一个数组进行排序，可以**递归地**将其分成两半并分别排序，然后归并两半的结果。原地归并的实现代码如下。

### 原地归并(In-place Merge)

```Java
private static void merge(Comparable[] a, Comparable[] aux, int lo, int mid, int hi) {
    // 将 a[lo ... hi] 复制到 aux[lo ... hi]
    for (int k = lo; k <= hi; k++)
        aux[k] = a[k];

    int i = lo, j = mid + 1;

    // 归并回 a[lo ... hi]
    for (int k = lo; k <= hi; k++) {
        if (i > mid)                    a[k] = aux[j++];  // 左半数组用尽
        else if (j > hi)                a[k] = aux[i++];  // 右半数组用尽
        else if (less(aux[j], aux[i]))  a[k] = aux[j++];  // 右半的当前元素小于左半的当前元素
        else                            a[k] = aux[i++];  // 右半的当前元素大于左半的当前元素
    }
}
```

### 自顶向下的归并排序(Up-bottom Merge Sort)

如下的代码实现了自顶而下的归并排序。它利用了递归和分治思想。想要对子数组`a[lo ... hi]`进行排序，可以先将它分为`a[lo ... mid]`和`a[mid + 1 ... hi]`两部分，然后分别通过递归调用将其单独排序，最后将有序的数组归并为最终的排序结果。

下图展示了自顶向下归并排序的大概过程：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/mergesort1.png"
    width="60%"
    alt="自顶向下的归并排序"
/>
</div>

下面是自顶向下的归并排序的实现代码，它基于上一小节介绍的归并方法：

```Java
public class Merge {

    private static void merge(...) { /* as before */ }

    private static void sort(Comparable[] a, Comparable[] aux, int lo, int hi) {
        if (hi <= lo) return;
        int mid = lo + (hi - lo) / 2;
        sort(a, aux, lo, mid);
        sort(a, aux, mid+1, hi);
        merge(a, aux, lo, mid, hi);
    }

    public static void sort(Comparable[] a) {
        aux = new Comparable[a.length];
        sort(a, aux, 0, a.length - 1);
    }
}
```

可以证明，对于长度为N的任意数组，自顶向下的归并排序需要 $\frac{1}{2}N\lg N$ 至 $N\lg N$ 次比较，至多需要访问数组 $6N\lg N$ 次。

### 自顶向下归排的改进

#### 对小规模数组使用插排

递归调用归并函数会使小规模问题中的函数调用过于频繁，而调用函数本身会带来大量消耗。可以设计成当子数组规模小于一定长度（比如7）时，调用插排处理子数组排序。

```Java
private static void sort(Comparable[] a, Comparable[] aux, int lo, int hi) {

    if (hi <= lo + CUTOFF - 1) {
        Insertion.sort(a, lo, hi);
        return;
    }

    int mid = lo + (hi - lo) / 2;
    sort (a, aux, lo, mid);
    sort (a, aux, mid+1, hi);
    merge(a, aux, lo, mid, hi);
}
```

#### 测试数组是否已经有序

如果`a[mid]`小于等于`a[mid + 1]`，我们就认为该数组已经有序，可以跳过`merge()`方法。

```Java
private static void sort(Comparable[] a, Comparable[] aux, int lo, int hi) {
    if (hi <= lo) return;
    int mid = lo + (hi - lo) / 2;
    sort (a, aux, lo, mid);
    sort (a, aux, mid+1, hi);

    if (!less(a[mid+1], a[mid]))
        return;

    merge(a, aux, lo, mid, hi);
}
```

#### 不将元素复制到辅助数组

通过在递归调用的每个层次交换输入数组和辅助数组的角色，新的优化方法可以节省将数组元素复制到辅助数组所用的时间。

```Java
private static void merge(Comparable[] a, Comparable[] aux, int lo, int mid, int hi) {
    int i = lo, j = mid+1;
    for (int k = lo; k <= hi; k++) {
        if (i > mid)                aux[k] = a[j++];
        else if (j > hi)            aux[k] = a[i++];
        else if (less(a[j], a[i]))  aux[k] = a[j++];
        else                        aux[k] = a[i++];
    }
}

private static void sort(Comparable[] a, Comparable[] aux, int lo, int hi) {
    if (hi <= lo) return;
    int mid = lo + (hi - lo) / 2;
    sort(aux, a, lo, mid);
    sort(aux, a, mid+1, hi);
    merge(a, aux, lo, mid, hi); 
}
```

### 自底向上的归并排序(Bottom-up Merge Sort)

自顶向下的归并排序使用了分治的编程思想，它将一个大的问题分割成小的问题并予以分别解决。实现归并的另一种方法与此相反，可以先归并微小的数组，然后归并得到的稍大数组，直至将整个数组归并到一起。自底向上的归并排序的实现如下。

下图展示了自底向上的归并排序序的大概过程：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/mergesort2.png"
    width="60%"
    alt="自底向上的归并排序"
/>
</div>

下面是自底向上的归并排序的实现代码，它同样也基于之前介绍的归并方法：

```Java
public class MergeBU {

    private static void merge(...) { /* as before */ }

    public static void sort(Comparable[] a) {
        int N = a.length;
        Comparable[] aux = new Comparable[N];
        for (int sz = 1; sz < N; sz = sz+sz)          // sz为子数组大小
            for (int lo = 0; lo < N-sz; lo += sz+sz)  // lo为子数组索引
                merge(a, aux, lo, lo+sz-1, Math.min(lo+sz+sz-1, N-1));
    }
}
```

对于长度为N的任意数组，自底向上的归并排序需要 $\frac{1}{2}N\lg N$ 至 $N\lg N$ 次比较，至多需要访问数组 $6N\lg N$ 次。

### 排序算法的复杂度

可以证明，没有任何一个基于比较的排序算法能够保证使用少于 $lg(N!) ~ Nlg(N)$ 次比较将长度为 $N$ 的数组排序。

对于任何基于比较的排序算法，其比较操作可以用二叉树来表示。二叉树中的内部结点表示两个元素的一次比较操作，而叶子结点表示一个完成的排序。一个 $N$ 为 3 的示例图如下。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/complexity1.png"
    width="80%"
    alt="N = 3示例图"
/>
</div>

对于一个长度为 $N$ 的数组，我们可以发现判决树至少应该有 $N!$ 个叶子结点，因为对于 $N$ 个元素必然有 $N!$ 种全排列。另一个二叉树的基本性质是，高度为 $h$ 的二叉树最多有 $2^h$ 个叶子结点。当二叉树为完全二叉树时，结点数取上限 $2^h$。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/complexity2.png"
    width="90%"
    alt="h示例图"
/>
</div>

这样，我们可以得到叶子结点数量的大致范围：

$$
N! \leq \text{Num ~~ of ~~ Leaf ~~ Node} \leq 2^h
$$

其中 h 为最坏情况下的比较次数。根据 Stirling 公式，上述范围可以近似为：

$$
\lg N! \leq \text{Comparison Times} \leq N\lg N
$$

考虑到归并排序的时间复杂度约为 $N\lg N$，可以认为归并排序是一种在时间上渐进最优的基于比较的排序算法。

## 快速排序(Quick Sort)

快速排序是应用最广泛的排序算法之一。快速排序之所以受到广泛使用，主要是因为它是原地排序，且时间复杂度较低。但是错误的使用方法可能导致快排的表现迅速劣化，应该在实践中极力避免错误使用快排。

### 基本算法

快速排序算法的大致思路如下：

1. 随机打乱原数组；
2. 按照以下规则切分数组：
    - 对于某个`j`，`a[j]`已经排定
    - 使得`a[lo]`到`a[j - 1]`中的所有元素都不大于`a[j]`
    - 使得`a[j + 1]`到`a[hi]`中的所有元素都不小于`a[j]`
3. 递归地对对每个切分部分进行排序。

快速排序和归并排序正好相反：归排将数组分为两个子数组分别排序，然后将有序的子数组归并以得到有序的整个数组；而快排当两个子数组有序时，整个数组自然有序。也就是说，归排的递归调用发生在处理整个数组之前，而快排的递归调用发生在处理整个数组之后。

数组切分的原理如下图所示：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/patition.png"
    width="90%"
    alt="数组切分"
/>
</div>

切分的实现如下：

```Java
private static int partition(Comparable[] a, int lo, int hi) {
    int i = lo, j = hi+1;
    while (true) {
        while (less(a[++i], a[lo]))    // find item on left to swap
            if (i == hi) break;

        while (less(a[lo], a[--j]))    // find item on right to swap
            if (j == lo) break;

        if (i >= j) break;             // check if pointers cross
        exch(a, i, j);
    }

    exch(a, lo, j);                    // swap with partitioning item
    return j;
}
```

快排的大致过程如下图所示：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/quicksort.png"
    width="60%"
    alt="快速排序"
/>
</div>

快排的框架实现如下代码：

```Java
public class Quick {

    private static int partition(Comparable[] a, int lo, int hi) { /* as before */ }

    public static void sort(Comparable[] a) {
        StdRandom.shuffle(a);
        sort(a, 0, a.length - 1);
    }

    private static void sort(Comparable[] a, int lo, int hi) {
        if (hi <= lo) return;
        int j = partition(a, lo, hi);
        sort(a, lo, j-1);
        sort(a, j+1, hi);
    }
}
```

### 性能分析

可以证明，对于长度为N的无重复数组，快速排序平均需要约 $1.39N \lg N$ 次比较，最多需要 $N^2 / 2$ 次比较。当数组足够大时，运行时间趋于平均状态。

### 算法改进

#### 切换到插入排序

对于小数组，快排比插排要慢，这是因为小数组中快排的`sort()`仍会递归调用自身。因此可以在数组规模小于一定阈值时切换到插入排序，如下方法所示：

```Java
private static void sort(Comparable[] a, int lo, int hi) {
    if (hi <= lo + CUTOFF - 1) {
        Insertion.sort(a, lo, hi);
        return;
    }

    int j = partition(a, lo, hi);
    sort(a, lo, j-1);
    sort(a, j+1, hi);
}
```

#### 三取样切分

快排的切分点选定的是数组的首个元素，可能会因为偶然的原因导致这个元素偏小或偏大而导致排序效率下降。较好的改进方法是取子数组的一个部分的中位数作为切分点。实践发现取样大小为3时效果最好。该改进方法的实现如下：

```Java
private static void sort(Comparable[] a, int lo, int hi) {
    if (hi <= lo) return;

    int m = medianOf3(a, lo, lo + (hi - lo)/2, hi);
    swap(a, lo, m);

    int j = partition(a, lo, hi);
    sort(a, lo, j-1);
    sort(a, j+1, hi);
}
```

### 重复元素的快速排序

对于出现含有大量重复元素的数组，按照之前的方法进行快速排序将会继续将重复元素切分排序，进而降低排序算法的性能。这样的情况有很大的改进空间。

一个简单的方法是将数组切分为三部分，分别对应于小于、等于和大于切分点的元素。示意图如下：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/three%20way%20patitioning.png"
    width="45%"
    alt="三向切分"
/>
</div>

Dijkstra提出了一种基于该思想的三向切分的快速排序算法如下：

```Java
private static void sort(Comparable[] a, int lo, int hi) {
    if (hi <= lo) return;
    int lt = lo, gt = hi;
    Comparable v = a[lo];
    int i = lo;

    while (i <= gt) {
        int cmp = a[i].compareTo(v);
        if (cmp < 0)        exch(a, lt++, i++);
        else if (cmp > 0)   exch(a, i, gt--);
        else                i++;
    }

    sort(a, lo, lt - 1);
    sort(a, gt + 1, hi);
}
```

该算法从左至右遍历数组一次，维护一个指针`lt`使得`a[lo ... lt - 1]`中的所有元素都小于切分点；另一个指针`gt`使得`a[gt + 1 ... hi]`中的所有元素都大于切分点；一个指针`i`使得`a[lt ... i - 1]`中的元素都等于切分点，而`a[i ... gt]`中的元素尚未确定。如下图所示。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/three%20way%20pointers.png"
    width="45%"
    alt="三向指针"
/>
</div>

起初i位于lo的位置，按照以下方式进行处理：

- 若`a[i]`小于切分点，将`a[lt]`和`a[i]`交换，并将`lt`和`i`加一；
- 若`a[i]`大于切分点，将`a[gt]`和`a[i]`交换，并将`gt`减一；
- 若`a[i]`等于切分点，将`i`加一。

## 排序算法的比较

基于本篇和上一篇的介绍，我们现在可以对各排序算法的时间和空间复杂度进行大致的比较。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort2/compare.png"
    width="100%"
    alt="算法比较"
/>
</div>

可见，快速排序是最快的通用排序算法。

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part I, Princeton University.](https://www.coursera.org/learn/algorithms-part1/home/welcome)

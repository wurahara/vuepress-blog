---
series: 算法与数据结构学习笔记
title: 初级排序算法：选择排序，插入排序和希尔排序
enable html: true
categories: Algorithms
tags:
  - algorithm
  - sort
date: '2018-10-16 14:18'
---

刷越多的LeetCode就越会发现，算法基础掌握的不牢会极大地影响刷题的效果。因此我觉得有必要系统地、全面地整理一下几个比较重点的算法和数据结构知识点。我计划基于普林斯顿的 _[Algorithm 4th edition](https://book.douban.com/subject/10432347/)_ 这本书和 [Coursera 上的配套视频教程](https://www.coursera.org/learn/algorithms-part1/home/welcome)来整理相关的算法。预计将有排序算法、查找和搜索算法、图理论、字符串处理等几个部分。除此之外，面试算法题中还常会涉及到回溯算法和动态规划的问题，也有可能会特别地单独整理。

本篇是计划中系列的第一篇，主要介绍常用的几种排序算法，包括选择排序 (Selection Sort)，插入排序 (Insertion Sort)，希尔排序 (Shell Sort)，归并排序 (Merge Sort)，快速排序 (Quick Sort) 等排序算法的基本原理、性能指标及其简单应用。

<!-- more -->

## 代码的基本API

在介绍各排序算法的原理之前，我们首先要先约定几个基本的 API 接口提供给所有的排序算法使用。几乎所有排序算法都必须涉及 2 种主要的原子操作，即**比较**和**交换位置**。因此，为了统一各排序代码的接口风格，我们有必要对这两个操作的代码进行统一。

对于 Java 语言，任意对象的**可比性**依赖于该对象的类是否实现了 Comparable 接口 (interface)。Comparable 接口指定了该类的对象的比较原则，具体通过 `compareTo()` 方法实现。

```Java
public interface Comparable<Item>
{
    public int compareTo(Item that);
}
```

想要实现 Comparable接口，只需要在类中实现 `compareTo()` 方法。具体地，当本对象小于传入对象时，该方法返回负数，相等时返回 0，大于传入对象时返回正数。

```Java
public class File implements Comparable<File> {
    @Override
    public int compareTo(File b) {
        ...
        return -1;
        ...
        return +1;
        ...
        return 0;
    }
}
```

这样，我们就可以实现**比较**的接口：

```Java
private static boolean less(Comparable v, Comparable w) {
    return v.compareTo(w) < 0;
}
```

和**交换**的接口：

```Java
private static void exch(Comparable[] a, int i, int j) {
    Comparable swap = a[i];
    a[i] = a[j];
    a[j] = swap;
}
```

## 选择排序 (Selection Sort)

排序算法的简单原理是，找到数组的最小元素并将其与数组的首个元素交换位置。之后，在剩下的元素中找到最小元素并与数组的第二个元素交换位置。如此往复直至全数组有序。

### 算法描述

1. 在第 `i` 轮循环中，在剩余数组中寻找最小元素的下标 `min`；
2. 交换 `a[i]` 和 `a[min]` 的位置。

### 代码

```Java
public static void selectionSort(Comparable[] a) {
    int N = a.length;
    for (int i = 0; i < N; i++) {
        int min = i;
        for (int j = i+1; j < N; j++)
            if (less(a[j], a[min]))
                min = j;
        exch(a, i, min);
    }
}
```

### 图示

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort1/selection-sort.png"
    width="60%"
    alt="selection sort"
/>
</div>

### 性能分析

对于长度为 $N$ 的数组，选择排序需要约 $\frac{N^2}{2}$ 次比较和 $N$ 次交换位置。因此，我们可以发现选择排序有两个鲜明的特点：

1. 选择排序的运行时间与数据特性无关。所以，即使输入一个已经有序的数组，排序算法所需的运行时间也和输入一个完全随机乱序的数组所需的时间基本相等。
2. 选择排序需要最少的数据移动。选择排序算法所需的交换次数正好等于数组的长度 $N$。

## 插入排序 (Insertion Sort)

类似于对扑克牌进行排序，我们通常将新的牌插到已经有序的牌组中的适当位置。在插入排序算法中，索引左侧的元素已经有序，但还并不是其最终位置。当索引到达最右端时，数组完全有序。

### 算法描述

1. 在第 `i` 次循环中，将 `a[i]` 和其左侧的所有比其大的元素互换位置，直至该元素处于恰当位置。

### 代码

```Java
public static void insertionSort(Comparable[] a) {
    int N = a.length;
    for (int i = 0; i < N; i++)
        for (int j = i; j > 0; j--)
            if (less(a[j], a[j-1]))
                exch(a, j, j-1);
            else break;
 }
```

### 图示

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort1/insertion-sort.png"
    width="60%"
    alt="insertion sort"
/>
</div>

### 性能分析

对于随机排列的长度为 $N$ 且主键不重复的数组，平均情况下插入排序需要大约 $\frac{N^2}{4}$ 次比较和约 $\frac{N^2}{4}$ 次交换位置。最坏情况下需要约 $\frac{N^2}{2}$ 次比较和约 $\frac{N^2}{2}$ 次交换。最好情况下需要 $N - 1$ 次比较和 $0$ 次交换。

对于一个**基本有序数组**，我们通常用**逆序对 (Inversions)** 来考察其有序程度。逆序对指的是数组中两个顺序颠倒的元素。对于下列数组：

<center>A E E L M O T R X P S</center>

该数组中有 6 个逆序对，分别是 T-R, T-P, T-S, R-P, X-P, X-S。

那么基于逆序对，我们可以定义一个数组是基本有序数组，当且仅当该数组中逆序对的数量小于等于 $cN$，其中 $c$ 为特定常数。对于基本有序数组，其插入排序运行时间始终是线性的，因为所需的交换次数就等于数组中逆序对的个数，而比较次数为逆序对数 $+ (N - 1)$。

## 希尔排序 (Shell Sort)

### 算法原理

希尔排序是一种基于插入排序的快速排序算法。我们容易发现，对于大规模乱序数组，插入排序的运行很慢。这是因为插排只会交换相邻的元素，即使该元素需要远距离移动才能被安排到正确的位置上。为了解决插排的这一问题，希尔排序进行了简单的改进，即交换不相邻的元素以对数组的局部进行排序，并最终使用插排处理部分有序数组。

希尔排序的初步处理基于名为 **h- 排序**的简单算法，该算法就是间隔为 $h$ 的插排。h- 排序可以将乱序数组处理成基本有序数组。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort1/shell-sort1.png"
    width="60%"
    alt="h - sort"
/>
</div>

### 增量序列

该如何选择 h- 排序中每一轮的增量 $h$？有很多相关论文讨论了这一话题。目前主要采用的几种表现较好的增量序列如下。

1. **3x + 1**. 1, 4, 13, 40, 121, 364, ......
2. **Sedgewick Sequence**. 1, 5, 19, 41, 109, 209, 505, 929, 2161, 3905, ......

### 代码

```Java
public static void shellSort(Comparable[] a) {
    int N = a.length;

    int h = 1;
    while (h < N/3) h = 3*h + 1;

    while (h >= 1) {// h-sort the array.
        for (int i = h; i < N; i++) {
            for (int j = i; j >= h && less(a[j], a[j-h]); j -= h)
                exch(a, j, j-h);
        }
        h = h/3;
    }
}
```

### 图示

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/sort1/shell-sort2.png"
    width="70%"
    alt="shell sort"
/>
</div>

### 性能分析

尚未有研究得出希尔排序的精确性能模型，我们可以通过大规模实验近似希尔排序的性能边界。对于最坏情况，使用 $3x + 1$ 增量序列的希尔排序需要进行约  $N^{\frac{3}{2}}$ 次比较。

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part I, Princeton University.](https://www.coursera.org/learn/algorithms-part1/home/welcome)

---
series: 算法与数据结构学习笔记
title: 字符串排序
enable html: true
categories: Algorithms
tags:
  - algorithm
  - string
  - sort
date: 2018-11-19 09:34:17
---

从本篇开始，我们将介绍字符串处理的相关算法，主要有字符串排序、单词查找树、子串查找和正则表达式等部分。本篇，我们将在之前介绍的几种排序算法的基础上介绍用于字符串的相关排序方法，这些方法能实现时间复杂度为线性级别的高效排序。

<!-- more -->

## 字符串

### String 类

首先我们需要介绍字符串的数据结构。需要注意的是，我们的介绍局限于 Java 语言，但是我们已经尽量避免使用 Java 的语言特性以实现语言无关和通用性。

1. 字符数组：Java 的字符串内部由字符数组保存数据，其类型为 16 位 Unicode 编码的 `char`型数据。
2. 长度：`length()`方法返回字符的数量，时间复杂度在常数级别；
3. 索引：`charAt()`方法返回指定位置的字符，时间复杂度同样在常数级别；
4. 子串：`substring()`方法返回指定区间的子字符串，时间复杂度同样在常数级别；
5. 字符串连接：Java 的字符串为不可变类型 (Immutable)，因此在实现字符串连接时将一个字符串追加到另一个字符串的末尾，并创建一个新的字符串。字符串的连接不同于 C 或 C++ 使用`concat()`方法，而是直接使用`+`运算符实现。字符串连接的时间复杂度为线性级别，和结果字符串的长度成正比。

### StringBuilder 类

Java 除了提供 String 类之外，还提供了 StringBuilder 类来服务字符串的复杂操作。和 String 类相比，StringBuilder 类是可变的 (Mutable)，它内部通过`resize()`方法来动态的调整字符数组的长度。在操作上，StringBuilder 能够提供常数级别的字符串连接方法，但是其子串方法的时间复杂度上升到了线性级别。

Java 还提供了和 StringBuilder 类相似的 StringBuffer 类，该类的特性是线程安全的，但需要牺牲一定的效率来实现这一特性。

## 键索引计数法 (Key-indexed Counting)

我们之前介绍的几种基于`compareTo()`操作的排序算法，最好的时间复杂度在 $N \log N$ 级别。然而对于属于有限字符集的字符串来说，我们可以使用`charAt()`方法作为原子操作来提高算法效率。

### 键索引

作为热身，我们首先介绍一种用于小整数键的简单排序方法，称为键索引计数法。我们的场景是将学生分为若干组，比如 1, 2, 3 等等。假设数组`a[]`中的每个元素都保存了一个名字和键，其中键在 $0$ 和 $R - 1$ 之间。如图所示。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/key%20indexed%20counting.png"
    width="35%"
    alt="适用于键索引计数法的典型情况"
/>
</div>

该方法的基本思路如下：

1. **词频统计**

将`a[]`按照组号排序，并统计每个键出现的次数；

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/key%20indexed%201.png"
    width="35%"
    alt="键索引1"
/>
</div>

2. **将频率转化为索引**

将每个键出现的频率按次堆积累加，作为索引表；

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/key%20indexed%202.png"
    width="35%"
    alt="键索引2"
/>
</div>

3. **数据分类**

按照索引表的索引值将每个键拷贝到冗余数组的指定位置；

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/key%20indexed%203.png"
    width="40%"
    alt="键索引3"
/>
</div>

4. **回写**

将排好序的冗余数组覆写原数组。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/key%20indexed%204.png"
    width="40%"
    alt="键索引4"
/>
</div>

### 实现

该方法的代码实现如下：

```Java
int N = a.length;
String[] aux = new String[N];
int[] count = new int[R+1];

// 计算出现频率
for (int i = 0; i < N; i++)
    count[a[i].key() + 1]++;

// 将频率转化为索引
for (int r = 0; r < R; r++)
    count[r+1] += count[r];

// 将元素分类
for (int i = 0; i < N; i++)
    aux[count[a[i].key()]++] = a[i];

// 回写
for (int i = 0; i < N; i++)
    a[i] = aux[i];
```

### 性能

对于 $N$ 个字符串，如果其字母表基数大小为 $R$，键索引计数法需要使用 $11N + 4R + 1$ 次数组访问以完成排序。其空间复杂度在 $N + R$ 级别。

## 低位优先排序 (LSD, Least-significant-digit First)

首先要介绍的是低位优先基数排序算法，该算法适用于长度相同的一系列字符串的快速排序。该算法的思路极其简单，对于长度为 $W$ 的一组字符串，从右向左以每个位置的字符作为键，然后用键索引计数法将字符串排序 $W$ 次。考虑到键索引计数法是稳定的，所以首先被排序的右侧字符不会在左侧字符排序时被打乱其相对位置。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/LSD.png"
    width="75%"
    alt="LSD"
/>
</div>

LSD 的实现如下：

```Java
public class LSD {
    public static void sort(String[] a, int W) {
        int N = a.length;
        int R = 256;
        String[] aux = new String[N];

        // 键索引计数法
        for (int d = W - 1; d >= 0; d--) {
            int[] count = new int[R+1];
            for (int i = 0; i < N; i++)
                count[a[i].charAt(d) + 1]++;
            for (int r = 0; r < R; r++)
                count[r+1] += count[r];
            for (int i = 0; i < N; i++)
                aux[count[a[i].charAt(d)]++] = a[i];
            for (int i = 0; i < N; i++)
                a[i] = aux[i];
        }
    }
}
```

可以证明，对于基数 $R$ 个字符的字母表的 $N$ 个以长为 $W$ 的字符串作为键的元素，LSD 需要访问约 $7WN + 3WR$ 次数组，其空间复杂度在 $N + R$ 级别。

## 高位优先排序 (MSD, Most-significant-digit First)

### 基本原理

LSD 只适用于长度相同的一组字符串，而我们下面要介绍的 MSD 能够对长度不同的字符串进行排序。

顾名思义，高位优先排序从左到右遍历字符串的所有字符。MSD 使用键索引计数法对所有字符串的首位进行排序，然后递归地将每个首字母对应的子数组排序。该算法和快排的思路极其相似，都是将数组切分为若干个子数组，然后对子数组递归排序。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/MSD.png"
    width="90%"
    alt="MSD"
/>
</div>

### 字符串末尾处理

考虑到 MSD 可以为长度不同的字符串排序，为了处理不同长度的字符串，需要在字符串的末尾进行处理，以保证排序算法的正确性和稳定性：

```Java
private static int charAt(String s, int d) {
    if (d < s.length())
        return s.charAt(d);
    else
        return -1;
}
```

### 小型子数组

MSD 会遭遇和快排和归排相似的问题，即当递归的数组过小时，递归操作本身会带来极大的性能劣化。处理方法也和之前类似，就是在一定阈值下的小型数组，切换到插入排序以避免频繁递归带来的性能损失。

### 实现

MSD 的实现如下：

```Java
public class MSD {
    private static int R = 256;                   // 基数
    private static final int M = 15;              // 小数组切换阈值
    private static String[] aux;

    private static int charAt(String s, int d) {
        if (d < s.length())
            return s.charAt(d);
        else
            return -1;
    }

    public static void sort(String[] a) {
        int N = a.length;
        aux = new String[N];
        sort(a, 0, N-1, 0);
    }

    private static void sort(String[] a, int lo, int hi, int d) {
        if (hi <= lo + M) {
            Insertion.sort(a, lo, hi, d);
            return;
        }

        // 键索引计数法
        int[] count = new int[R+2];
        for (int i = lo; i <= hi; i++)
            count[charAt(a[i], d) + 2]++;
        for (int r = 0; r < R+1; r++)
            count[r+1] += count[r];
        for (int i = lo; i <= hi; i++)
            aux[count[charAt(a[i], d) + 1]++] = a[i];
        for (int i = lo; i <= hi; i++)
            a[i] = aux[i - lo];

        // 递归地以每个字符为键进行排序
        for (int r = 0; r < R; r++)
            sort(a, lo + count[r], lo + count[r+1] - 1, d+1);
    }
}
```

### 性能

对于 MSD 的性能，我们可以得到如下的几个结论：

1. 对于基数 $R$ 个字符的字母表的 $N$ 个字符串，MSD 平均需要检查 $N \log_R N$ 个字符；
2. 对于基数 $R$ 个字符的字母表的 $N$ 个字符串，MSD 需要访问数组的次数在 $8N + 3R$ 到 $7wN + 3wR$ 之间。其中 $w$ 是字符串的平均长度；
3. 对于基数 $R$ 个字符的字母表的 $N$ 个字符串，最坏情况下 MSD 的空间复杂度为 $N + DR$，其中 $D$ 为最长字符串的长度。

## 三向字符串快排 (3-way Radix Quicksort)

### 基本原理

基于 MSD 的思路，我们可以对快排进行改造，使其适应字符串排序的需求。

三向字符串快速排序算法的基本思路是根据键的首字母对字符串数组进行三向切分，然后对中间子数组中的下一个字符递归地继续排序。该算法比普通的 MSD 性能更好，因为三向切分总是将数组切分成三段，能够避免切分大量子数组带来的性能问题。这对于等值键、较长公共前缀键和小型数组的处理更加优异。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string1/3-way.png"
    width="75%"
    alt="三向字符串快排"
/>
</div>

### 实现

三向快排的实现如下：

```Java
public class Quick3string {
    private static int charAt(String s, int d) {
        if (d < s.length())
            return s.charAt(d);
        else
            return -1;
    }

    public static void sort(String[] a) {
        sort(a, 0, a.length - 1, 0);
    }

    private static void sort(String[] a, int lo, int hi, int d) {
        if (hi <= lo)
            return;

        int lt = lo;
        int gt = hi;
        int v = charAt(a[lo], d);
        int i = lo + 1;

        while (i <= gt) {
            int t = charAt(a[i], d);
            if (t < v)
                exch(a, lt++, i++);
            else if (t > v)
                exch(a, i, gt--);
            else
                i++;
        }

        sort(a, lo, lt-1, d);            // 首字母小于切分字母的字符串子数组
        if (v >= 0)                      // 首字母等于切分字母的字符串子数组
            sort(a, lt, gt, d+1);
        sort(a, gt+1, hi, d);            // 首字母大于切分字母的字符串子数组
    }
}
```

### 性能

对于 $N$ 个随机字符串数组，三向快排平均需要比较字符约 $2N \ln N$ 次。

这样，我们可以总结一下本篇中已经介绍的几种字符串排序算法的性能：

|算法|最差时间复杂度|随机时间复杂度|空间复杂度|稳定性|原子操作|
|:-:|:---------:|:----------:|:------:|:----:|:----:|
|LSD|   $2NW$    |   $2NW$    |$N + R$|  是  |`charAt()`|
|MSD|   $2NW$    |$N \log_R N$|$N + DR$|  是  |`charAt()`|
|三向快排|$1.39WN \lg R$|$1.39N \lg N$|$\log N + W$|  否  |`charAt()`|

## 后缀数组 (Suffix Arrays)

下面我们针对字符串处理中的一个常见的问题讨论重复子串的检测方法。

### 后缀排序 (Suffix Sort)

首先，我们考虑这样的场景：给定一个长文本，在该文本中寻找最长的重复子字符串。该场景广泛存在于科学研究的方方面面，比如搜索引擎的数据预处理、数据库的检索优化、语言学研究或者生物学中碱基对的分析。

对于该问题，我们有这样针对性的解决方法：使用 Java 的`substring()`方法创建一个原字符串`s`的所有后缀字符串组成的数组，然后将该数组进行基数排序。考虑到原字符串`s`中的每个子串都是数组中某个后缀字符串的前缀，这样的排序能将最长的重复子串处理到数组中的相邻位置。这样，只需要遍历排序后的数组一次，就可以找到最长的公共子串。 

### 实现

下面是后缀数组的实现：

```Java
public class SuffixArray {
    private final String[] suffixes;          // 后缀数组
    private final int N;                      // 字符串以及后缀数组的长度

    public SuffixArray(String s) {
        N = s.length();
        suffixes = new String[N];
        for (int i = 0; i < N; i++)
            suffixes[i] = s.substring(i);
        Quick3way.sort(suffixes);
    }

    public String select(int i) {
        return suffixes[i];
    }

    public int index(int i) {
        return N - suffixes[i].length();
    }

    // 两个字符串的最长公共前缀
    private static int lcp(String s, String t) {
        int N = Math.min(s.length(), t.length());
        for (int i = 0; i < N; i++)
            if (s.charAt(i) != t.charAt(i))
                return i;
        return N;
    }

    public int lcp(int i) {
        return lcp(suffixes[i], suffixes[i-1]);
    }

    // 二分查找
    public int rank(String key) {
        int lo = 0;
        int hi = N - 1;

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int cmp = key.compareTo(suffixes[mid]);
            if (cmp < 0)
                hi = mid - 1;
            else if (cmp > 0)
                lo = mid + 1;
            else
                return mid;
        }
        return lo;
    }
}
```

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

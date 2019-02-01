---
title: 算法与数据结构学习笔记——子串搜索
enable html: true
categories: Algorithms
tags:
  - algorithm
  - string
  - substring
date: 2018-11-22 18:25:29
---

本篇我们介绍子字符串查找算法。在之前的几篇中，我们已经涉及了一些关于子字符串的算法，本篇中我们考察在长文本中搜索特定模式的专用算法。给定一个长度为 $M$ 的短文本，称为**模式字符串** (pattern)，需要在长文本或字符流中搜索和模式匹配的子字符串。

<!-- more -->

## 暴力搜索

暴力搜索是一个在子串搜索中广泛使用的算法，该算法虽然实现简单，且在最坏情况下表现平庸，但是很好地利用了大多数计算机系统中标准的结构特性，所以即使更巧妙的算法也很难超越其经过优化后的版本的性能。

### 基本实现

简单的暴力搜索算法使用两个指针分别跟踪长文本和模式：

```Java
// brute force
public static int search(String pat, String txt) {
    int M = pat.length();
    int N = txt.length();
    for (int i = 0; i <= N - M; i++) {
        int j;
        for (j = 0; j < M; j++)
            if (txt.charAt(i+j) != pat.charAt(j))
                break;
        if (j == M)                          // 找到了匹配的子字符串
            return i;
    }
    return N;                                // 未找到匹配的子字符串
}
```

很容易发现，上述算法在最坏情况下的时间复杂度为 $MN$ 级别，其中 $M$ 是模式长度，$N$ 文本长度。当文本和模式中都存在及其类似的长重复段落时，每次匹配都在模式指针移到末尾时才发现失败，此时出现最坏情况。这样的情况在自然语言（如英语）中几乎不会出现，但是在二进制文本中是完全可能的。

<div  align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/brute%20force%20worst%20case.png"
    width="70%"
    hegiht="80%"
    alt="暴力搜索的最坏情况"
/>
</div>

但是一般情况下，模式指针增长的机会很小，因此该算法的一般运行时间和 $N$ 成正比，这是较为优异的性能表现。

### 显式回退

暴力搜索的另一种实现使用了显式回退。在这种实现下，程序使用指针`i`跟踪长文本，使用指针`j`跟踪模式。当`i`和`j`指向的字符相匹配时，操作和基本实现相同。然而本实现中`i`指向的是文本中已经匹配过的字符序列的末端，而不像上一种实现中那样指向匹配序列的开头。因此，如果`i`和`j`指向的字符失配，需要将`j`指针回退到模式的开头，将`i`指针指向本次匹配开始位置的下一个字符。

<div  align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/explicit%20backup%20brute%20force.png"
    width="70%"
    hegiht="80%"
    alt="显式回退的暴力搜索算法"
/>
</div>

```Java
public static int search(String pat, String txt) {
    int N = txt.length();
    int M = pat.length();
    int i, j;
    for (i = 0, j = 0; i < N && j < M; i++) {
        if (txt.charAt(i) == pat.charAt(j))
            j++;
        else {
            i -= j;
            j = 0;
        }
    }
    if (j == M)
        return i - M;                        // 找到了匹配的子字符串
    else
        return N;                            // 未找到匹配的子字符串
}
```

需要注意的是，显式回退并不值得鼓励，因为显式回退完全无法解决输入为文本流的情况。

## Knuth-Morris-Pratt 搜索算法

当子串失配时，事实上我们已经得知了文本的一部分内容了。我们应该如何利用这样的知识，来避免不必要的回退操作呢？D.E. Knuth，J. H. Morris 和  V. R. Pratt 在 1976 年发表的论文指出了一种全新的思路，就是将模式字符串抽象称为一个有限状态自动机。

### 确定有限状态自动机 (DFA, Deterministic Finite State Automaton)

在 KMP 算法中，失配时不会回退指针`i`，而是借由数组`dfa[][]`指出模式指针`j`应该回退多少位。对于字符`c`，在比较了`c`和`pat.charAt(j)`后，`dfa[c][j]`表示的是应该和下个文本字符比较的模式字符的位置。

<div  align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/dfa.png"
    width="85%"
    hegiht="80%"
    alt="DFA"
/>
</div>

### 构造 DFA

KMP 算法的关键就是根据模式构造有限状态机，即对应的`dfa[][]`二维数组。

1. **匹配转换项**

当模式处于状态`j`，且文本中的字符`c`满足`c == pat.charAt(j)`，则此时`dfa[c][j] = j + 1`。

2. **失配转换项**

若在状态`j`时有`c != pat.charAt(j)`，那么匹配失败，需要重启自动机。重启自动机的实质是，我们并不想真的显式回退，而只是想将自动机重制到适当的状态上，仿佛已经回退了文本指针一样。
在这个状态时，我们可以断言文本输入中的前`j - 1`个字符就是`pat[1 ... j - 1]`，跟着字符`c`。因此，假设重置指针，扫描会从`pat[1]`位置指示的字符开始，按照 DFA 的扫描顺序重新扫描一遍，直到扫描到`pat[j - 1]`位置的字符，并接着扫描字符`c`。因此，我们就可以依据已有的 DFA 内容确定后续的 DFA 数据。

下图以模式 ABABAC 为例，演示了 DFA 的构造过程：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/DFA%20construction.png"
    width="100%"
    hegiht="80%"
    alt="DFA的构造"
/>
</div>

基于以上分析，我们可以总结以下 DFA 的构造方法。对于状态`j`：

1. 将`dfa[][X]`拷贝到`dfa[][j]`，对应着失配的情况；
2. 将`dfa[pat.charAt(j)][j]`设为`j + 1`，对应着匹配成功的情况；
3. 更新`X`的值。

```Java
// 构造有限状态机
dfa[pat.charAt(0)][0] = 1;
for (int X = 0, j = 1; j < M; j++) {
    for (int c = 0; c < R; c++)
        dfa[c][j] = dfa[c][X];
    dfa[pat.charAt(j)][j] = j+1;
    X = dfa[pat.charAt(j)][X];
}
```

### 基于 DFA 的搜索

DFA 构造完成后，KMP 算法的实现就变得异常简单：

```Java
public class KMP {
    private String pat;
    private int[][] dfa;

    public KMP(String pat) {
        this.pat = pat;
        int M = pat.length();
        int R = 256;
        dfa = new int[R][M];

        // 构造 DFA
        dfa[pat.charAt(0)][0] = 1;
        for (int X = 0, j = 1; j < M; j++) {
            for (int c = 0; c < R; c++)
                dfa[c][j] = dfa[c][X];
            dfa[pat.charAt(j)][j] = j+1;
            X = dfa[pat.charAt(j)][X];
        }
    }

    public int search(String txt) {
        int i, j;
        int N = txt.length();
        int M = pat.length();
        for (i = 0, j = 0; i < N && j < M; i++)
            j = dfa[txt.charAt(i)][j];
        if (j == M)
            return i - M;
        else
            return N;
    }
}
```

### 性能分析

关于 KMP 算法的性能，我们有如下结论：

1. 对于长为 $M$ 的模式字符串，构造 DFA 所需的时间和空间复杂度均为 $RM$级别，其中 $R$ 为字母表的基数；
2. 对于长度为 $N$ 的文本，KMP 算法至多需要访问字符 $M + N$ 次以完成搜索。

## Boyer-Moore 搜索算法

### 算法思想

当可以在文本字符串中回退时，从右往左扫描模式字符串可以得到一种快速的子串搜索算法。比如在查找模式 BAABBAA 时，如果匹配了第 7 个和第 6 个字符，但第 5 个字符匹配失败，就可以将模式向右移动 7 个位置并继续检查文本中的第 14 个字符。原因是部分匹配找到了 XAA 但是 X 不是 B，而这 3 个连续字符在模式中是唯一存在的。

具体地，如何确定失配时跳过多少个字符呢？我们考察以下几种情况：

1. 失配时文本字符不在模式中，则将模式直接移动到失配字符之后；

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/BM%20Case%201.png"
    width="60%"
    hegiht="80%"
    alt="Case 1"
/>
</div>

2. 失配时文本字符在模式中也存在，则将模式中位置最右的该字符和文本中的该字符对齐；

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/BM%20Case%202a.png"
    width="60%"
    hegiht="80%"
    alt="Case 2a"
/>
</div>

3. 失配时文本字符在模式中也存在，但是如果采用 2 中的方法会使模式字符串像左移动，则将`i`加 1。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/BM%20Case%202b.png"
    width="60%"
    hegiht="80%"
    alt="Case 2b"
/>
</div>

### 算法实现

为了实现上述算法，我们使用一个数组`right[]`记录字母表中每个字符在模式中出现最靠右的地方，如果字符在模式中未出现则表示为 -1。这样，我们可以实现算法如下：

```Java
public class BoyerMoore {
    private int[] right;
    private String pat;

    // 构造跳跃表
    BoyerMoore(String pat) {
        this.pat = pat;
        int M = pat.length();
        int R = 256;
        right = new int[R];
        for (int c = 0; c < R; c++)
            right[c] = -1;
        for (int j = 0; j < M; j++)
            right[pat.charAt(j)] = j;
    }

    public int search(String txt) {
        int N = txt.length();
        int M = pat.length();
        int skip;

        // 考察模式和文本在位置i处是否匹配
        for (int i = 0; i <= N-M; i += skip) {
            skip = 0;
            for (int j = M-1; j >= 0; j--)
                if (pat.charAt(j) != txt.charAt(i+j)) {
                    skip = j - right[txt.charAt(i+j)];
                    if (skip < 1)
                        skip = 1;
                    break;
                }
            if (skip == 0)                  // 找到了匹配的子字符串
                return i;
        }
        return N;                           // 未找到匹配的子字符串
    }
}
```

### 性能分析

关于 Boyer-Moore 算法的性能，我们有如下结论：

1. 对于长为 $N$ 的文本和长为 $M$ 的模式字符串，使用 BM 算法通过启发式处理不匹配的字符需要约 $\frac{N}{M}$ 次字符比较，最坏情况下需要 $MN$ 次比较；
2. 引入 KMP 式的数据结构可以将最坏情况下的时间复杂度下降到 $3N$ 级别。

## Rabin-Karp 指纹搜索算法

### 算法思想

和上面几种算法不同，Rabin-Karp 算法基于的是字符串的散列。其基本思路是：

1. 计算模式的散列；
2. 对于每个位置`i`，计算文本从`i`到`M + i - 1`的散列；
3. 将以上两个散列值比较，如果相同再继续考察两段字符串是否完全相同。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string3/Rabin-Karp%20fingerprint%20search.png"
    width="75%"
    hegiht="80%"
    alt="Rabin-Karp 算法"
/>
</div>

根据以上描述直接实现的算法会比暴力搜索更慢，因为计算散列会涉及到字符串中的各个字符，成本比直接比较更高。

### 快速散列计算

考虑到散列计算需要耗费大量时间，我们需要利用散列的性质精简算法。我们用 $t_i$ 表示`txt.charAt(i)`，那么文本中起于`i`，止于`M + i - 1`的子字符串对应的值为：

$$
x_i = t_i R^{M-1} + t_{i+1} R^{M-2} + ... + t_{i+ M - 1} R^{0}
$$

同样地，起于`i + 1`，止于`M + i`的子字符串对应的值为：

$$
x_{i+1} = t_{i+1}R^{M-1} + t_{i+2}R^{M-2} + ... + t_{i+ M}R^{0}
$$

于是，我们有：

$$
x_{i+1} = (x_i - t_iR^{M-1})R + t_{i+M}R^{0}
$$

这样，我们就得到了散列计算的递推公式。

### 算法实现

基于以上分析，我们很容易实现该算法的代码：

```Java
public class RabinKarp {
    private long patHash;                   // 模式的散列
    private int M;                          // 模式的长度
    private long Q;                         // 一个大素数
    private int R = 256;                    // 字母表的基数
    private long RM;                        // R ^ (M - 1) % Q

    public RabinKarp(String pat) {
        this.M = pat.length();
        Q = longRandomPrime();
        RM = 1;
        for (int i = 1; i <= M-1; i++)
            RM = (R * RM) % Q;
        patHash = hash(pat, M);
    }

    private long hash(String key, int M) {
        long h = 0;
        for (int j = 0; j < M; j++)
            h = (R * h + key.charAt(j)) % Q;
        return h;
    }

    private int search(String txt) {
        int N = txt.length();
        long txtHash = hash(txt, M);

        if (patHash == txtHash)             // 一开始就匹配成功
            return 0;

        for (int i = M; i < N; i++) {
            txtHash = (txtHash + Q - RM * txt.charAt(i - M) % Q) % Q;
            txtHash = (txtHash * R + txt.charAt(i)) % Q;
            if (patHash == txtHash)         // 找到了匹配的子字符串
                return i - M + 1;
        }
        return N;                           // 未找到匹配的子字符串
    }
}
```

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

---
series: 字符串处理
title: 正则表达式与不定有限状态机
enable html: true
categories: Algorithms
tags:
  - algorithm
  - string
  - regular expression
date: 2018-11-27 09:44:43
---

上一篇中，我们介绍了几种在字符串或字符流中搜索给定模式的几种算法。但是在许多的应用场景中，我们并不能获得模式的全部信息，而只能获得模式的一个切分或者一个特性。为了实现条件更为宽松的字符串匹配操作，我们需要使用**正则表达式**来描述模式的特性。与上一篇中 KMP 算法处理模式的手法类似，我们也可以通过构造有限状态机来抽象正则表达式的特性以辅助匹配。

<!-- more -->

## 正则表达式

首先我们需要对正则表达式有较为全面的了解。

### 基本正则表达式

基本的正则表达式由 3 种基本操作和作为操作数的字符组成。

1. **连接操作 (Concatenation)**

简单将字符进行前后连接，就构成了最简单的正则表达式。比如模式`AABAAB`只能匹配字符串 AABAAB。

2. **或操作 (Or)**

或操作用于在模式中选择若干种可能出现的子串。如果在两种选择之间放置了一个或运算符`|`，则该表达式匹配或运算符之前**或者**之后的子串。比如模式`AA|BAAB`匹配字符串 AA 或者 BAAB；模式`A|E|I|O|U`匹配字符串 A，E，I，O或者U。

3. **闭包操作 (Closure)**

闭包操作用于将闭包内的部分重复任意次数，使用运算符`*`表示。比如模式`AB*A`可以匹配字符串 AA 或者 ABBBBA。

4. **括号 (Parentheses)**

使用括号可以改变默认的优先级顺序。上面的三种基本操作的优先级顺序为 闭包 > 连接 > 或。使用括号可以显式地改变这样的优先级顺序。比如`(AB)*A`可以匹配的是字符串 A 或者 ABABABABA，需要注意的是这与 3 中类似模式的不同。

### 正则表达式的缩略写法

实际应用程序一般在上述基本操作的基础上还约定了一系列的缩略写法以精简正则表达式的书写。

#### 字符集描述符

使用一个或几个字符代表一整个字符集。具体的字符集描述符如下：

|  名称   |            说明        |    举例    |匹配字符串|
|:------:|:----------------------:|:---------:|:------:|
| 通配符  |          `.`           |   `A.B`   |  AXB   |
|指定字符集|    包含在`[]`中的字符    | `[AEIOU]` |   E    |
| 范围集合 | 包含在`[]`中，并由`-`分割|`[A-Z][0-9]`|  B2    |
|  补集   |包含在`[]`中，且首字符为`^`| `[^AEIOU]`|   C    |

#### 闭包的重复

表示将闭包的内容重复多次的描述符，这些运算符可以灵活地指定重复的次数或次数的范围。

|选项|符号|举例|匹配字符串|
|:---------:|:--------:|:-----:|:--:|
|至少重复 1 次|`+`|`(AB)+`|AB 或 ABABAB 等|
|重复 0 次或 1 次|`?`|`(AB)?`|空字符串或 AB|
|重复指定次数|`{}`|`(AB){2}`|ABAB|
|重复指定次数范围|`{}`|`(AB){1-2}`|AB 或 ABAB|

## 非确定有限状态自动机 (NFA, Nondeterministic Finite State Automaton)

我们该如何识别一段字符串是否与某个正则表达式相匹配呢？在上一篇中介绍的 KMP 算法借助构造确定有限状态机来抽象出模式字符串的特性以帮助匹配。在正则表达式中我们也可以利用相似的手段。

### 正则表达式的非确定性

我们需要认识到，在字符串匹配中，状态机接收文本的一个字符以确定下一次转换到的状态。这表明字符串匹配的操作是确定性的。而正则表达式的匹配是不确定的，因为或操作和闭包操作的存在，自动机无法通过检查有限次字符就确定模式是否出现。因此，我们需要新的模型——非确定有限状态机 (NFA)，来抽象正则表达式的匹配过程。

### NFA 与正则表达式

我们定义这样的 NFA：

- NFA 的每个状态代表正则表达式中的一个字符，其末尾状态为虚拟的接受状态；
- NFA 将正则表达式用一对括号包裹起来；
- NFA 使用红色连接表示 $\epsilon$- **转换**，这种转换从一个状态转换到另一个状态，但不扫描文本中的字符；
- NFA 使用黑色连接表示**匹配转换**，这种转换在变换状态的同时扫描文本中的一个字符；
- 当扫描了文本中的所有字符，并且 NFA 终止于接收状态时，匹配成功。

下图是正则表达式`(A*B|AC)D`对应的 NFA 的实例：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20example.png"
    width="75%"
    alt="NFA"
/>
</div>

## 模拟 NFA 的运行

基于上面的分析，我们将考察如何在已经给定 NFA 模型的基础上匹配文本字符串。

### NFA 的表示

首先我们需要约定 NFA 的数据结构：

- 使用 0 到 M 的整数表示 NFA 的诸状态，其中 M 为正则表达式的长度；
- 使用字符数组`re[]`表示正则表达式各状态所代表的字符。该数组也表示了**匹配转换**：如果`re[i]`存在于字母表中，就代表存在一个从`i`到`i+1`的匹配转换；
- 使用一个有向图 $G$ 表示 NFA 中所有的 $\epsilon$- **转换**。

### NFA 模拟实例

使用 NFA 匹配文本字符串遵循以下步骤：

1. 查找所有从状态 0 通过 $\epsilon$- 转换可以到达的状态，然后检查这些状态中是否有某个状态和第一个字符匹配；
2. 检查到匹配后，检查从该新状态出发通过 $\epsilon$- 转换可以到达的状态，然后检查这些状态中是否有某个状态和该字符匹配；
3. 重复第 2 步，直到可能到达的状态集合中含有接受状态或者扫描完所有字符串都无法到达接收状态。

下面我们将会模拟正则表达式`(A*B|AC)D`匹配字符串 AABD 的过程：

1. **初始状态**

从起始状态开始，考察通过 $\epsilon$- 转换能够到达的所有状态，包括状态 0，1，2，3，4 和状态 6：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%200.png"
    width="75%"
    alt="0"
/>
</div>

2. **读入字符 A**

读入文本中的第一个字符 A，能够匹配该字符的状态为状态 2 和状态 6，匹配后可以到达状态 3 和状态 7：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%201-1.png"
    width="75%"
    alt="1-1"
/>
</div>

借由状态 3 和状态 7 通过 $\epsilon$- 转换能够到达的状态有状态 2，3，4 和状态 7：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%201-2.png"
    width="75%"
    alt="1-2"
/>
</div>

3. **读入字符 AA**

读入文本中的第二个字符 A，能够匹配该字符的状态为状态 2，匹配后可以到达状态 3：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%202-1.png"
    width="75%"
    alt="2-1"
/>
</div>

借由状态 3通过 $\epsilon$- 转换能够到达的状态有状态 2，3 和状态 4：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%202-2.png"
    width="75%"
    alt="2-2"
/>
</div>


4. **读入字符 AAB**

读入文本中的第三个字符 B，能够匹配该字符的状态为状态 4，匹配后可以到达状态 5：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%203-1.png"
    width="75%"
    alt="3-1"
/>
</div>

借由状态 5通过 $\epsilon$- 转换能够到达的状态有状态 5，8 和状态 9：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%203-2.png"
    width="75%"
    alt="3-2"
/>
</div>

5. **读入字符 AABD**

读入文本中的第四个字符 D，能够匹配该字符的状态为状态 9，匹配后可以到达状态 10：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%204-1.png"
    width="75%"
    alt="4-1"
/>
</div>

借由状态 10通过 $\epsilon$- 转换能够到达状态 11，即接受状态，匹配成功：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20simulation%204-2.png"
    width="75%"
    alt="4-2"
/>
</div>

### 代码实现

下面的代码实现了 NFA 的匹配：

```Java
public boolean recognizes(String txt) {
    // 考察从起始状态通过epsilon转换可以到达的状态
    Bag<Integer> pc = new Bag<Integer>();
    DirectedDFS dfs = new DirectedDFS(G, 0);
    for (int v = 0; v < G.V(); v++)
        if (dfs.marked(v))
            pc.add(v);

    for (int i = 0; i < txt.length(); i++) {

        // 考察扫描了文本第i个字符后通过匹配转换能够到达的状态
        Bag<Integer> match = new Bag<Integer>();
        for (int v : pc) {
            if (v < M)
                continue;
            if (re[v] == txt.charAt(i) || re[v] == '.')
                match.add(v+1);
        }

        // 考察扫描了文本第i个字符后通过epsilon转换能够到达的状态
        pc = new Bag<Integer>();
        dfs = new DirectedDFS(G, match);
        for (int v = 0; v < G.V(); v++)
            if (dfs.marked(v))
                pc.add(v);
    }
    // 考察在扫描完毕后能否到达接收状态
    for (int v : pc)
        if (v == M)
            return true;
    return false;
}
```

### 性能表现

可以证明，判断一个长为 $M$ 的正则表达式所对应的 NFA 能否匹配一段长为 $N$ 的文本所需的时间在最坏情况下为 $MN$ 级别，因为对于长为 $N$ 的文本中的每个字符，在最坏情况下都有可能需要扫描正则表达式中的每个状态以确定下一状态。

## 依据正则表达式构造 NFA

上一小节中，我们介绍了根据已有的 NFA 模型匹配文本字符串的算法。本小节中，我们需要解决依据正则表达式构造 NFA 的问题。

### 操作与构造

1. **连接操作**

连接操作和 NFA 中的匹配转换是等效的，使用字符数组`re[]`可以表示正则表达式中的状态和所有匹配转换。

2. **括号**

遭遇括号时，需要将左括号的索引压入栈中，然后在遭遇右括号时将左括号弹出，并进行相关操作（下面将会介绍）。

3. **闭包操作**

如果闭包出现在单个字符之后，将该字符和`*`字符之间添加相互指向的两条 $\epsilon$- 转换；

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/single-character%20closure.png"
    width="70%"
    alt="单字符闭包"
/>
</div>

如果闭包出现在右括号之后，将对应的左括号和`*`字符之间添加相互指向的两条 $\epsilon$- 转换。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/closure%20expression.png"
    width="70%"
    alt="闭包表达式"
/>
</div>

4. **或操作**

或运算符`|`必然出现在一对括号之中，在遭遇或运算符时，需要添加两条 $\epsilon$- 转换：一条从左括号指向`|`后的字符，另一条从`|`指向右括号。此外，还需要将`|`的索引压入栈中，这样在到达右括号时可以得到所需的信息。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/or%20expression.png"
    width="70%"
    alt="或操作"
/>
</div>

### NFA 构造实例

下图展示了正则表达式`(A*B|AC)D`对应的 NFA 的构造过程：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/string4/NFA%20construction.png"
    width="90%"
    alt="NFA 的构造"
/>
</div>

### 代码实现

下面是 NFA 类的代码实现，其中字符串匹配的部分在上一节中已有介绍，故从略：

```Java
public class NFA {
    private char[] re;
    private Digraph G;
    private int M;

    public NFA(String regexp) {

        Stack<Integer> ops = new Stack<Integer>();
        re = regexp.toCharArray();
        M = re.length;
        G = new Digraph(M + 1);

        for (int i = 0; i < M; i++) {
            int lp = i;

            // 左括号和或操作的压栈
            if (re[i] == '(' || re[i] == '|')
                ops.push(i);

            // 右括号时的出栈以及或操作的处理
            else if (re[i] == ')') {
                int or = ops.pop();
                if (re[or] == '|') {
                    lp = ops.pop();
                    G.addEdge(lp, or+1);
                    G.addEdge(or, i);
                } else
                lp = or;
            }

            // 闭包处理
            if (i < M-1 && re[i+1] == '*') {
                G.addEdge(lp, i+1);
                G.addEdge(i+1, lp);
            }

            // 元符号的处理
            if (re[i] == '(' || re[i] == '*' || re[i] == ')')
                G.addEdge(i, i+1);
            }
        }
    }

    public boolean recognizes(String txt)
    // 见上一节代码
}
```

### 性能表现

可以证明，构造一个与长度为 $M$ 的正则表达式相对应的 NFA 所需的时间复杂度和空间复杂度均在 $M$ 级别，因为对于长度为 $M$ 的正则表达式中的每个字符，最多会添加 3 条 $\epsilon$- 转换并执行 1 或 2 次栈操作。

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

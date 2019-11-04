---
series: 图论
title: 网络流问题
enable html: true
categories: Algorithms
tags:
  - algorithm
  - graph
  - shortest paths
date: 2018-11-16 16:00:29
---

本篇是图论的最后一篇，我们将讨论在实际场景中应用广泛的图算法——网络流算法。本篇中，我们将介绍 Ford-Fulkerson 算法和最大流-最小切分问题，并给出相应的实现代码。

<!-- more -->

## 模型与定义

首先，我们需要明确几个概念。

### 最小切分 (Mincut) 问题

定义一幅加权有向图，这幅图中包含一个源顶点 $s$ 和一个目的顶点 $t$。图中每条边的权重均为正值，表示边的容量 (capacity)。这样的加权有向图被称作 $st$ - 流量网络。在 $st$ - 流量网络中，我们有如下定义：

1. $st$ - **切分**：一种将加权有向图中所有顶点划分到两个集合中的操作，其中顶点 $s$ 属于其中一个集合 $A$，顶点 $t$ 属于另一个集合 $B$；
2. **切分容量**：从集合 $A$ 到集合 $B$ 的所有边的容量之和；
3. **最小** $st$ - **切分**：在给定 $st$ - 流量网络中找到容量最小的 $st$ - 切分。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/graph5/mincut.png"
    width="70%"
    alt="最小切分问题"
/>
</div>

### 最大流 (Maxflow) 问题

同样在一个 $st$ - 流量网络中，我们给出如下定义：

1. $st$ - **流量**(flow)：一种为流量网络中边的赋值方法，它需要满足边的流量大于 0 小于边的容量，且各顶点的流量需要严格平衡，即除 $s$ 和 $t$ 之外，所有顶点的流入量和流出量严格相等；
2. **网络总流量**：$st$ - 流量网络中顶点 $t$ 的流入量；
3. **最大** $st$ - **流量**：在给定 $st$ - 流量网络中找到使得从 $s$ 到 $t$ 流量最大化的流量配置方案。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/graph5/maxflow.png"
    width="70%"
    alt="最大流问题"
/>
</div>

## Ford-Fulkerson 算法

在后面的证明中我们可以发现，上述的最小切分问题和最大流问题本质上是同一个问题。为了解决这个问题，L. R. Ford 和 D. R. Fulkerson 发明了Ford-Fulkerson 算法。这个算法的大致思路如下：

1. 在给定 $st$ - 流量网络中，初始化网络中各边的流量为 0；
2. 沿着任意的从起点 $s$ 到终点 $t$ 的增广路径增大流量，要求这样的增广路径不含饱和的正向边或空的逆向边；
3. 循环执行第 2 步，直到所有从 $s$ 到 $t$ 的增广路径都被封闭。

上面的描述中，所谓**增广路径** (Augmenting Path) 指的是一条包含未使用容量的正向边和非空逆向边组成的由 $s$ 到 $t$ 的路径集合。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/graph5/augmenting%20path.png"
    width="70%"
    alt="增广路径"
/>
</div>

## 最大流-最小切分定理

在介绍最大流-最小切分定理之前，我们有必要明确几个概念和命题：

- **跨切分净流量**：对于切分 $(A, B)$，其净流量指的是所有从 $A$ 指向 $B$ 的边的流量总和减去所有从 $B$ 指向 $A$ 的边的流量总和；
- **流量值引理**：对于任意 $st$ - 流量网络，每种 $st$ - 切分中跨切分净流量都和总流量的值相等；
- **弱二元性**：$st$ - 流量网络的总流量不可能超过任意 $st$ - 切分的容量。

这样，我们就引出了**最大流-最小切分定理**：令 $f$ 为一个 $st$ - 流量网络，下列三种条件等价：

1. 存在某个 $st$ - 切分，其容量和 $f$ 的总流量相等；
2. $f$ 已经达到最大流量；
3. $f$ 中已经不存在任何增广路径。

## 时间复杂度分析

我们在之前已经给出了 Ford-Fulkerson 算法的大致思路，为了实现该算法，我们还有几个问题需要解决：

1. 如何计算最小切分？
2. 如何找到一条增广路径？
3. 如果一条满正向边的出现使得算法终止，是否能够保证此时的流量是最大流？
4. 是否总是能出现满的正向边使得算法终止？如果是这样的话，需要多少次增广路径计算？

第 1 个问题很容易解决。第 2 个问题可以使用 BFS 解决。第 3 个问题的回答是肯定的，基于最大流-最小切分定理，增广路径的耗尽必然代表着最大流的出现。第 4 个问题中，满正向边总是能够出现，只要边的容量都为整数。我们需要讨论的是增广路径计算的次数，如何设计算法才能够高效地计算增广路径。

在所有容量和边的权重都是整数的情况下，考虑到每次增广路径计算都至少能够至少增加 1 个总流量，因此总有增广路径的条数少于等于最大流量成立。因此，整数权重的流量网络的最大流总是存在的。相对地，如果没有良好设计的算法，可能需要计算恰好最大流量次的增广路径才能得到最大流的确切数量。解决上述问题可以依靠寻找最短路径、最大流量路径等方式。

## 代码实现

### 流量网络的边

首先我们要明确流量网络中边的数据结构。对于一条从顶点 $v$ 指向顶点 $w$ 的有向边，我们需要定义该边的流量 $f$ 和容量 $c$。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/graph5/flow%20and%20capacity.png"
    width="70%"
    alt="容量和流量"
/>
</div>

考虑到我们在算法中需要界定饱和正向边和空逆向边，我们需要定义**剩余容量** (Residual Capacity) 这样一个概念。每条边对应着剩余网络的 2 条边：

- 前向剩余边：剩余容量为 $c - f$；
- 后向剩余边：剩余容量为 $f$。

需要注意的是，在剩余网络中，剩余流量对应的边和流量本身相反，正向边表示剩余的容量，而逆向边表示的是实际的流量。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/graph5/residual%20network.png"
    width="80%"
    alt="剩余网络"
/>
</div>

流量剩余网络边的代码实现：

```Java
public class FlowEdge {
    private final int v;
    private final int w;
    private final double capacity;
    private double flow;

    public FlowEdge(int v, int w, double capacity)  {
        this.v = v;
        this.w = w;  
        this.capacity = capacity;
        this.flow =  0.0;
    }

    public int from()  {
        return v;
    }  

    public int to() {
        return w;
    }  

    public double capacity() {
        return capacity;
    }

    public double flow()  {
        return flow;
    }

    public int other(int vertex)  {
        if(vertex == v)
            return w;
        else if(vertex == w)
            return v;
        else
            throw new IllegalArgumentException("invalid endpoint");
    }

    public double residualCapacityTo(int vertex) {
        if(vertex == v)
            return flow;
        else if(vertex == w)
            return capacity - flow;
        else
            throw new IllegalArgumentException("invalid endpoint");
    }

    public void addResidualFlowTo(int vertex, double delta) {
        if(vertex == v)
            flow -= delta;
        else if(vertex == w)
            flow += delta;
        else
            throw new IllegalArgumentException("invalid endpoint");
    }

}
```

### 流量网络

基于剩余网络，我们可以给出流量网络的数据结构：

```Java
public class FlowNetwork {
    private final int V;
    private int E;
    private Bag<FlowEdge>[] adj;

    public FlowNetwork(int V) {
        this.V = V;
        this.E = 0;
        adj = (Bag<FlowEdge>[]) new Bag[V];
        for (int v =  0; v < V; v++)
            adj[v] = new Bag<FlowEdge>();
    }

    public void addEdge(FlowEdge e) {
        int v = e.from();
        int w = e.to();
        adj[v].add(e);
        adj[w].add(e);
        E++;
    }

    public Iterable<FlowEdge> adj(int v) {
        return adj[v];
    }
}
```

示意图如下：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/graph5/flow%20network.png"
    width="90%"
    alt="Flow Network"
/>
</div>

### 最大流量算法

下面为最短增广路径的最大流量算法：

```Java
public class FordFulkerson {
    private boolean[] marked;
    private FlowEdge[] edgeTo;
    private double value;

    public FordFulkerson(FlowNetwork G, int s, int t) {
        while (hasAugmentingPath(G, s, t)) {
            double bottle = Double.POSITIVE_INFINITY;
            for (int v = t; v != s; v = edgeTo[v].other(v))
                bottle = Math.min(bottle, edgeTo[v].residualCapacityTo(v));

            for (int v = t; v != s; v = edgeTo[v].other(v))
                edgeTo[v].addResidualFlowTo(v, bottle);

            value += bottle;
    }
}

    public double value() {
        return value;
    }

    public boolean inCut(int v) {
        return marked[v];
    }

    private boolean hasAugmentingPath(FlowNetwork G, int s, int t) {
        marked = new boolean[G.V()];
        edgeTo = new FlowEdge[G.V()];

        Queue<Integer> q = new Queue<Integer>();
        marked[s] = true;
        q.enqueue(s);

        while (!q.isEmpty()) {
            int v = q.dequeue();
            for (FlowEdge e : G.adj(v)) {
                int w = e.other(v);
                if (e.residualCapacityTo(w) > 0 && !marked[w]) {
                    edgeTo[w] = e;
                    marked[w] = true;
                    q.enqueue(w);
                }
            }
        }
        return marked[t];
    }
}
```

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

---
series: 图论
title: 最小生成树
enable html: true
categories: Algorithms
tags:
  - algorithm
  - graph
  - minimum spanning trees
date: 2018-11-12 09:51:56
---

本篇我们讨论加权图及其最小生成树问题。加权图指每条边关联一个权值的图模型。加权图的生成树是它的一棵含有其所有顶点的无环连通子图。而**最小生成树** (MST, Minimum Spanning Tree) 指的是加权无向图的一棵权值最小的生成树。

加权无向图模型及其最小生成树算法在各领域都有广泛的应用。而应用现代数据结构改进后的 Prim 算法和 Kruskal 算法能够有效地提升计算最小生成树的效率。

<!-- more -->

## 贪心算法 (Greedy Algorithm)

可以证明，当且仅当一幅含有 $V$ 个结点的图 $G$ 满足以下 5 个条件之一时，它就是一棵树：

- $G$ 有 $V - 1$ 条边且不含有环；
- $G$ 有 $V - 1$ 条边且是全连通的；
- $G$ 是全连通的，但删除任意一条边都会使它不再连通；
- $G$ 是无环图，但添加任意一条边都会产生一个环；
- $G$ 中的任意一对顶点之间仅存在一条简单路径。

基于上述结论，我们给出以下定义：

- **切分** (Cut)：将图的所有顶点分为两个非空且不重叠的两个集合；
- **横切边** (Crossing Edge)：一条连接两个属于不同集合的顶点的边。

这样，我们有以下的**切分定理** (Cut Property)：

- 在一幅加权图中，给定任意的切分，其横切边中的权重最小者必然属于该图的最小生成树。

上述切分定理给出了我们寻找加权图的最小生成树的一个思路，即使用切分定理找到最小生成树的一条边，不断重复该过程直到找到最小生成树的所有边。上述思路即是一种贪心算法。具体地，我们有如下的操作步骤：

1. 在初始情况下将加权无向图中的所有边标记为灰色；
2. 找到一种切分，其产生的所有横切边都不是黑色的，然后将这些横切边中权值最小的标记为黑色；
3. 重复第 2 步，直到有 $V - 1$ 条边被标记为黑色为止。

## 加权无向图 (Edge-weighted Graph)

在讨论具体的最小生成树实现算法前，我们首先需要明确加权无向图的数据结构。我们可以简单扩展无向图的数据结构，但需要重新定义图中的边及其相关操作。

下面的是加权边的具体实现：

```Java
public class Edge implements Comparable<Edge> {
    private final int v;
    private final int w;
    private final double weight;

    public Edge(int v, int w, double weight) {
        this.v = v;
        this.w = w;
        this.weight = weight;
    }

    public double weight() {
        return weight;
    }

    public int either() {
        return v;
    }

    public int other(int vertex) {
        if (vertex == v)
            return w;
        else if (vertex == w)
            return v;
        else
            throw new RuntimeException("Inconsistent edge");
    }

    public int compareTo(Edge that) {
        if (this.weight() < that.weight())
            return -1;
        else if (this.weight() > that.weight())
            return +1;
        else
            return  0;
}
```

基于邻接表的加权无向图的实现如下：

```Java
public class EdgeWeightedGraph {
    private final int V;
    private int E;
    private Bag<Edge>[] adj;

    public EdgeWeightedGraph(int V) {
        this.V = V;
        this.E = 0;
        adj = (Bag<Edge>[]) new Bag[V];
        for (int v = 0; v < V; v++)
            adj[v] = new Bag<Edge>();

    public int V() {
        return V;
    }

    public int E() {
        return E;
    }

    public void addEdge(Edge e) {
        int v = e.either();
        int w = e.other(v);
        adj[v].add(e);
        adj[w].add(e);
        E++;
    }

    public Iterable<Edge> adj(int v) {
        return adj[v];
    }
}
```

## Kruskal 算法

### 算法原理

我们要介绍的第一种计算最小生成树的算法为 Kruskal 算法。该算法思路很简单，即按照边的权重顺序处理它们，重复地将最小的边加入到生成树中，如果要加入的边会使得图中出现环路则丢弃它，直至树中含有 $V - 1$ 条边为止。

Kruskal算法是一种贪心算法，基于树的基本性质 1，该算法可以保证生成的树中含有 $V - 1$ 条边且不含有环路，并且这 $V - 1$ 条边是所有边中能够构成树的权重最小的组合。因此，Kruskal 算法可以保证生成的树是最小生成树。

Kruskal算法的实现需要以下工具：

1. 使用优先级队列将边按照权重排序，并保证能够快速从队列中取出权值最小的边；
2. 使用并查集识别新加入的边是否会构成环路；
3. 使用另一条队列保存最小生成树的所有边。

需要讨论的是，上述 2 中使用 DFS 算法检测顶点 $v$ 到 $w$ 的可达性也可以完成同样的任务，但是时间开销为 $V$ 级别，比使用并查集的 $\log V$ 要大。故在实际应用中我们使用并查集完成任务。

### 算法实现

```Java
public class KruskalMST {
    private Queue<Edge> mst;

    public KruskalMST(EdgeWeightedGraph G) {
        mst = new Queue<Edge>();
        MinPQ<Edge> pq = new MinPQ<Edge>(G.edges());
        UF uf = new UF(G.V());

        while (!pq.isEmpty() && mst.size() < G.V()-1) {
            Edge e = pq.delMin();
            int v = e.either();
            int w = e.other(v);
            if (uf.connected(v, w))
                continue;
            uf.union(v, w);
            mst.enqueue(e);
        }
    }

    public Iterable<Edge> edges() {
        return mst;
    }
}
```

### 算法性能

可以证明，使用 Kruskal 算法计算一幅含有 $V$ 个顶点和 $E$ 条边的加权无向图的最小生成树的空间复杂度在 $E$ 级别，时间复杂度在 $E \log E$ 级别。

## Prim 算法

在 Kruskal 算法中，优先级队列保存的边中存在许多无效边，这降低了算法的性能。Prim 算法有效地解决了这个问题。起初树只有一个顶点，随后重复地将下一条连接树中顶点和不在树中顶点且权值最小的横切边加入树中，直到树中含有 $V - 1$ 条边为止。

### Prim 算法的惰性实现

Prim 算法的核心问题在于，如何寻找最小权重的横切边呢？对于这个问题，有两种解决方案，分别为惰性实现和积极实现。在惰性实现方案中，加入优先级队列中的新边并不立刻检查其合法性，直到它将被拿出使用时才对其进行合法性检测。

维护一条**边**的优先级队列，并按照以下方法操作：

1. 取出优先级队列中权重最小的横切边，假设该边连接了 $v$ 和 $w$ 两个顶点；
2. 如果 $v$ 和 $w$ 都已经在树中，就丢弃这条边；
3. 否则，不妨设 $w$ 为不在树中的那个顶点，然后将所有和 $w$ 相连的边加入优先级队列，并将该横切边加入树中，标记 $w$ 为已访问顶点。

这样，惰性实现的代码如下：

```Java
public class LazyPrimMST {
    private boolean[] marked;                      // 最小生成树的顶点
    private Queue<Edge> mst;                       // 最小生成树的边
    private MinPQ<Edge> pq;                        // 横切边

    public LazyPrimMST(EdgeWeightedGraph G) {
        this.pq = new MinPQ<Edge>();
        this.marked = new boolean[G.V()];
        this.mst = new Queue<Edge>();
        this.visit(G, 0);
        while (!pq.isEmpty()) {
            Edge e = pq.delMin();
            int v = e.either();
            int w = e.other(v);

            if (this.marked[v] && this.marked[w])  // 跳过失效的边
                continue;
            this.mst.enqueue(e);

            if (!this.marked[v])
                this.visit(G, v);
            if (!marked[w])
                this.visit(G, w);
        }
    }

    private void visit(EdgeWeightedGraph G, int v) {
        this.marked[v] = true;
        for (Edge e : G.adj(v))
            if (!this.marked[e.other(v)])
                this.pq.insert(e);
    }

    public Iterable<Edge> edges() {
        return this.mst;
    }
}
```

### Prim 算法的积极实现

前面已经提到，惰性算法并不对新加入优先级队列中的边做合法性检查。在积极实现中，我们可以尝试从优先级队列中删除无效的边。这样，优先级队列中就只含有树顶点和非树顶点间的横切边。

维护一条和树相连的**顶点**的优先级队列，其中各顶点的权重定义为 $v$ 到树最短边的权重。按照如下步骤操作：

1. 删除队列中权重最小的节点 $v$，并将与其相关的边加入树中；
2. 对于和 $v$ 相连的所有边，设某一条边的两端分别为 $v$ 和 $x$。若 $x$ 已经在树中，则忽略这条边；若 $x$ 不再树中，就将 $x$ 加入优先级队列中。如果连接 $x$ 和 $v$ 的边是 $x$ 到树之间最短的边，就降低 $x$ 的优先级。

```Java
public class PrimMST {
    private Edge[] edgeTo;          // 距离树最近的边
    private double[] distTo;        // distTo[w] = edgeTo[w].weight()
    private boolean[] marked;       // 若v在树中则为true
    private IndexMinPQ<Double> pq;  // 有效的横切边

    public PrimMST(EdgeWeightedGraph G) {
        edgeTo = new Edge[G.V()];
        distTo = new double[G.V()];
        marked = new boolean[G.V()];

        for (int v = 0; v < G.V(); v++)
            distTo[v] = Double.POSITIVE_INFINITY;
        pq = new IndexMinPQ<Double>(G.V());

        distTo[0] = 0.0;
        pq.insert(0, 0.0);
        while (!pq.isEmpty())
            visit(G, pq.delMin());  // 将最近的顶点添加到树中
    }

    private void visit(EdgeWeightedGraph G, int v) {
        marked[v] = true;
        for (Edge e : G.adj(v)) {
            int w = e.other(v);
            if (marked[w])          // v-w失效
                continue;
            if (e.weight() < distTo[w]) {
                edgeTo[w] = e;
                distTo[w] = e.weight();

                if (pq.contains(w))
                    pq.change(w, distTo[w]);
                else
                    pq.insert(w, distTo[w]);
            }
        }
    }
}
```

### Prim 算法的性能

可以证明，Prim 算法的惰性实现计算一幅含有 $V$ 个顶点和 $E$ 条边的连通加权无向图的最小生成树所需的空间复杂度在 $E$ 级别，时间复杂度在 $E \log E$ 级别。而积极实现的空间复杂度在 $V$ 级别，时间复杂度在 $E \log V$ 级别。

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

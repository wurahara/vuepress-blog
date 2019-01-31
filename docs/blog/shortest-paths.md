---
title: 算法与数据结构学习笔记——加权图的最短路径
enable html: true
categories: Algorithms
tags:
  - algorithm
  - graph
  - shortest paths
date: 2018-11-14 19:19:31
---

我们在之前已经讨论过无向图和有向图中最短路径的计算方法。但是更多的现实场景可以被抽象成加权图，比如地图导航或者网络路由规划。在本篇中，我们将讨论加权有向图下计算最短路径的算法。

<!-- more -->

## 加权有向图的数据结构

对于加权有向图的最短路径问题，具体地，我们实际上需要计算的是**单点最短路径**问题，即给定一幅加权有向图$G$和起点$s$，求从$s$到图中任意一点$v$的最短路径。鉴于需要求出所有顶点到源$s$的最短路径，我们实际上需要得到的是一棵**最短路径树** (SPT, Shortest Path Tree) ，这棵树是一棵根节点为$s$的有向树，树的每条路径都是有向图中的一条最短路径。

### 加权有向边

对于加权有向图中的边，其实现比加权无向图中的边更加简单，因为有向边固定了方向，也就固定了源点和宿点。

```Java
public class DirectedEdge {
    private final int v;                          // 边的起点
    private final int w;                          // 边的终点
    private final double weight;                  // 边的权重

    public DirectedEdge(int v, int w, double weight) {
        this.v = v;
        this.w = w;
        this.weight = weight;
    }

    public double weight() {
        return weight;
    }

    public int from() {
        return v;
    }

    public int to() {
        return w;
    }
}
```

### 加权有向图

在`Digraph`类中，我们在背包中用整型数表示边相连的顶点，而在`EdgeWeightedDigraph`类中，我们将边用上述`DirectedEdge`对象替换存入背包中：

```Java
public class EdgeWeightedDigraph {
    private final int V;
    private int E;
    private Bag<DirectedEdge>[] adj;

    public EdgeWeightedDigraph(int V) {
        this.V = V;
        this.E = 0;
        adj = (Bag<DirectedEdge>[]) new Bag[V];
        for (int v = 0; v < V; v++)
            adj[v] = new Bag<DirectedEdge>();
    }

    public void addEdge(DirectedEdge e) {
        adj[e.from()].add(e);
        E++;
    }

    public Iterable<Edge> adj(int v) {
        return adj[v];
    }

    public Iterable<DirectedEdge> edges() {
        Bag<DirectedEdge> bag = new Bag<DirectedEdge>();
        for (int v = 0; v < V; v++)
            for (DirectedEdge e : adj[v])
                bag.add(e);
        return bag;
    }
}
```

加权有向图的图示如下：

![加权有向图的表示](http://images.herculas.cn/image/blog/algorithms/graph4/edge-weighted%20digraph.png)

### 最短路径类

对于最短路径的 API，我们需要暴露到原点距离的接口`distTo()`和路径接口`pathTo()`，为了实现路径接口，我们需要在内部实现上一跳顶点接口`edgeTo()`。

```Java
public class SP {
    public SP(EdgeWeightedDigraph G, int s)
    public double distTo(int v)
    public boolean hasPathTo(int v)
    public Iterable<DirectedEdge> pathTo(int v)
    private DirectedEdge edgeTo(int v)
}
```

实现上述最短路径类时，可以使用一个由顶点索引的`DirectedEdge`对象的上一跳数组`edgeTo[]`，其中`edgeTo[v]`的值为树中连接$v$和它父结点的边，即从$s$到$v$的最短路径上的最后一条边。约定`edgeTo[s]`值为`null`。此外，还需要使用一个由顶点索引的整型数组`distTo[]`，其中`distTo[v]`表示从$s$到$v$的已知最短路径长度。约定`distTo[s]`值为0。

![最短路径类的数据结构](http://images.herculas.cn/image/blog/algorithms/graph4/Shortest-Paths%20data%20structures.png)

上述两个接口的实现如下：

```Java
public double distTo(int v) {
    return distTo[v];
}

public Iterable<DirectedEdge> pathTo(int v) {
    Stack<DirectedEdge> path = new Stack<DirectedEdge>();
    for (DirectedEdge e = edgeTo[v]; e != null; e = edgeTo[e.from()])
        path.push(e);
    return path;
}
```

## 理论基础

### 边的松弛 (Edge Relaxation)

我们在之后介绍的所有 SP 实现算法都基于名为**松弛** (Relaxation) 的原子操作。首先我们介绍边的松弛。**放松**顶点$v$到$w$的边指检查从$s$到$w$的最短路径是否是经过$v$到$w$的，它分为两种情况：

- 边松弛：如果从$v$到$w$的边能够提供更短的到达$w$的路径，则更新`edgeTo[w]`为$v$指向$w$的边，并相应地更新`distTo[w]`；
- 边失效：如果从$v$到$w$的边未能改变到达$w$的最短路径，则什么都不做。

![边失效和边松弛](http://images.herculas.cn/image/blog/algorithms/graph4/edge%20relaxation.png)

边松弛的代码实现如下：

```Java
private void relax(DirectedEdge e) {
    int v = e.from();
    int w = e.to();

    if (distTo[w] > distTo[v] + e.weight()) {
        distTo[w] = distTo[v] + e.weight();
        edgeTo[w] = e;
    }
}
```

### 顶点的松弛 (Vertex Relaxation)

顶点的松弛指放松一个给定顶点所指出的所有有向边。

![顶点的松弛](http://images.herculas.cn/image/blog/algorithms/graph4/vertex%20relaxation.png)

我们可以重载上面的`relax()`方法来实现顶点的松弛：

```Java
private void relax(EdgeWeightedDigraph G, int v) {
    for (DirectedEdge e : G.adj(v)) {
        int w = e.to();
        if (distTo[w] > distTo[v] + e.weight()) {
            distTo[w] = distTo[v] + e.weight();
            edgeTo[w] = e;
        }
    }
}
```

### 最优性条件 (Optimality Conditions)

基于边的松弛和顶点的松弛，下面的命题证明了判断路径是否为最短路径的全局条件和放松一条边时检测的局部条件是等价的。

令$G$为一幅加权有向图，顶点$s$为$G$中指定的一个起点，则`distTo[v]`为$s$到$G$中任意顶点$v$的最短路径当且仅当：

- `distTo[s] = 0`；
- 对于任意的顶点$v$，`distTo[v]`为$s$通过$G$中某条合法路径到达$v$的路径长度。对于无法到达的顶点，其`distTo[]`值为无穷大；
- 对于图$G$中从$v$指向$w$的任意有向边$e$，均有`distTo[w] <= distTo[v] + e.weight()`成立。

最优性条件为验证最短路径提供了一种简单的方法。基于上述命题，只需要遍历图中所有的边一遍，并检查最优性条件是否恒成立，即可验证所求路径是否为最短路径。

### 泛用算法 (Generic Algorithm)

我们现在已经有了松弛算法和最优性条件，这样我们可以得到一个涵盖所有前面叙述过的最短路径算法的泛用算法：对于非负权重的加权有向图$G$，将`distTo[s]`初始化为0，其他顶点的`distTo[]`值设置为无穷大，重复放松$G$中的任意边，直到不存在可以继续放松的边，即所有边都失效为止。

## Dijkstra 算法

### Dijkstra 算法的基本原理

在上一篇，我们介绍了计算加权无向图的最小生成树的 Prim 算法，该算法通过优先级队列向最小生成树中顺次添加新边。我们下面要介绍的 Dijkstra 算法的基本思路与此类似：

- 将`distTo[s]`初始化为0，将其他顶点的`distTo[]`值都初始化为正无穷大；
- 将`distTo[]`最小的非树顶点放松并加入树中，直至所有顶点都在树中，或者所有的非树顶点的`distTo[]`的值都为无穷大。

### Dijkstra 算法轨迹

为了更直观地理解 Dijkstra 算法的原理，我将以一个实例说明 Dijkstra 算法的操作轨迹。首先，下图是一幅加权有向图，边上的数字表示的是边的权重，顶点 0 为起点。

![轨迹 1](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%201.png)

将顶点 0 添加到树中，0 指出的 3 条边分别指向顶点 1，4 和 7。将这三个顶点加入优先级队列，更新这三个顶点的`distTo[]`和`edgeTo[]`。

![轨迹 2](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%202.png)

队列中目前顶点 1 的`distTo[]`值最小，从队列中删除顶点 1，将 `0 -> 1`添加到树中，将 1 指出的2 和 3 加入队列。考虑到`0 -> 1 -> 7`的权重大于原先的`0 -> 7`的权重，故只更新顶点 2 和 3 的`distTo[]`和`edgeTo[]`。

![轨迹 3](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%203.png)

下一个`distTo[]`最小的顶点是 7，将其从队列中删除，并将`0 -> 7`添加到树中。将 7 指出的 5 加入队列。更新 2 和 5 的`distTo[]`和`edgeTo[]`。

![轨迹 4](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%204.png)

下一个`distTo[]`最小的顶点是 4，将其从队列中删除，并将`0 -> 4`添加到树中。将 4 指出的 6 加入队列。更新 5 和 6 的`distTo[]`和`edgeTo[]`。

![轨迹 5](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%209.png)

下一个`distTo[]`最小的顶点是 5，将其从队列中删除，并将`4 -> 5`添加到树中。更新 2 和 6 的`distTo[]`和`edgeTo[]`。

![轨迹 6](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%205.png)

下一个`distTo[]`最小的顶点是 2，将其从队列中删除，并将`5 -> 2`添加到树中。更新 3 和 6 的`distTo[]`和`edgeTo[]`。

![轨迹 7](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%206.png)

下一个`distTo[]`最小的顶点是 3，将其从队列中删除，并将`2 -> 3`添加到树中。

![轨迹 8](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%207.png)

最后一个顶点是 6，将其从队列中删除，并将`2 -> 6`添加到树中。

![轨迹 9](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%208.png)

这样，根据`edgeTo[]`，我们就可以得到 Dijkstra 算法计算的最短路径树：

![轨迹 10](http://images.herculas.cn/image/blog/algorithms/graph4/D%20trace%2010.png)

### 数据结构

我们使用一条索引优先级队列`pq`保存需要被放松的顶点，并确认下一个被放松的顶点。考虑到`IndexMinPQ`可以将索引和键（即优先级）关联且可以删除并返回优先级最低的索引。因此，我们可以将顶点`v`和`distTo[v]`相关联以实现 Dijkstra 算法。

```Java
public class DijkstraSP {
    private DirectedEdge[] edgeTo;
    private double[] distTo;
    private IndexMinPQ<Double> pq;

    public DijkstraSP(EdgeWeightedDigraph G, int s) {
        edgeTo = new DirectedEdge[G.V()];
        distTo = new double[G.V()];
        pq = new IndexMinPQ<Double>(G.V());

        for (int v = 0; v < G.V(); v++)
            distTo[v] = Double.POSITIVE_INFINITY;
        distTo[s] = 0.0;

        pq.insert(s, 0.0);
        while (!pq.isEmpty())
            relax(G, pq.delMin())                        // 按照距离s的顺序放松各顶点
    }

    private void relax(EdgeWeightedDigraph G, int v) {
        for(DirectedEdge e : G.adj(v)) {
            int w = e.to();
            if (distTo[w] > distTo[v] + e.weight()) {
                distTo[w] = distTo[v] + e.weight();
                edgeTo[w] = e;

                if (pq.contains(w))                      // 更新优先级队列pq
                    pq.change(w, distTo[w]);
                else
                    pq.insert(w, distTo[w]);
            }
        }
    }
}
```

### Dijkstra 算法的性能

在一幅含有$V$个顶点和$E$条边的加权有向图中，使用 Dijkstra 算法计算根结点为给定顶点的最短路径树的空间复杂度在$V$级别，时间复杂度在$E \log V$级别。

## 无环加权有向图

### 基本原理

Dijkstra 算法是一种在加权有向图中寻找最短路径树的算法。如果一幅加权有向图中不含有向环，我们会有更快速的算法寻找其最短路径树。该算法的核心思想是按照**拓扑顺序**放松顶点。该算法的步骤和 Dijkstra 算法及其类似：

- 将`distTo[s]`初始化为0，将其他顶点的`distTo[]`值都初始化为正无穷大；
- 按照拓扑顺序放松顶点并将其加入树中，直至所有顶点都在树中，或者所有的非树顶点的`distTo[]`的值都为无穷大。

### 数据结构

```Java
public class AcyclicSP {
    private DirectedEdge[] edgeTo;
    private double[] distTo;

    public AcyclicSP(EdgeWeightedDigraph G, int s) {
        edgeTo = new DirectedEdge[G.V()];
        distTo = new double[G.V()];

        for (int v = 0; v < G.V(); v++)
            distTo[v] = Double.POSITIVE_INFINITY;
        distTo[s] = 0.0;

        Topological top = new Topological(G);

        for (int v : top.order())
            relax(G, v);
    }
}
```

### 最长路径与并行任务调度

对于无环加权有向图中的最长路径问题，可以将所有边的权重取相反数，随后找到这样一幅图的最短路径，再将最终的结果变为正值即可。

最长路径问题的一个实际应用是并行任务调度问题 (Parallel Job Scheduling)。给定一组需要完成的任务和每个任务所需的时间，以及一组关于任务完成的先后次序的优先级限制。在满足限制条件的前提下应该如何安排任务以在最短的时间内完成所有的任务？

![并行任务调度](http://images.herculas.cn/image/blog/algorithms/graph4/parallel%20job%20scheduling.png)

对于多线程的任务调度问题，我们使用一种名为**关键路径**(Critical Path)的方法。该方法证明，并行任务调度问题和无环加权有向图的最长路径问题等价。假设我们可以安排任意多个线程完成任务，那么我们任务的核心就是指定一条关键路径，即由优先级限制指定的调度方案的时间下限。

为了解决并行任务调度问题，我们需要创建一幅无环加权有向图$G$，其中包括：

- 起点$s$和终点$t$；
- 每个任务所代表的两个顶点，即其起始顶点和终止顶点；
- 每个任务对应的 3 条边，分别是从起点$s$到该任务的起始顶点的边（权重为 0），从起始顶点到终止顶点的边（权重为任务时间）和从终止顶点到终点$t$的边（权重为 0）；
- 优先级限制代表的边，由上一个任务的终止顶点指向下一个任务的起始顶点（权重为 0）。

![任务调度问题的无环加权有向图表示](http://images.herculas.cn/image/blog/algorithms/graph4/Edge-weighted%20DAG%20representation%20of%20job%20scheduling.png)

如果将一系列任务的长度定义为完成所有任务的最早可能时间，那么最长的任务序列就是问题的关键路径，我们需要求的就是关键路径的长度。

```Java
public class CPM {
    public static void main(String[] args) {
        int N = StdIn.readInt();
        StdIn.readLine();
        EdgeWeightedDigraph G;
        G = new EdgeWeightedDigraph(2*N+2);

        int s = 2*N, t = 2*N+1;
        for (int i = 0; i < N; i++) {
            String[] a = StdIn.readLine().split("\\s+");
            double duration = Double.parseDouble(a[0]);
            G.addEdge(new DirectedEdge(i, i+N, duration));
            G.addEdge(new DirectedEdge(s, i, 0.0));
            G.addEdge(new DirectedEdge(i+N, t, 0.0));

            for (int j = 1; j < a.length; j++) {
                int successor = Integer.parseInt(a[j]);
                G.addEdge(new DirectedEdge(i+N, successor, 0.0));
            }
        }
        AcyclicLP lp = new AcyclicLP(G, s);
        StdOut.println("Start times:");

        for (int i = 0; i < N; i++)
            StdOut.printf("%4d: %5.1f\n", i, lp.distTo(i));
        StdOut.printf("Finish time: %5.1f\n", lp.distTo(t));
    }
}
```

## Bellman-Ford 算法

### 负权重问题

当加权有向图中存在负权重边时，我们之间介绍的 Dijkstra 算法就失去了作用。因为存在负权重边时， 我们需要为了经过负权重边而绕弯，但 Dijkstra 算法可能会直接选择边较少的路径，如下图所示。

![负权重问题](http://images.herculas.cn/image/blog/algorithms/graph4/negative%20weights.png)

### 负权重环 (Negative Cycle)

在研究负权重边的最短路径问题之前，我们需要首先确定问题可以解决的下限。对于负权重环，即权重之和为负值的有向环，最短路径是不可求的。因为我们只要在负权重环上兜圈子，就可以得到任意小权重的路径。因此，我们有以下的严格命题：

- 当且仅当加权有向图中至少存在一条从$s$到$v$的有向路径且所有从$s$到$v$的有向路径上的任意顶点都不存在于任何负权重环中时，$s$到$v$的最短路径才是存在的。

### Bellman-Ford 算法

R. Bellman 和 L. Ford 发明了一种能够解决存在负权重边条件下的最短路径求解方法，对于任意含有$V$个顶点的加权有向图：

- 将`distTo[s]`初始化为0，将其他顶点的`distTo[]`值都初始化为正无穷大；
- 以任意顺序放松有向图的所有边，重复此操作$V$轮。

Bellman-Ford 算法的实现非常简单，因为它并不指定边放松的顺序：

```Java
for (int i = 0; i < G.V(); i++)
    for (int v = 0; v < G.V(); v++)
        for (DirectedEdge e : G.adj(v))
            relax(e);
```

可以证明，Bellman-Ford 算法的时间复杂度是$EV$级别，空间复杂度为$V$级别。

### 基于队列的 Bellman-Ford 算法

可以发现，任意一轮中许多边并不会被放松，只有上一轮中`distTo[]`的值发生变化的顶点指出的边才能够改变其他`distTo[]`的值。为了记录这样的顶点，我们需要利用以下两个数据结构：

1. 一条用来保存即将被放松的顶点的队列`queue`；
2. 一条由顶点索引的`boolean`数组`onQ[]`，用于指示顶点是否已经存在于队列中，以防止将顶点重复插入队列。

```Java
public class BellmanFordSP {
    private double[] distTo;
    private DirectedEdge[] edgeTo;
    private boolean[] onQ;
    private Queue<Integer> queue;
    private int cost;                                      // 放松的轮数
    private Iterable<DirectedEdge> cycle;

    public BellmanFordSP(EdgeWeightedDigraph G, int s) {
        distTo = new double[G.V()];
        edgeTo = new DirectedEdge[G.V()];
        onQ = new boolean[G.V()];
        queue = new Queue<Integer>();

        for (int v = 0; v < G.V(); v++)
            distTo[v] = Double.POSITIVE_INFINITY;
        distTo[s] = 0.0;
        queue.enqueue(s);
        onQ[s] = true;

        while (!queue.isEmpty() && !this.hasNegativeCycle()) {
            int v = queue.dequeue();
            onQ[v] = false;
            relax(v);
        }
    }

    private void relax(EdgeWeightedDigraph G, int v) {
        for (DirectedEdge e : G.adj(v) {
            int w = e.to();
            if (distTo[w] > distTo[v] + e.weight()) {
                distTo[w] = distTo[v] + e.weight();
                edgeTo[w] = e;
                if (!onQ[w]) {
                    q.enqueue(w);
                    onQ[w] = true;
                }
            }
            if (cost++ % G.V() == 0)
                findNegativeCycle();
        }
    }

    private void findNegativeCycle() {
        int V = edgeTo.length;
        EdgeWeightedDigraph spt = new EdgeWeightedDigraph(V);
        for (int v = 0; v < V; v++)
            if (edgeTo[v] != null)
                spt.addEdge(edgeTo[v]);
        EdgeWeightedCycleFinder cf = new EdgeWeightedCycleFinder(spt);
        cycle = cf.cycle();
    }

    public boolean hasNegativeCycle() {
        return cycle != null;
    }

    public Iterable<Edge> negativeCycle() {
        return cycle;
    }
}
```

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

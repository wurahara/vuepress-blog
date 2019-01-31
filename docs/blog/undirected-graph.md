---
title: 算法与数据结构学习笔记——无向图
enable html: true
categories: Algorithms
tags:
  - algorithm
  - graph
  - undirected graph
date: 2018-11-07 10:38:49
---

在本篇和接下来的几篇中，我们将介绍另一个在算法和数据结构领域十分重要的数学对象——图。图论是研究二维乃至多维拓扑学的重要理论工具，同时对计算机科学的发展产生了重要的影响。

本篇中，我们将介绍**无向图**这一最基本的图，以及和无向图相关的 DFS 和 BFS 算法。在接下来的几篇中，我们还将介绍**有向图**，**最小生成树**和**最短路径问题**的相关数学理论和算法细节实现。

<!-- more -->

## 无向图 (Undirected Graph)

无向图是最简单的图模型，在无向图中，边 (edge) 表示两个顶点 (vertex) 之间的连接。

### 术语表

1. 顶点与图

- **相邻**：当两个顶点通过一条边相连时，我们称这两个顶点是相邻的，并称这条边依附于这两个顶点。
- **顶点的度**：某个顶点的度指依附于它的边的总数。
- **子图**：由一幅图的所有边的一个子集以及它们所依附的所有顶点组成的图。

2. 路径与环

- **路径**：由边顺序连接的一系列顶点。
- **路径的长度**：路径中所含的边数。
- **简单路径**： 一条没有重复顶点的路径。
- **环**：一条至少含有一条边且起点和终点相同的路径。
- **简单环**：一条除了起点和终点外不含重复顶点和边的环。
- **无环图**：不包含环路的图。

3. 图的连通性

- **连通图**：如果从任意一个顶点都存在一条路径到达另一个任意顶点，则称这幅图是连通图。
- **极大连通子图**：非连通图由若干连通的部分组成，各称该图的极大连通子图。

4. 图与树

- **树**：一幅无环连通图。
- **森林**：互不相邻的树组成的集合。
- **生成树**：连通图的一幅子图，它含有连通图中所有的顶点，且是一棵树。
- **生成树森林**：它的所有连通子图的生成树的集合。

5. 图的密度

- **图的密度**：已经连接的顶点对占所有可能被连接的顶点对的比例。
- **稀疏图**：被连接的顶点很少的图，稀疏图密度很低。
- **稠密图**：只有少部分顶点对之间没有边链接，稠密图密度较高。
- **二分图**：一种能够将所有结点分为两个部分的图，其中图的每条边所连接的两个顶点都分别属于不同的部分。

### 常见图问题

图论主要着力于一些数学和拓扑学问题，包括但不限于：

1. **路径问题**：顶点$s$和$t$之间是否有一条路径？
2. **最短路径问题**：顶点$s$和$t$之间的最短路径是哪条？
3. **环路问题**：图中是否存在环路？
4. **欧拉路径 (Euler Tour)**：图中是否存在这样一个环，该环中每条边被正好使用一次？
5. **哈密尔顿路径 (Hamiton Tour)**：图中是否存在这样一个环，该环中每个顶点被正好使用一次？
6. **连通性**：是否有一条路径可以连接图中的所有顶点？
7. **最小生成树**：连接图中所有顶点的最好路径是哪条？
8. **双连通性**：连通图中是否存在这样的一个顶点，移除该顶点后该图不再连通？
9. **平面性**：可否在没有交叉边的情况下在平面上画出该图？
10. **图的同构**：两张邻接表表示的是否是同一张图？
11. **双色问题**：能够用两种颜色将图的所有顶点着色，使得任意一条边的两个端点的颜色都不相同吗？

### 无向图的 API

下面是有向图所需要实现的 API：

```Java
public class Graph {
    public Graph(int V)                  // 创建一个含有V个顶点但不含有边的图
    public Graph(In in)                  // 从标准输入流in读入一幅图
    public void addEdge(int v, int w)    // 向图中添加一条边v-w
    public Iterable<Integer> adj(int v)  // 遍历和v相邻的所有顶点
    public int V()                       // 顶点数
    public int E()                       // 边数
    public String toString()             // 对象的字符串表示
}
```

### 常用的图处理代码

除了上述常用 API 外，还有一些应用需要提供以下的接口以计算一些无向图常用的属性：

```Java
// 计算顶点的度
public static int degree(Graph G, int v) {
    int degree = 0;
    for (int w : G.adj(v))
        degree++;
    return degree;
}

// 计算最大度
public static int maxDegree(Graph G) {
    int max = 0;
    for (int v = 0; v < G.V(); v++)
        if (degree(G, v) > max)
            max = degree(G, v);
    return max;
}

// 计算平均度
public static double averageDegree(Graph G) {
    return 2.0 * G.E() / G.V();
}

// 计算自环数量
public static int numberOfSelfLoops(Graph G) {
    int count = 0;
    for (int v = 0; v < G.V(); v++)
        for (int w : G.adj(v))
            if (v == w) count++;
    return count / 2;
}
```

### 图的表示法

在处理图论问题之前，我们首先要选取合适的图的表示方式来实现上述的 API，主要要实现以下两个需求：

1. 必须为可能在应用中遭遇的各种类型的图预留足够的空间；
2. 必须保证实现足够快速。

常见的图的表示方法有以下三种：

1. **邻接矩阵**：使用一个$V \times V$的布尔型矩阵，当顶点$v$和$w$之间有相连的边时，定义$v$行$w$列的元素为`true`，否则为`false`。该方法不满足以上的第 1 个需求，因为在较大的顶点数情况下，$V^2$的空间复杂度难以承受。
2. **边的数组**：使用一个`Edge`类来间接实现图的表示。该类中有 2 个`int`型实例变量，表示边所连接的两个顶点。该方法不满足上述的第 2 个需求，因为要实现`adj()`方法需要遍历图中的所有边。
3. **邻接表数组**：使用一个以顶点为索引的列表数组，数组中每个元素都是和该顶点相邻的顶点列表。该方法能够同时满足上述的 2 个条件。

![邻接表](http://images.herculas.cn/image/blog/algorithms/graph1/adjacency%20list.png)

### 邻接表的数据结构

邻接表将每个顶点的所有相邻顶点都保存在该顶点对应的元素所指向的一张链表中。使用数组的目的是快速访问指定顶点的邻接顶点列表。方便起见，可以使用背包数据结构来实现链表，这样就可以在常数时间内添加新的边或遍历任意顶点的所有相邻顶点。

需要注意，在上述的实现方法中，想要添加一条$v$到$w$的边，就必须将$w$添加到$v$的邻接表中，同时还要把$v$添加到$w$的邻接表中。因此，在该数据结构中，所有边都会出现两次。

```Java
public class Graph {
    private final int V;          // 顶点数
    private int E;                // 边数
    private Bag<Integer>[] adj;   // 邻接表

    public Graph(int V) {
        this.V = V;
        this.E = 0;
        this.adj = (Bag<Integer>[]) new Bag[V];
        for (int v = 0; v < V; v++)
            this.adj[v] = new Bag<Integer>();
    }

    public void addEdge(int v, int w) {
        this.adj[v].add(w);
        this.adj[w].add(v);
        this.E++;
    }

    public Iterable<Integer> adj(int v) {
        return this.adj[v];
    }
}
```

上述实现有如下的性能参数：

- 使用的空间为$V+E$数量级；
- 添加一条新边的时间复杂度为常数级；
- 遍历顶点$v$的所有相邻顶点所需的时间和$v$的度成正比。

这样，我们可以得到以下关于三种不同图实现的性能对比：

|数据结构|所需空间|添加新边|检查顶点是否相邻|遍历顶点的相邻顶点|
|:----:|:-----:|:-----:|:-----------:|:-------------:|
|边的列表|$E$|$1$|$E$|$E$|
|邻接矩阵|$V^2$|$1$|$1$|$V$|
|邻接表|$E+V$|$1$|$degree(V)$|$degree(V)$|

## 深度优先搜索 (DFS, Depth-first Search)

深度优先搜索 (DFS) 是搜索连通图的经典递归算法。要搜索一幅图，只需要用一个递归的方法遍历所有的顶点。在访问其中的一个顶点时：

1. 将其标记为已访问；
2. 递归地访问该顶点尚未被标记过的相邻顶点。

![深度优先搜索](http://images.herculas.cn/image/blog/algorithms/graph1/dfs.png)

### DFS 的实现

DFS 的实现代码如下：

```Java
public class DepthFirstPaths {
    private boolean[] marked;
    private int[] edgeTo;
    private final int s;

    public DepthFirstPaths(Graph G, int s) {
        marked = new boolean[G.V()];
        edgeTo = new int[G.V()];
        this.s = s; dfs(G, s);
    }

    private void dfs(Graph G, int v) {
        marked[v] = true;
        for (int w : G.adj(v))
            if (!marked[w]) {
                edgeTo[w] = v;
                dfs(G, w);
            }
    }

    public boolean hasPathTo(int v) {
        return marked[v];
    }

    public Iterable<Integer> pathTo(int v) {
        if (!hasPathTo(v))
            return null;
        Stack<Integer> path = new Stack<Integer>();
        for (int x = v; x != s; x = edgeTo[x])
            path.push(x);
        path.push(s);
        return path;
    }
}
```

### DFS 的性质

可以证明如下结论：

1. 深度优先搜索可以标记和图中顶点$s$相连通的所有顶点，且所需的时间和顶点的度数之和成正比。
2. 在经过深度优先搜索之后的图中，确定某个顶点是否和$s$相连通仅需常数级的时间复杂度；寻找一条从该顶点到$s$的路径所需的时间和该路径的长度成正比。

这样，我们可以证明深度优先搜索算法可以解决我们在**常见图问题**中提到的以下两个问题：

- **路径问题**：顶点$s$和$t$之间是否有一条路径？
- **连通性**：是否有一条路径可以连接图中的所有顶点？

## 广度优先搜索 (BFS, Breadth-first Search)

深度优先搜索只能解决路径的存在性问题，并不能解决路径的最优解问题，即两顶点间的最短路径问题。为了解决该问题，我们需要引入新的算法：广度优先搜索 (BFS)。BFS 使用一个队列来存储所有已经被标记过但邻接表尚未被检查过的顶点。先将起点加入队列，然后重复下述步骤直到队列为空：

1. 取队列中的下一个节点$v$并标记；
2. 将与$v$相邻的所有未标记过的顶点加入队列。

![BFS](http://images.herculas.cn/image/blog/algorithms/graph1/bfs.png)

和深度优先搜索相比，广度优先搜索显式地使用队列保存未访问过的顶点，而深度优先搜索使用递归调用，这相当于隐式地使用栈保存未访问过的顶点。

### BFS 的实现

BFS 的实现代码如下：

```Java
public class BreadthFirstPaths {
    private boolean[] marked;
    private int[] edgeTo;
    private final int s;

    private BreadthFirstPaths(Graph G, int s) {
        this.marked = new boolean[G.V()];
        this.edgeTo = new int[G.V()];
        this.s = s;
        this.bfs(G, s);
    }

    private void bfs(Graph G, int s) {
        Queue<Integer> queue = new Queue<Integer>();
        this.marked[s] = true;
        queue.enqueue(s);

        while (!queue.isEmpty()) {
            int v = queue.dequeue();
            for (int w : G.adj(v)) {
                if (!this.marked[w]) {
                    queue.enqueue(w);
                    this.marked[w] = true;
                    this.edgeTo[w] = v;
                }
            }
        }
    }

    public boolean hasPathTo(int v) {
        return marked[v];
    }
}
```

### BFS 的性质

可以证明，对于图中任意的两个顶点$s$和$v$，倘若$s$和$v$之间存在路径，那么BFS必然能够找到这样两个顶点之间的最短路径。且所需的时间在最坏情况下和$V+E$成正比。

这样，我们可以证明广度优先搜索算法可以解决我们在**常见图问题**中提到的以下问题：

- **最短路径问题**：顶点$s$和$t$之间的最短路径是哪条？

## 连通分量 (Connected Components)

**连通分量**指一幅图中相连顶点簇的最大集合。在图论中，我们时常需要回答这样的问题：能否在常数时间内判断图中任意两个顶点之间是否存在路径？该问题等价于判断两个顶点是否存在于同一个连通分量中。因此我们需要高效地找到图中所有连通分量的方法。

并查集 (Union-find) 算法可以解决上述问题，但是并查集无法保证在常数时间内找到所有连通分量。然而，并查集的优势在于并查集是一种动态算法，它适合于在图的顶点和边处于动态变化中的计算。在本篇中，我们使用深度优先搜索来构造连通分量查找算法。

### 使用 DFS 寻找图的连通分量

使用 DFS 算法寻找连通分量的思路非常简单。对于图中每一个未标记过的顶点$v$，对该顶点进行深度优先搜索以寻找和该顶点相连的所有顶点，直到图中所有顶点都被访问过为止。

代码实现如下：

```Java
public class CC {
    private boolean[] marked;
    private int[] id;
    private int count;

    public CC(Graph G) {
        marked = new boolean[G.V()];
        id = new int[G.V()];
        for (int s = 0; s < G.V(); s++) {
            if (!marked[s]) {
                dfs(G, s);
                count++;
            }
        }
    }

    private void dfs(Graph G, int v) {
        marked[v] = true;
        id[v] = count;
        for (int w : G.adj(v))
            if (!marked[w])
                dfs(G, w);
    }

    public boolean connected(int v, int w) {
        return id[v] == id[w];
    }

    public int count() {
        return count;
    }

    public int id(int v) {
        return id[v];
    }  
}
```

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

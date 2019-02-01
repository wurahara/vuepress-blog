---
title: 算法与数据结构学习笔记——有向图
enable html: true
categories: Algorithms
tags:
  - algorithm
  - graph
  - directed graph
date: 2018-11-09 15:22:21
---

和无向图不同，**有向图**的边是单向的，因此每条边连接的两个顶点构成天然的有序对。有向图也可以使用我们在无向图中介绍的**深度优先搜索**和**广度优先搜索**算法。但是有向图的特性也为我们提出了一些新的问题，这需要我们对已有的算法进行一些改造。本篇中，我们将介绍有向图的相关概念和算法。

<!-- more -->

## 有向图 (Directed Graph)

### 有向图常见问题

有向图是一系列被有向边连接的顶点的集合。和无向图类似，有向图中也存在一些数学和拓扑学问题，包括但不限于：

1. **路径问题**：在一幅有向图中，顶点 $s$ 和 $t$ 之间是否有一条有向路径？
2. **最短路径问题**：在一幅有向图中，顶点 $s$ 和 $t$ 之间的最短有向路径是哪条？
3. **拓扑排序问题**：能否在给定有向图中将所有顶点排序，使得所有有向边均由排在前面的元素指向排在后面的元素？
4. **强连通性**：在一幅有向图中，是否有一条路径可以连接图中的所有顶点？

### 有向图的 API

下面是有向图所需要实现的 API：

```Java
public class Digraph {
    public Digraph(int V)                // 创建一幅含有V个顶点但没有边的有向图
    public Digraph(In in)                // 从输入流in中读入一幅有向图
    public void addEdge(int v, int w)    // 向有向图中插入一条从v指向w的有向边
    public Iterable<Integer> adj(int v)  // 遍历由v指出的边所连接的所有顶点
    public int V()                       // 顶点数
    public int E()                       // 边数
    public Digraph reverse()             // 该有向图的反向图
    public String toString()             // 对象的字符串表示
}
```

### 有向图的邻接表实现

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/graph2/directed%20graph.png"
    width="80%"
    alt="有向图和邻接表"
/>
</div>

和无向图类似，我们仍然用邻接表实现有向图。事实上，我们仅需要改动少量内容就可以将无向图的实现改造成有向图的实现。仅需：

1. 将类名和相关方法名做适当改动；
2. 在添加顶点 $v$ 到顶点 $w$ 的边时，和无向图不同，有向图仅需要添加一条有指向的边；
3. 实现对有向图取反的`reverse()`方法。

```Java
public class Digraph {
    private final int V;
    private int E;
    private Bag<Integer>[] adj;

    public Digraph(int V) {
        this.V = V;
        this.E = 0;
        this.adj = (Bag<Integer>[]) new Bag[V];
        for (int v = 0; v < V; v++)
            this.adj[v] = new Bag<Integer>();
    }

    public void addEdge(int v, int w) {
        this.adj[v].add(w);
        this.E++;
    }

    public Iterable<Integer> adj(int v) {
        return this.adj[v];
    }

    public Digraph reverse() {
        Digraph R = new Digraph(this.V);
        for (int v = 0; v < this.V; v++)
            for (int w : this.adj(v))
                R.addEdge(w, v);
        return R;
    }
}
```

有向图的邻接表实现有如下的性能参数：

- 使用的空间仍为 $V+E$ 数量级；
- 添加一条新边的时间复杂度仍为常数级；
- 遍历顶点 $v$ 的所有相邻顶点所需的时间和 $v$ 的出度成正比。

可以发现，有向图的邻接表实现和无向图的邻接表实现性能几乎相同。

## 有向图与可达性 (Reachability)

和无向图中的讨论类似，在有向图中我们也要解答可达性的相关问题，即：

- **路径问题**：在一幅有向图中，顶点 $s$ 和 $t$ 之间是否有一条有向路径？
- **最短路径问题**：在一幅有向图中，顶点 $s$ 和 $t$ 之间的最短有向路径是哪条？

### 有向图的深度优先搜索

在无向图中，我们使用深度优先搜索算法解决单点连通性问题，即判断某个顶点是否与另外的一个顶点相连通。而在有向图中，我们也有类似的问题，即单点可达性问题：给定有向图 $G$ 和起点 $s$，是否存在一条从 $s$ 到达给定顶点 $v$ 的有向路径？

有向图的单点可达性问题可以使用 DFS 解决，而且几乎无需对 DFS 的代码作出任何改动：

```Java
public class DirectedDFS {
    private boolean[] marked;

    public DirectedDFS(Digraph G, int s) {
        marked = new boolean[G.V()];
        dfs(G, s);
    }

    private void dfs(Digraph G, int v) {
        marked[v] = true;
        for (int w : G.adj(v))
            if (!marked[w])
                dfs(G, w);
    }

    public boolean visited(int v) {
        return marked[v];
    }
}
```

### 有向图的广度优先搜索

对于最短路径问题，我们在无向图中使用 BFS 解决。在有向图中，我们同样使用 BFS，且与 DFS 一样，几乎不需要对代码进行任何改动。因此不再列出有向图 BFS 的代码。

对于多源的最短路径问题，即考察一个从一个有限源顶点集合到达图中某个顶点的最短路径，也同样可以使用 BFS 解决。只需要在 BFS 队列初始化时将所有源顶点放入队列中即可。

## 拓扑排序与有向无环图

有向图研究的一个重要课题是有向环的研究，因为如果没有比较高效的算法，很难在复杂的有向图中快速标记出有向环。要研究该问题，我们首先需要考察优先级调度问题 (Precedence Scheduling) 和**拓扑排序**算法 (Topological Sort)。

### 优先级调度和拓扑排序

给定一组需要完成的任务，这些任务必须按照一定的先后次序完成，应该如何安排这些任务？这个问题就是优先级限制下的调度问题。对于该问题，我们可以将其抽象成一幅有向图，其中顶点对应任务，有向边对应优先级顺序。这样，我们就将上述问题进一步抽象为拓扑排序问题：给定一幅有向图，将所有顶点排序，使得所有有向边均从排在前面的元素指向排在后面的元素。

考虑到深度优先搜索正好会访问每个顶点一次，如果将`dfs()`的参数顶点保存在一个数据结构中，遍历该数据结构就可以访问图中的所有顶点。关键在于遍历的顺序，这取决于数据结构的性质和在递归调用前还是后保存顶点。通常人们关注以下三种排列顺序：

- 前序 (Preorder)：在递归调用之前将顶点加入队列；
- 后序 (Postorder)：在递归调用之后将顶点加入队列；
- 逆后序 (Reverse Postorder)：在递归调用之后将顶点压入栈。

下列算法实现了有向图中基于 DFS 的顶点排序功能：

```Java
public class DepthFirstOrder {
    private boolean[] marked;

    private Queue<Integer> pre;
    private Queue<Integer> post;
    private Stack<Integer> reversePost;

    public DepthFirstOrder(Digraph G) {
        pre = new Queue<Integer>();
        post = new Queue<Integer>();
        reversePost = new Stack<Integer>();

        marked = new boolean[G.V()];

        for (int v = 0; v < G.V(); v++)
            if (!marked[v])
                dfs(G, v);
    }

    private void dfs(Digraph G, int v) {
        pre.enqueue(v);

        marked[v] = true;
        for (int w : G.adj(v))
            if (!marked[w])
                dfs(G, w);

        post.enqueue(v);
        reversePost.push(v);
    }
}
```

上面的类允许用例程序使用各种顺序遍历 DFS 经过的所有顶点。借由该算法，我们可以实现拓扑排序：

```Java
public class Topological {
    private Iterable<Integer> order;

    public Topological(Digraph G) {
        DirectedCycle cyclefinder = new DirectedCycle(G);
        if (!cyclefinder.hasCycle()) {
            DepthFirstOrder dfs = new DepthFirstOrder(G);
            order = dfs.reversePost();
        }
    }

    public Iterable<Integer> order() {
        return order;
    }

    public boolean isDAG() {
        return order == null;
    }
}
```

### 有向无环图 (DAG, Directed Acyclic Graph)

顾名思义，有向无环图就是一幅不含有向环的有向图。使用 DFS 可以很简单地实现寻找有向图中有向环的算法。假设找到了一条由 $v$ 到 $w$ 的有向边，而 $w$ 已经存在于栈中，我们就找到了一个环。因为栈表示的是 $w$ 到 $v$ 的一条有向路径，而 $v$ 到 $w$ 的路径补齐了这个环。如果无法找到这样的边，就说明该有向图是无环的，即该图为有向无环图。

```Java
public class DirectedCycle {
    private boolean[] marked;
    private int[] edgeTo; private Stack<Integer> cycle;
    private boolean[] onStack;

    public DirectedCycle(Digraph G) {
        onStack = new boolean[G.V()];
        edgeTo = new int[G.V()];
        marked = new boolean[G.V()];
        for (int v = 0; v < G.V(); v++)
            if (!marked[v])
                dfs(G, v);
    }

    private void dfs(Digraph G, int v) {
        onStack[v] = true;
        marked[v] = true;
        for (int w : G.adj(v))
            if (this.hasCycle())
                return;
            else if (!marked[w]) {
                edgeTo[w] = v;
                dfs(G, w);
            } else if (onStack[w]) {
                cycle = new Stack<Integer>();
                for (int x = v; x != w; x = edgeTo[x])
                    cycle.push(x);
                cycle.push(w);
                cycle.push(v);
            }
        onStack[v] = false;
    }

    public boolean hasCycle() {
        return cycle != null;
    }
}
```

关于有向无环图和拓扑排序，可以证明以下结论：

- 当且仅当一幅有向图是有向无环图时，它才能进行拓扑排序；
- 一幅有向无环图的拓扑排序就是所有顶点的逆后序排列；
- 使用深度优先搜索对有向无环图进行拓扑排序所需的时间和 $V+E$ 成正比。

## 强连通性与强连通分量

在无向图中，如果有路径连接顶点 $v$ 和 $w$，则称他们之间是**连通的**。而在有向图中，如果从顶点 $v$ 有一条有向路径到达 $w$，则称顶点 $w$ 是从顶点 $v$ **可达的**。而只有当两个顶点 $w$ 和 $v$ 是互相可达的时候，才称它们是**强连通的**。

### 强连通性

和无向图中的连通性类似，有向图中的强连通性有以下性质：

- 自反性 (Reflexive)：任意顶点 $v$ 都和自身强连通；
- 对称性 (Symmetric)：如果 $v$ 和 $w$ 是强连通的，则 $w$ 和 $v$ 也是强连通的；
- 传递性 (Transitive)：如果 $v$ 和 $w$ 是强连通的，且 $w$ 和 $x$ 也是强连通的，则 $v$ 和 $x$ 也是强连通的。

基于以上性质，我们可以定义有向图中的**强连通分量** (SCC, Strongly Connected Components)，即由一幅图的相互均为强连通的顶点的最大子集构成的一组等价类。如下图所示。

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/algorithms/graph2/SCC.png"
    width="45%"
    alt="强连通分量"
/>
</div>

### 强连通分量

平方级别的 SCC 查找算法是难以满足需求的，基于 DFS 的 Kosaraju 算法可以极大地降低查找 SCC 的时间复杂度。该算法的思路如下：

1. 对于给定的有向图 $G$，计算其反向图 $G^R$ 的逆后序排列；
2. 在 $G$ 中进行深度优先搜索，搜索时需按照上一步中得到的顺序访问所有未被标记的顶点；
3. 所有在构造函数中被同一个递归`dfs()`调用访问到的顶点都在同一个强连通分量中。

```Java
public class KosarajuSCC {
    private boolean[] marked;
    private int[] id;
    private int count;

    public KosarajuSCC(Digraph G) {
        marked = new boolean[G.V()];
        id = new int[G.V()];
        DepthFirstOrder order = new DepthFirstOrder(G.reverse());
        for (int s : order.reversePost())
            if (!marked[s]) {
                dfs(G, s);
                count++;
            }
    }

    private void dfs(Digraph G, int v) {
        marked[v] = true;
        id[v] = count;
        for (int w : G.adj(v))
            if (!marked[w])
                dfs(G, w);
    }

    public boolean stronglyConnected(int v, int w) {
        return id[v] == id[w];
    }

    public int id(int v) {
        return id[v];
    }

    public int count() {
        return count;
    }
}
```

可以证明，Kosaraju 算法的预处理所需的时间和空间和 $V+E$ 成正比，且支持常数时间的有向图强连通性查询。

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part II, Princeton University.](https://www.coursera.org/learn/algorithms-part2/home/welcome)

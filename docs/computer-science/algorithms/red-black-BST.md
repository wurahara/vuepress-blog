---
series: 查找算法
title: 平衡搜索树：2-3 搜索树和红黑树
enable html: true
categories: Algorithms
tags:
  - algorithm
  - binary search tree
  - red-black tree
date: 2018-10-31 15:20:58
---

我们在之前已经介绍了基于链表、数组和树结构的符号表实现。这些实现都或多或少的面临性能问题。其中树结构在大部分情况下都能表现良好，但是由于结点插入顺序会影响树的构造策略，从而导致其在最坏情况下的性能仍然很糟糕。在本篇中，我们将介绍几种始终能够保持平衡的二叉搜索树，这种搜索树能够保证将时间复杂度控制在 $\lg N$ 数量级上。

<!-- more -->

## 2-3 搜索树

为了保证搜索树的平衡性，我们不妨稍稍放松一下对树结点的要求，允许树中的结点保存多个键值对。在这种情况下，2-3 搜索树中有两种类型的结点，他们分别是：

- 2 - 结点：结点中含有一个键值对，一个结点有两个链接，左链接指向的子树中所有键都小于该结点，右链接指向的子树中所有键都大于该结点。
- 3 - 结点：结点中含有两个键值对，一个结点包含3个链接，左链接指向的子树中所有键都小于该结点，中链接指向的子树中所有键都介于该结点中两个键之间，右链接指向的子树中所有键都大于该结点。

### 搜索操作

2-3 树的查找算法和一般二叉搜索树的查找算法相似，将键和根结点比较，如未命中就找到对应的链接，然后在子树中递归地继续查找，直到命中或遭遇空链接。

### 向 2- 结点中插入新键

如果未命中的查找结束于一个 2- 结点，为了保持 2-3 树的平衡性，我们可以将新键保存在这个 2- 结点中，这样它就变成了一个 3- 结点，如下图所示。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/insert%20into%20a%202-node.png"
    width="45%"
    alt="向2-结点中插入新键"
/>
</div>

### 向 3- 结点中插入新键

如果未命中的查找结束于一个 3- 结点，情况和 2- 结点稍有不同。对于3-结点，已经没有多余的插入新键的空间了。为了插入新键，我们暂时地将新键插入该 3- 结点，构成一个 4- 结点。随后将 4- 结点的中间键 B 上移至该结点的父结点，然后将剩下的两个键分裂为两个新的 2- 结点。倘若在加入新结点后的父结点也变为 4- 结点，就重复上述过程，将中间结点上浮。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/insert%20into%20a%203-node.png"
    width="45%"
    alt="向3-结点中插入新键"
/>
</div>

### 分解根结点

如果上面步骤中的上浮操作最终使得根结点也成为 4- 结点，我们可以将该 4- 结点分解成 3 个 2- 结点，将中间键上浮为新的根结点，左右键作为其子结点。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/splitting%20the%20root.png"
    width="45%"
    alt="分解根结点"
/>
</div>

### 全局性质

注意到，上述插入操作所带来的所有变换都是局部变换，除了相关的结点和链接之外不需要修改或检查树的其他部分。这些局部变换不会影响树的全剧有序性和平衡性，亦即任意空链接到根结点的路径长度都是相等的。

可以证明，在一棵大小为 $N$ 的 2-3 树中，查找和插入操作访问的结点必然不超过 $\lg N$ 个。最好的情况下，访问 2-3 树的时间复杂度为 $0.631 \lg N$。上述最坏情况在 2-3 树全由 2- 结点构成时取得，最好情况在 2-3 树全由 3- 结点构成时取得。

## 红黑树

上述 2-3 树帮助我们构建了一种基于树结构的平衡的符号表实现，但是 2-3 树的代码实现过于复杂，因为我们需要实现不同的结点类型和上浮操作。接下来，我们将介绍一种名为**红黑树**的数据结构来表达 2-3 树的思想。红黑树的实现相较 2-3 树更加容易，因为红黑树的很多操作可以直接复用普通二叉搜索树的代码。

### 等价性

红黑树的基本思想是用标准二叉树结点和额外的信息来完全替换 2-3 树，同时维持 2-3 树的平衡性。为了实现这个目的，我们使用左偏红链接来来连接 2-3 树中 3- 结点的两个内键。

完全脱离 2-3 树的红黑树可以用以下方法定义：

- 含有红黑链接的二叉搜索树；
- 所有红链接均为左链接；
- 没有任何一个结点同时与两条红链接相连；
- 完美黑平衡，即任意空链接到根结点的路径上的黑链接数量相同。

满足以上定义的红黑树，被称为左偏红黑二叉搜索树 (LLRB, Left-leaning Red-black Binary Search Tree)，和相应的 2-3 树必能一一对应，原因是可以将所有红链接画平，这样所有空链接到根结点的距离可以直观的观察而被证明是相同的。如果将红链接相连的两个结点合并，得到的就是标准的 2-3 树。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/1-1%20correspondence%20between%20RBBSTs%20and%202-3%20trees.png"
    width="50%"
    alt="红黑树和2-3树的等价性"
/>
</div>

### LLRB的基本表示

考虑到二叉树中的每个结点都只有一条指向自己的连接（从父结点指向它），我们需要将该链接的颜色作为结点的性质保存在结点对象中。

```Java
public class RedBlackBST<Key extends Comparable<Key>, Value> {
    private static final boolean RED = true;
    private static final boolean BLACK = false;

    private Node root;

    private class Node {
        private Key key;
        private Value val;
        private Node left, right;
        private boolean color;
        private int size;

        public Node(Key key, Value val, boolean color, int size)  {
            this.key = key;
            this.val = val;
            this.color = color;
            this.size = size;
        }
    }

    private boolean isRed(Node x) {
        if (x == null)
            return false;
        return x.color == RED;
    }
}
```

### 搜索操作

由于红黑树的实现没有改变二叉树的结点表示和结构，所以红黑树的搜索实现可以直接使用普通二叉搜索树的搜索实现。

```Java
public Value get(Key key) {
    if (key == null)
        throw new IllegalArgumentException("argument to get() is null");
    return get(root, key);
}

private Value get(Node x, Key key) {
    while (x != null) {
        int cmp = key.compareTo(x.key);
        if (cmp < 0)
            x = x.left;
        else if (cmp > 0)
            x = x.right;
        else
            return x.val;
    }
    return null;
}
```

除了搜索操作外，其他的一些基本操作如`floor`，`iteration`和`selection`都和二叉搜索树的实现相同，不再赘述。

### 基本原子操作

在实现插入操作之前，我们有一些基本的原子操作需要事先实现。这些原子操作将会在插入操作中被反复使用，是红黑树实现的基础。

#### 左旋 (Left Rotation)

在实现插入或删除操作时可能会出现红色右链接或两条红色的右链接，在操作完成之前这些情况必须被修复。旋转操作可以改变红链接的指向。左旋可以将红色的右链接转化为左链接，其具体原理可参照下图：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/left%20rotation.png"
    width="75%"
    alt="左旋"
/>
</div>

其具体实现如下：

```Java
private Node rotateLeft(Node h) {
    Node x = h.right;
    h.right = x.left;
    x.left = h;
    x.color = x.left.color;
    x.left.color = RED;

    x.size = h.size;
    h.size = size(h.left) + size(h.right) + 1;

    return x;
}
```

#### 右旋 (Right Rotation)

右旋操作与左旋类似，只需要将对应的链接互换即可。其示意图如下：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/right%20rotation.png"
    width="75%"
    alt="右旋"
/>
</div>

其具体实现如下：

```Java
private Node rotateRight(Node h) {
    Node x = h.left;
    h.left = x.right;
    x.right = h;
    x.color = x.right.color;
    x.right.color = RED;

    x.size = h.size;
    h.size = size(h.left) + size(h.right) + 1;

    return x;
}
```

旋转操作

#### 颜色转换 (Color Flip)

插入或删除操作可能会使某个结点的两个链接都为红链接，这时需要进行颜色转换以使得该结点的链接满足红黑树的要求。其示意图如下：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/flip%20colors.png"
    width="90%"
    alt="颜色转换"
/>
</div>

其实现如下：

```Java
private void flipColors(Node h) {
    h.color = !h.color;
    h.left.color = !h.left.color;
    h.right.color = !h.right.color;
}
```

和左右旋一样，颜色转换也是局部操作，既不需要知道其他结点的情况，也不会改变整棵树的黑平衡性。

### 插入操作

实现插入操作的中心思想是始终维持和 2-3 树的一一对应关系，通过使用上述的 LLRB 基本原子操作来维护整棵树的黑平衡性和有序性。

#### 情况 1：向一棵只有一个键（即一个 2- 结点）的树中插入新键

一棵只含有一个键的树只含有一个 2- 结点。插入新键后，若新键小于老键，只需新增一个红链接下的结点即可。若新键大于老键，则新增的结点将会产生一条右偏的红链接，此时需要使用左旋操作修正链接。两种情况的示意图如下：

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/insert%20into%20a%20tree%20with%201%20node.png"
    width="70%"
    alt="情况1"
/>
</div>

#### 情况 2：向树底部的 2- 结点插入新键

想要在树底新增一个新键，首先需要使用基本的二叉搜索树算法向红黑树中查找新键的位置，然后使用红链接将新结点和其父结点相连。如果其父结点是一个 2- 结点（即指向父结点的链接为黑链接），则可以使用情况1中的方法调整链接。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/insert%20into%20a%202-node%20at%20the%20bottom.png"
    width="45%"
    alt="情况2"
/>
</div>

#### 情况 3：向一棵只有两个键（即一个 3- 结点）的树中插入新键

这种情况分为三种子情况，分别为：

1. 新键大于原树中的两个键。这时新键被连接到 3- 结点的右链接上。这时树是平衡的，只需将两条链接由红变黑即可（颜色转换）。
2. 新键小于原树中的两个键。这时新键被连接到最左边的空链接上，这样就产生了两条连续的红链接。继续将上层的红链接右旋，我们就得到了第一种情况。
3. 新键介于原树中两个键之间。这时新键被接在左键的右链接上。我们只需将下层的红链接左旋即可得到第二种情况。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/insert%20into%20a%20tree%20with%202%20nodes.png"
    width="90%"
    alt="情况3"
/>
</div>

#### 情况 4：向树底部的 3- 结点插入新键

想要在树底部的 3- 结点下插入一个新键，情况大致和情况 3 中的 3 种子情况相似。

1. 指向新结点的链接是 3- 结点的右链接，这时我们只需转换颜色即可。
2. 指向新结点的链接是 3- 结点的左链接，这时我们需要进行右旋转然后再转换颜色。
3. 指向新结点的链接是 3- 结点的中链接，这时我们需要先左旋转下层链接然后右旋转上层链接，最后再转换颜色。

上述颜色转换操作会将中结点的链接变红，这意味着将其送入了父结点中。随后我们可以在父结点中采用同样的方式解决该问题。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/insert%20into%20a%203-node%20at%20the%20bottom%201.png"
    width="90%"
    alt="情况4"
/>
</div>

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/insert%20into%20a%203-node%20at%20the%20bottom%202.png"
    width="90%"
    alt="情况4"
/>
</div>

#### 实现

只需要在沿着插入点到根结点的路径向上移动时所经过的每个结点中顺序完成以下操作，我们就能够完成插入操作：

1. 如果右子结点是红色的而左子节点是黑色的，进行左旋转；
2. 如果左子结点是红色的，且它的左子结点也是红色的，进行右旋转；
3. 如果左右子结点均为红色，就进行颜色转换。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/algorithms/search3/conditions%20switch.png"
    width="45%"
    alt="状态转换示意图"
/>
</div>

实现代码如下：

```Java
public void put(Key key, Value val) {
    if (key == null)
        throw new IllegalArgumentException("first argument to put() is null");
    if (val == null) {
        delete(key);
        return;
    }

    root = put(root, key, val);
    root.color = BLACK;
}

private Node put(Node h, Key key, Value val) {
    if (h == null)
        return new Node(key, val, RED, 1);

    int cmp = key.compareTo(h.key);

    if (cmp < 0)
        h.left = put(h.left, key, val);
    else if (cmp > 0)
        h.right = put(h.right, key, val);
    else
        h.val = val;

    if (isRed(h.right) && !isRed(h.left))
        h = rotateLeft(h);
    if (isRed(h.left) && isRed(h.left.left))
        h = rotateRight(h);
    if (isRed(h.left) && isRed(h.right))
        flipColors(h);
    h.size = size(h.left) + size(h.right) + 1;
    return h;
}
```

### 性能表现

以下关于红黑树的结论可以通过证明得到：

1. 可以证明，所有基于红黑树的符号表实现都能保证操作的时间复杂度为对数级别。
2. 一棵大小为 $N$ 的红黑树的高度不会超过 $2\lg N$。
3. 一棵大小为 $N$ 的红黑树中，根结点到任意结点的平均路径长度为约 $1.00 \lg N$。

和之前我们介绍过的几种符号表实现进行比较，很容易发现红黑树的表现最为优异。

|数据结构|最坏查找|最坏插入|最坏删除|平均查找|平均插入|平均删除|
|:-----:|:----:|:-----:|:-----:|:----:|:----:|:----:|
|无序链表|$N$|$N$|$N$|$\frac{N}{2}$|$N$|$\frac{N}{2}$|
|有序数组|$\lg N$|$2N$|$N$|$\lg N$|$\frac{N}{2}$|$\frac{N}{2}$|
|二叉搜索树|$N$|$N$|$N$|$1.39 \lg N$|$1.39 \lg N$|?|
|2-3树|$c \lg N$|$c \lg N$|$c \lg N$|$c \lg N$|$c \lg N$|$c \lg N$|
|红黑树|$2 \lg N$|$2 \lg N$|$2 \lg N$|$1.00 \lg N$|$1.00 \lg N$|$1.00 \lg N$|

## 参考文献

1. [Robert Sedgewick, Kevin Wayne. 算法 第四版](https://book.douban.com/subject/19952400/)
2. [Kevin Wayne,  Robert Sedgewick. Coursera Algorithms Part I, Princeton University.](https://www.coursera.org/learn/algorithms-part1/home/welcome)

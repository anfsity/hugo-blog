+++
title = "编译优化其二-支配树"
date = 2026-06-08T03:34:49+08:00
draft = false
author = "Anfsity"
tags = [
    "Compile Principle",
]
categories = [
    "Compile Principle",
]
description = ""
image = ""
+++

## Introduction

支配树在编译器中最主要的作用是用于计算支配边界，用于插入 $\phi$ 函数，将 ir 提升到 SSA 形式。以及提供循环优化，DCE 等 pass 需要的结构信息。

## Control Flow Graph

有如下代码：

```c
int main () {

  int a = 1;
  a = fac(9);

  if (a == 1) {
    a = 2;
  } else {
    a = 4;
  }

  return a;
}
```

我们可以构建出 ir：

```mlir
func @main() : () -> i32 {
  ^entry_0:
    %0 = alloca : i32 -> i32*
    store 1, %0 : i32, i32*
    %1 = call @fac(9) : (i32) -> i32
    store %1, %0 : i32, i32*
    %2 = eq %1, 1 : i32 -> i1
    branch %2, ^then_1, ^else_2
  ^then_1:
    store 2, %0 : i32, i32*
    jump ^merge_3
  ^else_2:
    store 4, %0 : i32, i32*
    jump ^merge_3
  ^merge_3:
    %3 = load %0 : i32* -> i32
    ret %3
}
```

在程序执行过程，我们可以把这个 if 看成一个分叉点，分叉点之前 a = 1, 而分叉点之后 a = 2 或者 4,可以把这个过程看成有向图。ir 有四个基本块，表达如下：

![](/post/Compile-Principle/images/Pasted%20image%2020260605195628.png)

控制流在 if 出现时发生分叉，在 if 结束时汇合：

![](/post/Compile-Principle/images/Pasted%20image%2020260605200401.png)

我们对其建图，称之为 CFG (Control Flow Graph) 。有了 CFG，就可以将图论的知识应用到程序分析中。支配树就是基于 CFG 构建的。

## DomTree

本文涉及到的算法并不仅仅只作用于 DAG，但是为了简单起见，都以 DAG 说明。

首先有存在 DAG 如下：

![](/post/Compile-Principle/images/Pasted%20image%2020260605200656.png)

可以观察到，从节点 1 出发，可以到达其余所有节点，我们给出定义：

> 钦定入口结点 $s$，对于一个结点 $u$，若从 $s$ 到 $u$ 的每一条路径都经过某一个结点 $v$，那么我们称 $v$ 支配 $u$ ，也称 $v$ 是 $u$ 的一个支配点，记作 $v\ dom\ u$．

对于函数来说，我们一定有一个进入函数执行流的基本块，一定有一个退出函数执行流的基本块，整个过程可以用「存在一个节点 $s$ 可达所有节点的 DAG」建模。如果存在不可达的节点，那么节点无效，可以删除。

接下来我们深入介绍 domtree 相关概念。在图中，节点 1 是所有节点的支配点，而到达节点 6 的路径有两条 $1 \to 2 \to 3 \to 6$ 和 $1 \to 2 \to 3 \to 5 \to 6$ 。则 2,3 是 6 的支配点，而 5 不是 6 的支配点。

把节点 $u$ 所有支配点构成一个集合，称之为支配点集，上图所有节点的支配点集如下：

![](/post/Compile-Principle/images/Pasted%20image%2020260605201500.png)

一个直接的求解支配点思路是，如果一个节点 $u$ 从图中删除导致节点 $v$ 不可达，那么 $u$ 支配 $v$。

显然这个思路可以进行优化，如果已知节点 $u$ 是 $v$ 的支配点，$v$ 是 $n$ 的支配点，则 $u$ 是 $n$ 的支配点。即支配点具有传递性。根据这个性质，我们可以得出对于节点 $u$ 来说，其支配点集就是 $u$ 自身和其前驱接节点的支配点集的交集。在上图中，8 的支配点集就是集合 $\{1,2,3,6\}$ 和集合 $\{1,2,3,5\}$ 的交集和 8 自身 $\{1,2,3,8\}$。

我们把除节点 $u$ 以外的距离 $u$ 最近的支配点 $v$ 称作直接支配点，记作 $v\ idom\ u$。比如节点 8 有支配点集 $\{1, 2, 3, 8\}$，则 3 是 8 的直接支配点，记作 $3\ idom\ 8$ 。除了入口节点 $s$ 以外，其余所有节点都有唯一的直接支配点。若将图中的节点与其直接支配点连边，其构成一颗节点数目为 n 的树，称之为支配树。

![上图所构成的支配树](/post/Compile-Principle/images/Pasted%20image%2020260605202131.png)

这就是我们需要构建的支配树，接下来我们介绍一种快速构建支配树的算法 Lengauer–Tarjan 算法。

Lengauer-Tarjan 算法是构建支配树最有名的算法之一，可以在 $O(n\alpha(n,m))$ 内求出一个有向图的支配树，这个算法最精华的点就是引入了半支配点的概念，将一个全局的复杂问题降级为局部的易分析问题。

如果我们对一个图进行 dfs，所经过的点和边可以构成一颗树。令 $dfn(u)$ 表示为节点 $u$ 被遍历到的时间。这些概念在图论里面很常见（

定义一个集合 $V$ ，其中所有的节点 $v_{i}$ 满足从 $v_{i}$ 出发到节点 $u$，存在一条路径，路径上除了 $u,v_{i}$ 以外，其余所有节点 $x_{i}$ 都有 $dfn(x_{i}) > dfn(u)$。一个节点 $u$ 的半支配点 $v$ 就是集合 $V$ 中 dfn 最小的那个。即 $v = min(V)$。

给出上图的 dfn 序列：

![](/post/Compile-Principle/images/Pasted%20image%2020260605203808.png)

节点 8 的半支配点是 3，其中有节点 6,5,7,3 都满足从自身出发，其路径上除了自身和节点 8，路径上的中间结点的 dfn 序都大于 dfn(8)。而 3 是其中 dfn 最小的一个。

可以观察到，半支配点的产生可能有两种情况，第一种是 $u$ 的直接前驱节点，另一种是如果前驱节点的 dfn 比 $u$ 大，那么就从前驱节点的前驱节点找，这是一个反复执行的过程，直到前驱节点的 dfn 比 $u$ 小。

形式化的说，一个节点 $u$ 的半支配点 $sdom(u)$ 满足：

$$
sdom(u) = min(\{v\ |\ \exists v \to u, dfn(v) < dfn(u)\} \cup \{sdom(w)\ |\ dfn(w) > dfn(u) \text{ and } \exists w \to \dots \to v \to u\})
$$

~~我们不加证明的给出这个公式~~，证明可以参考 oiwiki，并且我们可以用带权并查集维护公式的后半部分。

```c++
struct LT_Dsu {
  std::vector<int> father;
  std::vector<int> label; //< label[x] 代表从 x 开始，到并查集中 x 的根节点为止（不包括根节点），其中 dfn(sdom) 最小的节点。
  const std::vector<int> &dfn;
  const std::vector<int> &sdom;

  void find(int x) {
    if (x == father[x]) {
      return;
    }

    find(father[x]);
	
	// 在路径压缩过程中，天然的维护了上述半支配点公式的关系，确保了压缩后可以快速求出 label
    if (dfn[sdom[label[father[x]]]] < dfn[sdom[label[x]]]) {
      label[x] = label[father[x]];
    }

    father[x] = father[father[x]];
  }

  LT_Dsu(int n, const std::vector<int> &_dfn, const std::vector<int> &_sdom)
      : father(n + 1), label(n + 1), dfn(_dfn), sdom(_sdom) {
    std::iota(father.begin(), father.end(), 0);
    std::iota(label.begin(), label.end(), 0);
  }

  int eval(int x) {
    if (x == father[x]) {
      return label[x];
    }

    find(x);
    return label[x];
  }

  // parent node, child node
  void link(int u, int v) { father[v] = u; }
};
```


![](/post/Compile-Principle/images/Pasted%20image%2020260606121528.png)

那么半支配点有什么用呢？

给出如下算法，记 $x \overset{*}{\to} y$ 表示为 $x$ 是 $y$ 的祖先（可能有 $x = y$），记 $x \overset{+}{\to} y$ 表示 $x$ 是 $y$ 的真祖先（$x \neq y$） ，对于任何节点 $w \neq s$：

> 令 $u$ 是 dfs 树路径上 $sdom(w) \overset{+}{\to} u \overset{*}{\to} w$ 上使得 $sdom(u)$ 的 dfn 最小的节点。

$$
idom(w) = \begin{cases}
sdom(w) & \text{if } sdom(u) = sdom(w) \\
idom(u) & \text{if } sdom(u) < sdom(w)
\end{cases}
$$

用普通话说，在 dfs 树上，存在一条路径 $sdom(w) \to x_{0},x_{1},\dots,x_{n}\to w$，路径上除了 $sdom(w)$ 以外的点，构成集合 $X = \{x_{0},x_{1},\dots,x_{n},w\}$，从这个集合选出一个点 $u$，它满足 $\forall x \in X, dfn(sdom(u)) \leq dfn(sdom(x))$。此时 $idom(w)$ 满足上述关系式。

![](/post/Compile-Principle/images/Pasted%20image%2020260606121545.png)
 
如上图所示，路径 $sdom(8) \to 4 \to 7 \to 8$ 满足上述 $dfn(sdom(x))$ 最小的点是 4 或者 8，满足 $sdom(4) = sdom(8)$，则 $idom(8)$ 就是 3。

在这里再给出一个简单的 case：

![](/post/Compile-Principle/images/Pasted%20image%2020260607173705.png)

考查节点 4，节点 4 的 sdom 是 2，但是 2 不是 4 的 idom。可以观察到路径 $2 \to 3 \to 4$ 中，$sdom(3)$ 小于 $sdom(4)$ ，按照算法更新 4 的 idom 为 $idom(3)$ 也就是 1。

sdom 代表着什么呢？按照我的个人理解，$u$ 的 $sdom(u)$ 代表着从 $sdom(u)$ 出发到 $u$，路径中除去首尾的所有节点都不可能是 $u$ 的 idom，这是一个很强的约束。嗯呢呢，如果把原图 $G$ 中的所有非树边删掉，再对于每个节点 $u$，加上一条由 $sdom(u)$ 到 $u$ 的有向边，那么变化后的新图 $G'$ 和原图 $G$ 的支配树完全相同。也就是说，我们可以假想 $sdom(u)$ 到 $u$ 存在一条直接路径，直接沟通起了 $sdom(u)$ 和 $u$。但这并不意味着 $sdom(u)$ 就一定是 $u$ 的 idom，因为就算中间的所有节点都不是 $u$ 的 idom，但其中某一个节点 $v$ 有可能存在一条 $sdom(v)$ 到 $v$ 的路径绕过 $sdom(u)$。打破 $sdom(u)$ 的支配关系。这个时候就对应上面给出公式的第二种情况。

下给出证明（以下证明的比较 $<,\leq,>,\geq$ 等都表示 dfn 之间的比较）：

首先给出两条引理，引理一（s 是入口节点）：

> 对于任意 $w \neq s$，直接支配者 $idom(w)$ 必然是半支配者 $sdom(w)$ 的祖先（即 $idom(w) \overset{*}{\to} sdom(w)$）

引理二：

> 设 $v, w$ 是 DFS 树上的节点且 $v \overset{*}{\to} w$。若树路径 $v \overset{+}{\to} y \overset{*}{\to} w$ 上的每一个节点 $y$ 都满足 $sdom(y) \ge v$，则 $v$ 支配 $w$。

引理都可以使用反证法证明，我就不给出证明了。

首先考虑情况一，假设 $u$ 是树路径 $sdom(w) \overset{+}{\to} u \overset{*}{\to} w$ 上使得 $dfn(sdom(u))$ 最小的节点。

我们有在树路径上 $sdom(w) \overset{+}{\to} y \overset{*}{\to} w$ 的任意节点 $y$ 都满足 $sdom(y) \geq sdom(u) = sdom(w)$，根据引理二，$sdom(w)$ 是 $w$ 的支配点。

既然 $sdom(w)$ 是 $w$ 的一个支配点，根据直接支配点的性质，$idom(w)$ 是最靠近 $w$ 的支配点，$idom(w)$ 必然在 $sdom(w) \to w$ 的路径上，也就是 $sdom(w)$ 是 $idom(w)$ 的祖先，又根据引理一，$idom(w)$ 是 $sdom(w)$ 的祖先，所以 $idom(w) = sdom(w)$。$\blacksquare$

然后是情况二，首先，因为 $sdom(u) < sdom(w)$，这意味着存在一条路径 $sdom(u) \to \dots \to u$ 可以绕过 $sdom(w)$，$sdom(w)$ 就不是 $w$ 的 idom。而因为 $sdom(w) \to w$ 的路径一定经过 $u$，这样构成的相对路径：

$$
idom(u) \overset{+}{\to} sdom(w) \overset{+}{\to} u \overset{*}{\to} w
$$
先证 $idom(w)$ 支配 $u$ ，如果 $idom(w)$ 不支配 $u$，则存在一条 $s$ 到 $u$ 避开 $idom(w)$ 的路径，如下：

![](/post/Compile-Principle/images/Pasted%20image%2020260608004903.png)

显然这样出现了一条 $s \to w$ 的路径，与 $idom(w)$ 是 $w$ 的支配点矛盾，所以假设不成立，$idom(w)$ 支配 $u$。进而得到 $idom(w) \overset{*}{\to}idom(u)$。

然后证明 $idom(u)$ 支配 $w$，如果 $idom(u)$ 不支配 $w$，则存在一条从 $s$ 出发避开 $idom(u)$ 到 $w$ 的路径，我们称之为 $p$。

设 $x$ 是路径 $p$ 上最后一个满足 $x < idom(u)$ 的节点（节点 $x$ 一定存在，最起码是 $s$，并且注意这里的 $<$ 是比较的 dfn）。设 $y$ 是路径 $p$ 上最后一个满足 $idom(u) \overset{*}{\to} y \overset{*}{\to} w$ 的节点（节点 $y$ 一定存在，是 $idom(u)$ 的后代，最起码是 $w$）。

考查路径 $p$ 中 $x$ 到 $y$ 这一段子路径，由于 $x$ 的定义，该路径上的内部节点 dfn 不能小于 $idom(u)$，且不能是 $idom(u)$ 的后代。根据 $sdom$ 的定义，有：

$$
sdom(y) \leq x < idom(u) \leq sdom(u)
$$

亦即 $sdom(y) < sdom(u)$ !

现在考查 $y$ 的位置，$y$ 不能在 $sdom(w) \overset{+}{\to}z \overset{*}{\to}w$ 上，因为这段路径上，$u$ 的 $sdom$ 最小，如果 $y$ 在这一段，有 $sdom(y) \geq sdom(u)$ 与 $sdom(y) < sdom(u)$ 矛盾。

![](/post/Compile-Principle/images/Pasted%20image%2020260608014301.png)

并且 $y$ 不能在 $idom(u) \overset{+}{\to} z \overset{*}{\to} u$ 上，如果 $y$ 在这里，根据 $sdom(y) < idom(u)$，可以构造出一条等效于 $s \to sdom(y) \to y \to u \to w$ 的路径，并且这个路径不会经过 $idom(u)$，与 $idom(u)$ 是 $u$ 的直接支配点矛盾！所以，$y$ 只能是 $idom(u)$。但是 $y$ 是 $idom(u)$ 并且 $y$ 位于路径 $p$ 上，与假设路径 $p$ 不经过 $idom(u)$ 矛盾，所以 $idom(u)$ 支配 $w$。

所以有 $idom(u) \overset{*}{\to}idom(w)$，根据上面得到的 $idom(w) \overset{*}{\to}idom(u)$，顺利得到 $idom(u)=idom(w)$ 这一结果。$\blacksquare$

综上，证毕。

其实上面的证明也可以这么说，所有从 $s$ 到 $w$ 的路径，都必须经过 $idom(u)$，并且任何比 $idom(u)$ 深的节点，都无法支配 $w$。其实就是证明思路哈哈。

$$
idom(w) = \begin{cases}
sdom(w) & \text{if } sdom(u) = sdom(w) \\
idom(u) & \text{if } sdom(u) < sdom(w)
\end{cases}
$$
根据这个公式和这个公式

$$
sdom(u) = min(\{v\ |\ \exists v \to u, dfn(v) < dfn(u)\} \cup \{sdom(w)\ |\ dfn(w) > dfn(u) \text{ and } \exists w \to \dots \to v \to u\})
$$

我们可以先倒序遍历 dfs 树，求出 sdom 和初步填充 idom，最后再正序遍历把 $sdom(u) < sdom(w)$ 这种情况补上。

为了求出 $v$ 的直接支配者 $idom(v)$，我们必须在 DFS 树路径 $sdom(v) \overset{+}{\to} u \overset{*}{\to} v$ 上寻找一个使 $sdom[u]$ 的 DFN 最小的节点 $u$。

这里存在一个时序冲突，当我们刚求出 $sdom[v]$ 时，逆序 DFN 循环正好执行到节点 $v$。此时，DFS 树路径 $sdom(v) \overset{+}{\to} u \overset{*}{\to} v$ 上的那些中间节点（由于它们是 $v$ 的祖先，DFN 严格小于 $dfn(v)$），还没有被处理，也没有执行过 `link` 操作。如果此时直接对 $v$ 调用 `eval(v)`，并查集无法向上检索到 $sdom(v)$，因为那些树边还没有被加入并查集森林。

所以我们得想办法把这个操作延迟进行，如下代码的 bucket 就负责了这个功能：

```c++
  void get(int root) {
    dfs(root, root);

    std::iota(sdom.begin(), sdom.end(), 0);

    LT_Dsu dsu(n, dfn, sdom);

    for (int i = timer; i >= 2; --i) {
      int w = vertex[i];

      for (auto &v : preds[w]) {
        int u = dsu.eval(v);

        if (dfn[sdom[u]] < dfn[sdom[w]]) {
          sdom[w] = sdom[u];
        } // 求 sdom
      }

      dsu.link(parent[w], w);

      bucket[sdom[w]].push_back(w);
      int p = parent[w];
		
	  // 延迟更新
      for (auto &u : bucket[p]) {
        int v = dsu.eval(u);
        idom[u] = (dfn[sdom[v]] < dfn[sdom[u]]) ? v : p;
      }
      bucket[p].clear();
    }

	// 正序更新 idom
    for (int i = 2; i <= timer; ++i) {
      int w = vertex[i];
      if (idom[w] != sdom[w]) {
        idom[w] = idom[idom[w]];
      }
    }
  }
```

下面是例题 [支配树 Luogu P5180](https://www.luogu.com.cn/problem/P5180) 的代码：

```c++
#include <algorithm>
#include <iostream>
#include <map>
#include <numeric>
#include <print>
#include <vector>

struct LT_Dsu {
  std::vector<int> father;
  std::vector<int> label;
  const std::vector<int> &dfn;
  const std::vector<int> &sdom;

  void find(int x) {
    if (x == father[x]) {
      return;
    }

    find(father[x]);

    if (dfn[sdom[label[father[x]]]] < dfn[sdom[label[x]]]) {
      label[x] = label[father[x]];
    }

    father[x] = father[father[x]];
  }

  LT_Dsu(int n, const std::vector<int> &_dfn, const std::vector<int> &_sdom)
      : father(n + 1), label(n + 1), dfn(_dfn), sdom(_sdom) {
    std::iota(father.begin(), father.end(), 0);
    std::iota(label.begin(), label.end(), 0);
  }

  int eval(int x) {
    if (x == father[x]) {
      return label[x];
    }

    find(x);
    return label[x];
  }

  // parent node, child node
  void link(int u, int v) { father[v] = u; }
};

struct DomTree {
  int n;
  std::vector<std::vector<int>> adj;
  std::vector<std::vector<int>> preds;
  std::vector<std::vector<int>> bucket;
  std::vector<int> dfn;
  std::vector<int> vertex;
  std::vector<int> parent;
  std::vector<int> sdom;
  std::vector<int> idom;
  int timer;

  DomTree(int n = 0)
      : n(n), adj(n + 1), preds(n + 1), bucket(n + 1), dfn(n + 1, -1),
        vertex(n + 1, 0), parent(n + 1, 0), sdom(n + 1, 0), idom(n + 1, 0),
        timer(0) {}

  void add_edge(int u, int v) {
    adj[u].push_back(v);
    preds[v].push_back(u);
  }

  void dfs(int u, int p) {
    dfn[u] = ++timer;
    vertex[timer] = u;
    parent[u] = p;

    for (auto &v : adj[u]) {
      if (dfn[v] == -1)
        dfs(v, u);
    }
  }

  void get(int root) {
    dfs(root, root);

    std::iota(sdom.begin(), sdom.end(), 0);

    LT_Dsu dsu(n, dfn, sdom);

    for (int i = timer; i >= 2; --i) {
      int w = vertex[i];

      for (auto &v : preds[w]) {
        int u = dsu.eval(v);

        if (dfn[sdom[u]] < dfn[sdom[w]]) {
          sdom[w] = sdom[u];
        }
      }

      dsu.link(parent[w], w);

      bucket[sdom[w]].push_back(w);
      int p = parent[w];

      for (auto &u : bucket[p]) {
        int v = dsu.eval(u);
        idom[u] = (dfn[sdom[v]] < dfn[sdom[u]]) ? v : p;
      }
      bucket[p].clear();
    }

    for (int i = 2; i <= timer; ++i) {
      int w = vertex[i];
      if (idom[w] != sdom[w]) {
        idom[w] = idom[idom[w]];
      }
    }
  }

  std::vector<int> solve(int root) {
    get(root);

    std::vector<int> ans(n + 1, 1);

    for (int i = timer; i >= 2; --i) {
      int w = vertex[i];
      ans[idom[w]] += ans[w];
    }

    return ans;
  }
};

auto main() -> int {
  int n, m;
  std::cin >> n >> m;

  DomTree solver(n);

  for (int i = 0; i < m; ++i) {
    int u, v;
    std::cin >> u >> v;
    solver.add_edge(u, v);
  }

  auto ans = solver.solve(1);

  for (int i = 1; i <= n; ++i) {
    std::print("{}{}", ans[i], " \n"[i == n]);
  }

  return 0;
}
```

## Dominance Frontier

我们构建支配树的最终目的是提升 ir 至 SSA 形式，亦即插入 $\phi$ 节点。而插入 $\phi$ 节点这一步骤需要借助支配边界，支配边界可以由支配树快速计算得出。

如何插入 $\phi$ 节点和消除 $\phi$ 节点以及如何基于 SSA 优化并不是本文的重点，这里仅仅介绍支配边界（dominance frontier）这一概念。

一个节点 $n$ 的支配边界 $DF(n)$ 是满足如下条件的节点 $m$ 集合：

- $n$ 支配 $m$ 的前驱节点。
- $n$ 不严格支配 $m$。

很直观对吧（，构建 $DF(n)$ 也很简单，两个 for 循环的事，~~懒得写了~~。

## Reference

- [oiwiki](https://oi.wiki/graph/dominator-tree/)
- [Luogu 题解](https://www.luogu.com.cn/problem/solution/P5180)
- [Finding Dominators in Practice](https://renatowerneck.wordpress.com/wp-content/uploads/2016/06/gtw06-dominators.pdf)

以及 G 指导的大力支持。

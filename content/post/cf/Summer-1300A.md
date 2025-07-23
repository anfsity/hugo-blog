+++
title = "Summer 1300A"
date = 2025-07-09T21:20:52+08:00
draft = false
author = "Anfsity"
tags = [
    "",
]
categories = [
    "",
]
description = ""
image = ""
hidden = "true"
+++

## $C$ [Social Distance](https://codeforces.com/contest/1367/problem/C)

题本身不难，但是解法众多，特此记录。

### $I.$

直接用双指针扫描，找到一块连续的 0 ， 然后统计答案。

### $II.$

双指针的优化版。计算前缀和，可以根据前缀和判断一个范围里面有没有 1。同样的类似双指针，不过细节会简单一些。

### $III.$

我自己的思路，首先推导出两个 1 之间答案的公式 $\frac{dis}{k + 1} - 1$ ，但是这样会要分类讨论首尾两端有没有 1 的情况，比较麻烦。索性给所有的串在首位两端补上1,然后统计答案即可。

---

## $D$ [Find the Different Ones!](https://codeforces.com/contest/1927/problem/D)

被卡住了的题 $QAQ$

解法是给每个坐标，标记上他之前一个变化的坐标的位置。

这个题应该只有这一种比较简单的做法。不过在此讨论一下这种类型的题。

给定固定数组，查询区间内问题。

不考虑高级数据结构，一般方法是预处理建表，把区间查询转化为端点查询。

具体情况具体分析，但这是一个非常强劲的分析方向。

一个例题

[Iva & Pav](https://codeforces.com/problemset/problem/1878/E)

---

## $F$ [Anton and currency you all know](https://codeforces.com/contest/508/problem/B)

题不难，但是细节较多，这种类型的题还有

[Two Substrings](https://codeforces.com/problemset/problem/550/A)

[Serval and String Theory](https://codeforces.com/contest/2085/problem/A)

[Logical Filling](https://atcoder.jp/contests/abc401/tasks/abc401_d)

[吃饱了才有力气减肥](https://oj.xtu.edu.cn/problem.php?id=1724)

像这种题，一般来说有一定的误导性。会诈骗你往复杂的方向想，你的目标就是想出一个尽可能简洁通用的策略，去解决他。

你会很容易想到一些做法适用某一些情况，但是你这个做法没有抓住题目本质。这种题目本质上是思维题而不是模拟题。

我暂时没有什么成套的方法来解决这一类问题，这种题目的独特性很高。

不过，很重要的一点是构造样例，样例代表你对这个题目的理解程度。整体来说，你应该对这个题目有一个抽象程度上的理解，对这个题目的宏观理解会帮助你解决这道题。

---

## $G$ [Coin Rows](https://codeforces.com/contest/1555/problem/C)

博弈论，很有趣也很难的一个范围。

本题是零和博弈，A先手，B后手。

核心问题在与 A 的决策依赖于 B 的决策，同时 B 的决策依赖于 A 的决策。也就是说，这是一种先手基于后手最优策略来决定自己最优策略的问题。是一种常见的 min-max 架构。

这种问题一般可以用 minmax 暴搜，本题的解法实质上也是一种 minmax， 不过是采用了前缀和和题目本身的特殊性质。

这有几篇文章讲述 minmax 算法

[OI wiki](https://oi-wiki.org/search/alpha-beta/)

[# Alpha Go 系列文 - Minimax算法簡介](https://medium.com/@EltonHorng/alpha-go-%E7%B3%BB%E5%88%97%E6%96%87-minimax%E7%AE%97%E6%B3%95%E7%B0%A1%E4%BB%8B-ad24fd9c40)

[讲明白Minimax算法和α-β剪枝 图解 伪代码](https://zhuanlan.zhihu.com/p/658351019)

---

## $N$ [Divisible Pairs](https://codeforces.com/contest/1931/problem/D)

这是一道利用取模性质的题，不过重点不在这里。这有一个类似的题。

[Yet Another Problem About Pairs Satisfying an Inequality](https://codeforces.com/contest/1703/problem/F)

这种题的模式是，给你一个序偶，他满足一定性质，让你统计他给你的数组里面序偶的个数。

一般来说 <$a_{i}, a_{j}$> 暴力遍历，是 $O(N^2)$ ， $TLE$ 的。常见的一种做法是分离变量，包括这个题，他套着数论的壳子，但是实际思路还是分离变量，把捆绑的 <$a_{i}, a_{j}$> ，变成独立的 $a_{i} ， a_{j}$ 。

但是分离变量的前提是可以同构。或者说，在模式上是有相似性的。这个题就是借着 $mod$ 运算的性质，对 $a_{i}, a_{j}$ 同构。

然后，当这种序偶从二维拓展到三维，也就是 <$a_{i}, a_{j}, a_{k}$> ，如果题目可以满足 $O(N^2)$ 的算法，那么就从 $j$ 开始遍历。如果卡掉 $O(N^2)$ 的算法的话，可能就需要依据题目本身的性质做优化了，又或者使用高级数据结构和神秘算法。

---

## $P$ [We Were Both Children](https://codeforces.com/contest/1850/problem/F)

### $Statement$

给定一个长度为 $n$  的正整数数组 $a=[a_{1},a_{2},\dots,a_{n}]$ ，找出一个整数 $x∈[1,n]$，使得能整除 $x$ 的 $a_{i}$的个数最大。

### $Idea\ I.$

排除 $a$ 中大于 $n$ 的元素，统计 $a$ 中剩余元素的出现次数并存入 $cnt$。然后有所有的 $x \in [1,n]$ ，对 $x$ 因式分解，统计 $x$ 中因子在 $a_{i}$ 中的出现次数。最大值就是答案，时间复杂度为 $O(N^{\frac{3}{2}})$。

### $Idea \ II.$

排除 $a$ 中大于 $n$ 的元素，统计 $a$ 中剩余元素的出现次数并存入 $cnt$。然后新开一个数组 $tmp$ ，$tmp[x]$ 代表 $a_{i}|x$ 的个数。

用类似筛法的操作，对每一个出现过的 $a_{i}$ ，将贡献 ($cnt[a_{i}]$) 加到它所有的倍数上。最后统计最大值。时间复杂度为 $O(N\log N)$ 。


---

## $S$ [Prefix Flip(Easy Version)](https://codeforces.com/contest/1381/problem/A1)

题目给出了一个限制 $3n$ ，像这种类型的贪心题目，如果题目给出在 ** 条件下一定成立。

那么这个条件就是突破口，个人经验是搓几个例子找规律。搓例子的过程中注意到题目操作的独特性质就是这种题目的突破口。

---

+++
title = "Summer 1400B"
date = 2025-08-04T15:42:23+08:00
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
hidden = true
+++

## $A$ [Wonderful Coloring - 2](https://codeforces.com/problemset/problem/1551/B2)

思路不难,但是实现属实是困扰到我了.

过程是 :

- 拿到单一元素对应的所有下标.
- 计算可以用来贡献给染色的颜色数目.
- 此时,总颜色数已知,循环周期已知,颜色对应下标已知,利用取模性质赋值即可.


```C++
void solve() {
    int n, k;
    cin >> n >> k;
    std::map<int, std::vector<int>> cnt;
    for(int i = 0; i < n; ++i) {
        int t;
        cin >> t;
        cnt[t].push_back(i);
    }

    int sum = 0;
    std::vector<int> tmp;
    for(const auto &[x, y] : cnt) {
        int t = std::min<int>(k, y.size());
        sum += t;
        for(int i = 0; i < t; ++i) 
            tmp.push_back(y[i]);
    }
    int need = sum / k * k;

    std::vector<int> ans(n, 0);
    for(int i = 0; i < need; ++i) {
        ans[tmp[i]] = (i % k) + 1;
    }

    for(const int &i : ans) {
        cout << i << " \n"[&i == &ans.back()];
    }
} 
```

---

## $C$ [Ingenuity-2](https://codeforces.com/problemset/problem/1974/D)

显然当 'N' 的数量不等于 'S' , 或者 'E' 的数量不等于 'W' 的时候,问题无解.

由于直升机和机器人必须都被分配,当 $n=2$ 时要特判.

排除不可能的情况之后,剩下的情况绝对有解.

此时 $n \geq 4$ , 'N' + 'E' 的数量一定等于 'S' + 'W' . 这个时候,对其周期 $HR$ 赋值就能满足题意.

---

## $D$ [Sasha and the Casino](https://codeforces.com/problemset/problem/1929/C)

我觉得这个题的难点在于看懂题目 ()

由于题目要求他的钱可以增长到任意值,一旦他赚钱的期望会比本金少.店家就可以通过操作使他的钱小于等于本金.

这就有了约束条件,在操作过程中,每一步的赚钱的期望大于本金.

最后,如果他挺过了亏钱,还要检查一遍他是否能够通过剩余的钱大赚一笔(赢钱超过本金).

```cpp
    i64 cost = 0, rem = a;
    for(int i = 0; i < x; ++i) {
        i64 t = (a - rem) / (k - 1) + 1; 
        cost += t;
        rem = a - cost;
        if(rem <= 0) {
            cout << "No" << nl;
            return ;
        }
    }

    if(rem * k <= a) {
        cout << "No" << nl;
        return ;
    }
```

---

## $E$ [AND Sequences](https://codeforces.com/problemset/problem/1513/B)

组合计数题.

重点是对于这个式子,由于 $\&$ 的性质,可以对下面这个式子变形.

$$
a_1 \: \& \: a_2 \: \& \: \dots \: \& \: a_i = a_{i+1} \: \& \: a_{i+2} \: \& \: \dots \: \& \: a_n,
$$

$$lhs = rhs \rightarrow lhs\ \&\ lhs = rhs\ \&\ lhs \rightarrow lhs = \bigwedge_{i=1}^{n}a_{i}$$

由于 $i$ 逐位递增,这个式子可以接着化简为

$$\forall i \in [1,n] \quad a_{i} = \bigwedge_{i=1}^{n}a_{i}$$
代码易写.

```cpp
void solve() {
    int n;
    cin >> n;
    std::vector<u32> arr(n);
    u32 base = -1;
    for(u32 &i : arr) {
        cin >> i;
        base &= i;
    }

    int cnt = 0;
    for(int i = 0; i < n; ++i) {
        if(arr[i] == base) {
            cnt ++;
        } 
    }

    i64 ans = 1LL * cnt * (cnt - 1) % mod;
    ans = ans * fac[n - 2] % mod;
    
    cout << ans << nl;
}
```

---

## $H$ [Diverse Substrings](https://codeforces.com/problemset/problem/1748/B)

由容斥原理可得, 长度大于 100 的子串都不需要考虑,考虑数据范围,直接暴力.

时间复杂度 $O(100\cdot N)$

```cpp
    i64 ans = 0;
    for(int i = 0; i < n; ++i) {
        int cnt = 0, max = 0;
        std::vector<int> d(10, 0);
        for(int j = i; j < std::min(i + 101, n); ++j) {
            int t = s[j] - '0';
            d[t] ++;
            if(d[t] == 1) cnt ++;

            max = std::max(max, d[t]);
            if(max <= cnt) {
                ans ++;
            }
        }
    }
```

---

## $N$ [Strong Password](https://codeforces.com/problemset/problem/1845/C)

对于 $cf$ 题解的贪心做法,我有不一样的视角.

首先逆向思考,计算所有子序列的情况.

然后对于 $p= p_{0}p_{1}\dots p_{i}$ ,维护一个 $pos$ , 在 $s= s_{0}s_{1}\dots s_{pos}$ 这个子串中,其所有的子序列构成的集合包含 $p$ 的集合 ($p$ 从 $0$ 展开到 $i$ 的所有可能情况) .A

而让 $pos$ 贪心取最小, 这样当 $i = n-1$ 的时候,如果此时 $pos$ 大于 $n$, 就说明 $s$ 所有的子序列集合不完全包含 $p$, 也就是此时一定可以找到一个 $p$, 他不是 $s$ 的子序列. 否则 $p$ 所有的情况被 $s$ 包含, 此时无解.

---

## $P$ [Toy Blocks](https://codeforces.com/problemset/problem/1452/B)

要解决这个题,需要从终态思考.

抽象一下,在这个题中:

 > 我们会得到一个初始态,然后进行任意的操作,得到一个终态,这个终态满足某些性质.然后要求求出最小的操作数.

这种模式在我写过的题里面经常出现.现在总结出一个思路.

本题,首先,最终结果一定是填平终态数组中 $max$,令 $sum$ 为初始态数组和,则 $max \cdot (n-1) \geq sum$. 只需要考虑终态 $max$ 是从初始态的 $max$ 转移,还是新产生一个 $max$ ,若是新产生的 $max$ , 则为 $\left\lceil  \frac{sum}{n-1}  \right\rceil$ .


```cpp
    i64 sum = std::accumulate(a.begin(), a.end(), 0LL);
    i64 max = std::ranges::max(a);

    max = std::max(max, (sum + n - 2) / (n - 1));
    i64 ans = max * (n - 1) - sum;
```

---
 
## $T$ [awoo's Favorite Problem](https://codeforces.com/problemset/problem/1697/C)

我们注意到 'a' 和 'c' 的相对位置不会发生变化,且 'a' 只会向右移动, 'c' 只会向左移动.

有点像物理题.

为什么我注意不到这一点? 首先第一是我没见过这么做的题.第二是我在算法的思维体系里面没有这种思想.第三是我没有指导性的宏观思想.

早在数学中就知道,求变量中的常量,是非常重要的思维.

但是从我开始接触 $cp$ 以来, 一直充斥着大量的 $guess$ ,贪心, 注意力等等技巧性的东西.也因为刷题量的原因,对各类题型没有什么充足的了解.

不过我现在意识到,当初数学上的思维技巧,在算竟上其实是通用的.只不过当初接触大多是代数上的东西,和现在这种题目的风格还是有很大的不同.

不过二者在套路上还是有很大的不同, 毕竟知识体系不同. 像算竟中就不会出现爆算圆锥曲线,平面几何(真不会吗?),导数放缩等等.

虽然现在我还无法使用这种宏观思路来指导做题,但是我也积累了一些小 $trick$ ,罗列如下:

- 对于涉及坐标间的移动, 无论是一维还是二维,都可以考虑相对位移.
- 区间查询问题转化为计算端点(不涉及高级数据结构和分块算法).
- 曼哈顿距离转换成切比雪夫距离.
- 如果当前状态依赖于未来状态,或者说,如果后面的状态不依赖更后面的状态,就该从最终状态向初始状态枚举.
- 有些题目初看是贪心,但实际是枚举.
- 求解 $MEX$ 往往是枚举 $MEX$ ,因为 $MEX$ 不会超过块长.
- 有些时候,枚举结果会比计算结果更优.
- 正向求解复杂,考虑逆向.
- 唯一分解定理在某些数论题里面很好用,也就是说,把数字当成因数的积对写题有很好的指导作用.
- 将耦合变量独立出来,再利用 $map$ , 二分, 双指针等来计算值.
- 有些题目的性质是缺失的,就是说,如果我为他加上某些条件,他反而可以用一个统一的套路去处理. 也就是常见的配方, 凑项思路.
- 将题目简单化或者复杂化,或者考虑理想情况,最坏情况,其他情况,又或者将题目情况分解. 这都是十分有效的处理方式.

更多的时候, 做题依赖于过往写题的经验,依赖于长期做题形成的直觉.这些 $trick$ 只是对思考的一些启示作用,而最终决定题目的解法的,依然是问题本身的内在结构和独特性质.


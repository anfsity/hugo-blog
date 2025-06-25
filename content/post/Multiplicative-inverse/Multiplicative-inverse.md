+++
title = "Multiplicative Inverse"
date = 2025-05-25T13:59:19+08:00
draft = false
author = "Anfsity"
tags = ["Algorithm"]
categories = ["Algorithm"]
description = "乘法逆元"
image = ""
+++

# 简介

在算法竞赛中， 常常出现让答案对一个大质数进行取模的运算。由于模运算的性质，可以很容易的计算加法和减法。但是对于乘法，需要一些特殊的处理，这就是乘法逆元。

# 定义

 > 我们把 $a^{-1}$ 叫作 $a \bmod p$ 的乘法逆元， 如果满足 $a\cdot a^{-1} \equiv 1 \pmod p$。
 
 <!-- > [!note]- 扯淡 -->
 > 在高中数学中， 如果 $b\cdot b^{-1}=1$， 就把 $b^{-1}$ 叫作 $b$ 的倒数， 即 $a / b = a\cdot b^{-1}$。
 > 
 > 乘法逆元与之类似， 起到相似的作用。只不过作用域在 $\bmod p$ 下。
 
 
# 求解逆元

---
## 朴素枚举

由模运算的性质知道 $x \equiv y \pmod p\ 肯定有\ 0\leq y\leq p-1$ 。

从 $1$ 到 $p-1$ 枚举判断是否有 $i$ 满足 $a\cdot i \equiv 1 \pmod p$。

时间复杂度为 $O(P)$ 。

这个方法的唯一优点就是简单易想。

---
## 费马小定理 

- 表述
 > 如果 $gcd(a,p)=1$ 则  $a^{p-1}\equiv 1 \pmod p$。

 <!-- > [!hint]- 证明 -->
 > 关于费马小定理的证明有很多种，这里给出一种我认为最优雅的一种证明。
 >
 > 考虑两个序列 :
 >
 > $i:[1,2,3,\dots,p-1]$
 >
 > $j:[a,2a,3a, \dots,(p-1)a]$
 >
 > 现在证明 $i,j$ 在 $\bmod p$ 意义下同构。
 >
 > 也就是证明 $j$ 序列中两两不同在 $\bmod p$ 意义下。
 >
 > 假设 $j$ 序列中满足 $xa \equiv ya \pmod p \ (1\leq x,y\leq p-1，x，y不同)$， 由模运算的性质得 $x \equiv y \pmod p$， 由于 $1\leq x,y\leq p-1$ ， $x \text{只能等于} y$ ， 假设不成立，原命题得证。
 >
 > 然后，我们把 $i，j$ 序列乘起来得到 $(p-1)!\cdot a^{p-1} \equiv (p-1)! \pmod p$ ，$gcd((p-1)!,p)=1$，那么也就是 $a^{p-1}\equiv 1 \pmod p$。

看向乘法逆元的定义 $：a\cdot a^{-1} \equiv 1 \pmod p$， 对费马小定理进行变形得到 $a\cdot a^{p-2} \equiv 1 \pmod p$，这就说明 $a^{p-2}$ 是 $a$ 的乘法逆元。注意者只有在 $p$ 是质数的时候成立。

对于计算 $a^{p-2}$ ，可以用快速幂做到在 $O(log(p-2))$ 计算。

- 快速幂 : 

``` C++
i64 binpow(i64 base, int exp, int mod) {
    i64 res = 1;
    base %= mod;
    while(exp) {
        if(exp & 1) 
            res = res * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return res;
}
```

---
## 拓展欧几里得算法


``` C++
void Exgcd(int a, int b, int &x, int& y) {
    if(b == 0) {
        x = 1, y = 0;
        return ;
    }
    Exgcd(b, a % b, y, x);
    y -= a / b * x;
}

```


---
## 线性递推

想象一下，如果你仅仅知道拓欧和费马小定理，你能不能想到可能存在一种 $O(N)$ 的方法求出逆元，我想不出。

不过如果有人告诉你，存在一种方法，可以在线性时间内求出 $N$ 范围内的逆元，你会怎么去思考？

如果是线性时间的话，那么我就要在 $O(1)$ 内求出一个数的逆元，要么我知道一个公式可以直接计算出逆元，要么我可以通过递推方程来得出，要么我可以通过某种方式均摊到 $O(1)$。

很明显，直接套公式有点不太现实，费马没想到，欧拉没想到，他们都没想到，我不太认为我自己可能会想到。而且完全没有思路，不是吗？直觉告诉我，递推是最有可能的方案。

不妨试一试，令 $i\ 是\ 1\dots n$ 里面的任意一个数， $base$ 情况是 $1^{-1} \equiv 1 \pmod p$ 。

$$
i^{-1} \equiv \begin{cases}
    1,                                           & \text{if } i = 1, \\
    某种已知 情况, & \text{otherwise}.
\end{cases} \pmod p
$$

我们大胆猜测这个已知情况和一个小于 $i$ 的数有关，让我们想一想，哪里可以弄到小于 $i$ 的数又和 $i$ 有关呢？

正巧，注意到 $p = k\cdot i + r$， 这个 $r$ 不就小于 $i$ 吗？ (注意到这个不是没有理由的， 我们已知的信息就只有 $p,i$ ， 而把一个数写成 $ki+x$ 的形式在 $\bmod$ 里是非常常见的，因为模运算就是这么定义的。)

让我们来好好把玩把玩她 $: p=k\cdot i+r$ ，$r=p\%i$。

先对等式两边取模得到
$$\begin{gathered}
0 \equiv k\cdot i+r\ (\bmod p)  \\
\end{gathered}
$$
移项
$$\begin{gather}
-k\cdot i \equiv r \ (\bmod p)
\end{gather}
$$
乘 $i^{-1}$
$$
-k \equiv r \cdot i^{-1} \pmod p
$$
把 $i^{-1}$ 拆出来
$$
i^{-1} \equiv -k\cdot r^{-1} \pmod p
$$
代换 $r$
$$
i^{-1} \equiv -k\cdot (p\%i)^{-1} \pmod p
$$
重写 $k$ 
$$
i^{-1} \equiv -\left\lfloor  \frac{p}{i}  \right\rfloor\cdot (p\%i)^{-1} \pmod p
$$
改成正数
$$
i^{-1} \equiv (p-\left\lfloor  \frac{p}{i}  \right\rfloor)\cdot (p\%i)^{-1} \pmod p
$$

哈哈，这是什么，我们得到了一个式子，她完美的符合我们的猜想。

$$
i^{-1} \equiv \begin{cases}
    1,                                           & \text{if } i = 1, \\
    i^{-1} \equiv (p-\left\lfloor  \frac{p}{i}  \right\rfloor)\cdot (p\%i)^{-1}, & \text{otherwise}.
\end{cases} \pmod p
$$

``` C++
std::vector<i64> Inv(N, 1);
const int mod = 998244353;
void Inverse() {
    Inv[1] = 1;
    for(int i = 2; i < N; ++i) {
        Inv[i] = ((i64)(mod - mod / i) * Inv[mod % i]) % mod;
    }
}
```

写出这个 $code$ ，易如反掌。 

不过这么写只能求出 $1\dots n$ 的逆元，如果求给定任意 $a_{i}\dots a_{i+n}$ 这 $n$ 个数的逆元，就要换种方法。

利用类似前缀和的思想，首先计算 $n$ 个数的前缀积，记为 $s_i$，然后使用快速幂或扩展欧几里得法计算 $s_n$ 的逆元，记为 $sv_n$。

因为 $sv_n$ 是 $n$ 个数的积的逆元，所以当我们把它乘上 $a_{i+n}$ 时，就会和 $a_{i+n}$ 的逆元抵消，于是就得到了 $a_i$ 到 $a_{i+n}$ 的积逆元，记为 $sv_{n-1}$。

同理我们可以依次计算出所有的 $sv_i$，于是 $a_i^{-1}$ 就可以用 $s_{i-1} \times sv_i$ 求得。

所以我们就在 $O(n + \log p)$ 的时间内计算出了 $n$ 个数的逆元。

``` C++
i64 modInv(i64 t) {
    return binpow(t, mod - 2, mod);
}

void Inverse(int n) {
    std::vector<i64> S(n + 1, 0), sInv(n + 1, 0);
    S[0] = 1;
    for(int i = 1; i <= n; ++i) {
        S[i] = S[i - 1] * arr[i - 1] % mod;
    }
    sInv[n] = modInv(S[n]);
    for(int i = n; i >= 1; --i) {
        sInv[i - 1] = sInv[i] * arr[i - 1] % mod;
    }

    for(int i = 0; i < n; ++i) {
        inv[i] = sInv[i + 1] * S[i] % mod;
    }
}
```

---

 > 本文部分内容参考自 [OIwiki](https://oiwiki.org/math/number-theory/inverse/#%E7%BA%BF%E6%80%A7%E6%B1%82%E9%80%86%E5%85%83) 

 > 本文采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh) 国际许可协议进行许可。

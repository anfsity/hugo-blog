+++
title = "Multiplicative Inverse"
date = 2025-05-25T13:59:19+08:00
lastmod = 2025-08-20T13:35:19+08:00
draft = false
author = "Anfsity"
tags = ["Algorithm"]
categories = ["Algorithm"]
description = "乘法逆元"
image = ""
+++
## 简介

在算法计算中, 常常由于数据原因对答案进行大数取模. 对于加法和减法, 处理起来相对容易, 但是对于除法来说, 就较为复杂. 为了解决这个问题, 我们来探讨一下乘法逆元.

### 定义

 > 我们把 $a^{-1}$ 叫作 $a \bmod p$ 的乘法逆元, 如果满足 $a\cdot a^{-1} \equiv 1 \pmod p$.

 > 在高中数学中, 如果 $b\cdot b^{-1}=1$, 就把 $b^{-1}$ 叫作 $b$ 的倒数,  即 $\frac{a}{b} = a\cdot b^{-1}$.
 > 
 > 乘法逆元的定义与之类似. 只不过作用域在 $\bmod p$ 下.
 
 
## 求解逆元

---
### 朴素枚举

由模运算的性质知道 $x \equiv y \pmod p$ 必有 $\ 0\leq y\leq p-1$ 。

我们可以从 $1$ 到 $p-1$ 枚举判断是否有 $i$ 满足 $a\cdot i \equiv 1 \pmod p$。

线性时间复杂度, 方法的优点是简单易想, 缺点嘛, 显而易见.

---
### 费马小定理 

 > 如果 $gcd(a,p)=1$ 则  $a^{p-1}\equiv 1 \pmod p$。

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
 > 也就是说,  如果二者都有序, 序列 $i$ 和 序列 $j$ 在 $\bmod p$ 意义下是完全相同的. 
 >
 > 假设 $j$ 序列中存在 $xa \equiv ya \pmod p \ (1\leq x,y\leq p-1，x \neq y)$， 由模运算的性质得 $x \equiv y \pmod p$， 由于 $1\leq x,y\leq p-1$ $x$ 一定等于 $y$. 假设不成立，原命题得证。
 >
 > 然后，我们把 $i，j$ 序列乘起来得到 $(p-1)!\cdot a^{p-1} \equiv (p-1)! \pmod p$ ，由于$gcd((p-1)!,p)=1$，化简为 $a^{p-1}\equiv 1 \pmod p$。

看向乘法逆元的定义 $：a\cdot a^{-1} \equiv 1 \pmod p$， 对费马小定理进行变形得到 $a\cdot a^{p-2} \equiv 1 \pmod p$，这就说明 $a^{p-2}$ 是 $a$ 的乘法逆元。注意者只有在 $p$ 是质数的时候成立。

对于计算 $a^{p-2}$ ，可以用快速幂做到在 $O(log(p-2))$ 计算。

- 快速幂 : 

``` C++
i64 qpow(i64 base, i64 exp, i64 mod) {
    if(exp == 0) 
        return 0LL;
    i64 res = 1;
    while(exp) {
        if(exp & 1) 
	        res = static_cast<i128>(res) * base % mod;
        base = static_cast<i128>(base) * base % mod;
        exp >>= 1;
    }
    return res;
}
```

---
### 拓展欧几里得算法

拓展欧几里得算法是对欧几里得算法的拓展.  用来求解满足[Bézout's identity](https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity)的不定方程$a\cdot x + b \cdot y=gcd(a, b)$ 的解.

对于这个方程 $$a\cdot x + b \cdot y=gcd(a, b)$$
稍做变形, 有 $$a\cdot x \equiv gcd(a, b) \pmod b$$在 $b$ 为质数的情况下,  $x$ 为 $a$ 的逆元.

显然, $x=1,\ y=114514$ 是在 $b=0$ 时满足情况的一组解().

现在假设我们已知 $x_{0},y_{0}$ 是当前状态的一组解, 令当前计算的 $gcd$ 为 $gcd(a', b')$ , 上一个方程为 $gcd(a, b)$ . 有 $b'=a\ \bmod \ b,\ a'=b$ .

也就是 $$\begin{aligned}
& x \cdot a + y \cdot b = gcd(a,b) \\
& x_{0} \cdot a' + y_{0} \cdot b' = gcd(a', b')
\end{aligned}$$
那么 $$x_{0} \cdot b + y_{0} \cdot(a\ \bmod \ b) = gcd(a', b') = gcd(a, b)$$
化简 $$x_{0} \cdot b + y_{0} \cdot\left( a - \left\lfloor  \frac{a}{b}  \right\rfloor \cdot b  \right) =gcd(a, b)$$
移项 $$y_{0} \cdot a + \left( x_{0} - \left\lfloor  \frac{a}{b}  \right\rfloor \cdot y_{0} \right) \cdot b = gcd(a, b)$$
新的解 $x,y$ 为 $x = y_{0}, \ y = x_{0} - \left\lfloor  \frac{a}{b}  \right\rfloor \cdot y_{0}$. 

```cpp
template <typename T>
constexpr std::tuple<T, T, T> Exgcd(const T &a, const T &b) {
    if(b == T{}) {
        return {a, T{1}, T{}};
    }
    auto [gcd, x0, y0] = Exgcd(b, a % b);
    T x = y0, y = x0 - (a / b) * y0;
    return {gcd, x, y};
}

template <typename T>
constexpr T normalize(T x, T mod) {
    x %= mod;
    if(x < 0) {
        x += mod;
    }
    return x;
}

template <typename T>
constexpr T Inv(T val, T mod) {
    auto [gcd, x, y] = Exgcd<decltype(mod)>(val, mod);
    assert(gcd == T{1} && "The modular inverse does not exist.");
    return normalize(x);
}

```

---
### 线性递推

想象一下, 如果你的知识储备不够充裕, 你能否凭空想出一种 $O(1)$ 的算法来求解逆元. 这恐怕十分困难.

不过如果有人告诉你，存在一种方法，可以在线性时间内求出连续 $N$ 范围内的逆元，你会怎么去思考？

如果是线性时间的话，那要么我在 $O(1)$ 内求出一个数的逆元，要么我知道一个公式可以直接计算出逆元，要么我可以通过递推方程来得出，要么我可以通过某种方式均摊到 $O(1)$。

明显，直接套公式有点不太现实，费马没想到，欧拉没想到，他们都没想到，我不太认为我自己可能会想到。直觉告诉我，递推是最有可能的方案。

不妨试一试，令 $i\ 是\ 1\dots n$ 里面的任意一个数， $base$ 情况是 $1^{-1} \equiv 1 \pmod p$ 。

$$
i^{-1} \equiv \begin{cases}
    1,                                           & \text{if } i = 1, \\
    \text{a previous situation}, & \text{otherwise}.
\end{cases} \pmod p
$$

我们大胆猜测这个已知情况和一个小于 $i$ 的数有关，让我们想一想，哪里可以存在小于 $i$ 的数又和 $i$ 有关呢？

不妨注意到 $p = k\cdot i + r$， 这个 $r$ 不就小于 $i$ 吗？ (注意到这个不是没有理由的， 我们已知的信息就只有 $p,i$ ， 而把一个数写成 $ki+x$ 的形式是一个非常常见的技巧. )

让我们来好好把玩把玩这个等式 $: p=k\cdot i+r$ ，$r=p \bmod i$。

先对等式两边取模得到
$$
0 \equiv k\cdot i+r \pmod p
$$
移项
$$
-k\cdot i \equiv r \pmod p
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
i^{-1} \equiv -k\cdot (p \bmod i)^{-1} \pmod p
$$
重写 $k$ 
$$
i^{-1} \equiv -\left\lfloor  \frac{p}{i}  \right\rfloor\cdot (p \bmod i)^{-1} \pmod p
$$
改成正数
$$
i^{-1} \equiv (p-\left\lfloor  \frac{p}{i}  \right\rfloor)\cdot (p \bmod i)^{-1} \pmod p
$$

哈哈，这是什么，我们得到了一个式子，它完美的符合我们的猜想。

$$
i^{-1} \equiv \begin{cases}
    1,                                           & \text{if } i = 1, \\
    (p-\left\lfloor  \frac{p}{i}  \right\rfloor)\cdot (p \bmod i)^{-1}, & \text{otherwise}.
\end{cases} \pmod p
$$

``` C++
constexpr std::vector<i64> Inv(N, 1);
constexpr int mod = 998244353;
void Inverse() {
    Inv[1] = 1;
    for(int i = 2; i < N; ++i) {
        Inv[i] = ((i64)(mod - mod / i) * Inv[mod % i]) % mod;
    }
}
```

写出这个 $code$ ，易如反掌。 

不过这么写只能求出 $1\dots n$ 的逆元，如果求给定任意 $a_{i}\dots a_{i+n}$ 这 $n$ 个数的逆元，就要稍稍变通一下.

利用类似前缀和的思想，首先计算 $n$ 个数的前缀积，记为 $s_i$，然后使用快速幂或扩展欧几里得法计算 $s_n$ 的逆元，记为 $sv_n$。

因为 $sv_n$ 是 $n$ 个数的积的逆元，所以当我们把它乘上 $a_{i+n}$ 时，就会和 $a_{i+n}$ 的逆元抵消，于是就得到了 $a_i$ 到 $a_{i+n-1}$ 的积逆元，记为 $sv_{n-1}$。

同理我们可以依次计算出所有的 $sv_i$，于是 $a_i^{-1}$ 就可以用 $s_{i-1} \times sv_i$ 求得。

所以我们就在 $O(n + \log p)$ 的时间内计算出了 $n$ 个数的逆元。

``` C++
i64 modInv(i64 t) {
    return binpow(t, mod - 2, mod);
}

void Inverse(int n) {
    std::vector<i64> S(n + 1, 1), sInv(n + 1, 0);
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

## 模板化

显然每次都重新编写这些是没有必要的, 而且这些内容十分适合模板化.

编写成静态类 $ModInt$.

```cpp
template <auto mod>
class ModInt {
private :
    static_assert(mod >= 1LL, "The modulus must be a positive integer.");
    using T = decltype(mod);
    T value;
    static constexpr std::tuple<T, T, T> Exgcd(const T &a, const T &b) {
        if(b == T{}) {
            return {a, T{1}, T{}};
        }
        auto [gcd, x0, y0] = Exgcd(b, a % b);
        T x = y0, y = x0 - (a / b) * y0;
        return {gcd, x, y};
    }
public :
    constexpr ModInt() : value(T{}) {}

    template <typename V>
    constexpr ModInt(const V &v) {
        value = (static_cast<T>(v % mod) + mod) % mod;
    }

    constexpr ModInt inv() const {
        auto [gcd, x, y] = Exgcd(value, mod); // It could be hold that -mod < x < mod.
        assert(gcd == T{1} && "The modular inverse does not exist.");
        return ModInt(x);
    }

    // calculation operator overloading
    constexpr ModInt operator-() const {
        return ModInt(value == 0 ? 0 : mod - value);
    }

    constexpr ModInt& operator+=(const ModInt &rhs) {
        value += rhs.value;
        value %= mod;
        return *this;
    }

    constexpr ModInt& operator-=(const ModInt &rhs) {
        value += mod;
        value -= rhs.value;
        value %= mod;
        return *this;
    }

    constexpr ModInt& operator*=(const ModInt &rhs) {
        value = static_cast<T>((static_cast<i128>(value) * rhs.value) % mod);
        return *this;
    }

    constexpr ModInt& operator/=(const ModInt &rhs) {
        *this *= rhs.inv();
        return *this;
    } 

    friend constexpr ModInt operator+(const ModInt &a, const ModInt &b) {
        ModInt res = a;
        res += b;
        return res;
    }

    friend constexpr ModInt operator-(const ModInt &a, const ModInt &b) {
        ModInt res = a;
        res -= b;
        return res;
    }

    friend constexpr ModInt operator*(const ModInt &a, const ModInt &b) {
        ModInt res = a;
        res *= b;
        return res;
    }

    friend constexpr ModInt operator/(const ModInt &a, const ModInt &b) {
        ModInt res = a;
        res /= b;
        return res;
    }

    // bool operator overloading 
    friend constexpr bool operator>(const ModInt &a, const ModInt &b) {
        return a.value > b.value;
    }

    friend constexpr bool operator>=(const ModInt &a, const ModInt &b) {
        return a.value >= b.value;
    }

    friend constexpr bool operator<(const ModInt &a, const ModInt &b) {
        return a.value < b.value;
    }

    friend constexpr bool operator<=(const ModInt &a, const ModInt &b) {
        return a.value <= b.value;
    }

    friend constexpr bool operator==(const ModInt &a, const ModInt &b) {
        return a.value == b.value;
    }
 
    friend constexpr bool operator!=(const ModInt &a, const ModInt &b) {
        return a.value != b.value;
    }

    // stream operator overloading
    friend std::ostream& operator<<(std::ostream &os, const ModInt &x) {
        os << x.value;
        return os;
    }
 
    friend std::istream& operator>>(std::istream &is, ModInt &x) {
        T v;
        if(is >> v) {
            x = ModInt(v);
        }
        return is;
    }
};

constexpr i64 mod = 1'000'000'007LL;
using Z = ModInt<mod>;

template <typename T>
Z mpow(Z base, T exp) {
    assert(exp >= 0);
    Z res = 1;
    while(exp > 0) {
        if(exp & 1) 
            res *= base;
        base *= base;
        exp >>= 1;
    }
    return res;
}
```

动态模数还没写 ...

---

 > 本文部分内容参考自 [OIwiki](https://oiwiki.org/math/number-theory/inverse/#%E7%BA%BF%E6%80%A7%E6%B1%82%E9%80%86%E5%85%83) 

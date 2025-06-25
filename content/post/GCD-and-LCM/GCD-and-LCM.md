---
title: "GCD and LCM"
date: 2025-04-21T22:35:59+08:00
draft: false
author: "Anfsity"
tags: [Math]
categories: [
"Algorithm",
"Math",
]
description: ""
---
> [!quote] A fine quotation is a diamond on the finger of a man of wit, and a pebble in the hand of a fool.
 > — Joseph Roux


我们要证明的等式是：
$$
\gcd(\operatorname{lcm}(a,b), \operatorname{lcm}(a,c)) = \operatorname{lcm}(a, \gcd(b,c))
$$

---

## 基础：唯一分解定理（算术基本定理）

证明的关键在于使用唯一分解定理。该定理指出，任何大于 1 的整数都可以唯一地分解为素数的乘积（不考虑顺序）。

**形式一：**
对于 $\forall n \in \mathbb{Z}, n > 1$，存在唯一的不同素数集合 $\{p_1, \dots, p_k\}$ 和唯一的正整数指数集合 $\{\alpha_1, \dots, \alpha_k\}$ 使得：
$$
n = p_1^{\alpha_1} p_2^{\alpha_2} \cdots p_k^{\alpha_k} = \prod_{i=1}^{k} p_i^{\alpha_i}
$$

**形式二（更适用于证明）：**
对于 $\forall n \in \mathbb{Z}, n > 1$，其分解可以写成包含所有素数的形式：
$$
n = \prod_{p \text{ prime}} p^{\nu_p(n)}
$$
其中 $\nu_p(n)$ 是素数 $p$ 在 $n$ 分解中的（非负）指数。对于给定的 $n$，只有有限个 $\nu_p(n)$ 大于 0。

---

## 使用素数指数表示 GCD 和 LCM

根据唯一分解定理，我们可以通过比较整数分解中每个素数 $p$ 的指数来计算最大公约数 (gcd) 和最小公倍数 (lcm)：

*   对于任意素数 $p$：
    *   $p$ 在 $\gcd(x, y)$ 中的指数是 $\nu_p(\gcd(x, y)) = \min(\nu_p(x), \nu_p(y))$
    *   $p$ 在 $\operatorname{lcm}(x, y)$ 中的指数是 $\nu_p(\operatorname{lcm}(x, y)) = \max(\nu_p(x), \nu_p(y))$

**例子：**
设 $a = 12 = 2^2 \cdot 3^1 \cdot 5^0$
设 $b = 30 = 2^1 \cdot 3^1 \cdot 5^1$

*   **计算 $\gcd(12, 30)$:**
    -   素数 2: 指数 $\min(2, 1) = 1$
    -   素数 3: 指数 $\min(1, 1) = 1$
    -   素数 5: 指数 $\min(0, 1) = 0$
    -   所以 $\gcd(12, 30) = 2^1 \cdot 3^1 \cdot 5^0 = 6$

*   **计算 $\operatorname{lcm}(12, 30)$:**
    -   素数 2: 指数 $\max(2, 1) = 2$
    -   素数 3: 指数 $\max(1, 1) = 1$
    -   素数 5: 指数 $\max(0, 1) = 1$
    -   所以 $\operatorname{lcm}(12, 30) = 2^2 \cdot 3^1 \cdot 5^1 = 60$

---

## 证明过程

我们的策略是证明对于任意素数 $p$，它在等式左边 (LHS) 和右边 (RHS) 的指数都相等。根据唯一分解定理，如果所有素数的指数都对应相等，则这两个数必然相等。

设对于任意素数 $p$，其在 $a, b, c$ 中的指数分别为 $\alpha = \nu_p(a)$, $\beta = \nu_p(b)$, $\gamma = \nu_p(c)$。

**1. 计算 LHS 中 $p$ 的指数：**
LHS = $\gcd(\operatorname{lcm}(a,b), \operatorname{lcm}(a,c))$
*   $p$ 在 $\operatorname{lcm}(a,b)$ 中的指数为 $\max(\alpha, \beta)$。
*   $p$ 在 $\operatorname{lcm}(a,c)$ 中的指数为 $\max(\alpha, \gamma)$。
*   根据 gcd 的指数规则， $p$ 在 LHS 中的指数为：
    $$ \nu_p(\text{LHS}) = \min(\max(\alpha, \beta), \max(\alpha, \gamma)) $$

**2. 计算 RHS 中 $p$ 的指数：**
RHS = $\operatorname{lcm}(a, \gcd(b,c))$
*   $p$ 在 $\gcd(b,c)$ 中的指数为 $\min(\beta, \gamma)$。
*   根据 lcm 的指数规则，$p$ 在 RHS 中的指数为：
    $$ \nu_p(\text{RHS}) = \max(\alpha, \min(\beta, \gamma)) $$

**3. 证明指数相等：**
我们需要证明 $\nu_p(\text{LHS}) = \nu_p(\text{RHS})$，即：
$$ \min(\max(\alpha, \beta), \max(\alpha, \gamma)) = \max(\alpha, \min(\beta, \gamma)) $$
这个等式是 $\min$ 和 $\max$ 运算的一个基本性质，称为分配律。这里用到的是 **max 对 min 的分配律**:
$$ \max(x, \min(y, z)) = \min(\max(x, y), \max(x, z)) $$
令 $x = \alpha$, $y = \beta$, $z = \gamma$，我们直接应用此分配律：
$$ \max(\alpha, \min(\beta, \gamma)) = \min(\max(\alpha, \beta), \max(\alpha, \gamma)) $$
这表明 $\nu_p(\text{RHS}) = \nu_p(\text{LHS})$。

**结论：**
由于对于任意素数 $p$，它在等式两边的指数都相等，根据唯一分解定理，这两个表达式代表的整数必然相等。

因此，原等式 $\gcd(\operatorname{lcm}(a,b), \operatorname{lcm}(a,c)) = \operatorname{lcm}(a, \gcd(b,c))$ 成立。

$Q.E.D.$

---

# 算术基本定理及其证明

> **算术基本定理 (Fundamental Theorem of Arithmetic):**
> 任何大于 1 的整数 $n$ 都可以被唯一地分解成有限个素数的乘积（不考虑因子的顺序）。
> 即：对于任意整数 $n > 1$，存在唯一的不同素数集合 $\{p_1, \dots, p_k\}$ 和唯一的正整数组 $\{\alpha_1, \dots, \alpha_k\}$ 使得：
> $$ n = p_1^{\alpha_1} p_2^{\alpha_2} \cdots p_k^{\alpha_k} = \prod_{i=1}^{k} p_i^{\alpha_i} $$

---

## 证明

证明分为两部分：存在性和唯一性。

### 第一部分：存在性证明（强归纳法）

我们要证明任何整数 $n > 1$ 都可以写成素数的乘积。

1.  **基础情况:** 当 $n=2$ 时，2 本身是素数，已是素数乘积。成立。
2.  **归纳假设:** 假设对于所有满足 $1 < k < n$ 的整数 $k$，$k$ 都可以表示成素数的乘积。
3.  **归纳步骤:** 考虑整数 $n$：
    *   **情况 A:** 如果 $n$ 是素数，则它已是素数乘积。
    *   **情况 B:** 如果 $n$ 是合数，则 $n = a \cdot b$，其中 $1 < a < n$ 且 $1 < b < n$。根据归纳假设，$a$ 和 $b$ 都可以写成素数乘积：
        $$ a = p_1 p_2 \cdots p_r $$
        $$ b = q_1 q_2 \cdots q_s $$
        其中所有 $p_i, q_j$ 都是素数。那么：
        $$ n = a \cdot b = (p_1 \cdots p_r)(q_1 \cdots q_s) $$
        这表明 $n$ 也可以写成素数的乘积。

根据强归纳法，存在性得证。

### 第二部分：唯一性证明（使用欧几里得引理和反证法）

我们需要用到一个关键引理：

> **欧几里得引理 (Euclid's Lemma):**
> 如果素数 $p$ 整除乘积 $ab$ (记作 $p | ab$)，那么 $p$ 必须整除 $a$ 或 $p$ 必须整除 $b$ (即 $p | a$ 或 $p | b$)。
> *推论:* 如果素数 $p$ 整除 $a_1 a_2 \cdots a_k$，则 $p$ 至少整除其中一个 $a_i$。

**证明唯一性（反证法）：**

1.  **假设:** 假设存在大于 1 的整数拥有至少两种不同的素数分解。根据良序原则（最小数原理），必然存在一个*最小*的这样的整数，记为 $n$。
2.  **分析 $n$:** 设 $n$ 有两种不同的分解：
    $$ n = p_1 p_2 \cdots p_r = q_1 q_2 \cdots q_s $$
    其中 $p_i$ 和 $q_j$ 都是素数，并且作为多重集（考虑重复次数） $\{p_1, \dots, p_r\} \neq \{q_1, \dots, q_s\}$。由于 $n$ 是最小的反例，任何小于 $n$ 的整数 $m > 1$ 的素数分解是唯一的。
3.  **应用引理:** 考虑 $p_1$。显然 $p_1 | n$，所以 $p_1 | (q_1 q_2 \cdots q_s)$。根据欧几里得引理的推论，$p_1$ 必须整除某个 $q_j$。因为 $p_1$ 和 $q_j$ 都是素数，这只可能在 $p_1 = q_j$ 时发生。
4.  **约去公共因子:** 不失一般性，重排 $q$ 使得 $p_1 = q_1$。等式两边同除以 $p_1$：
    $$ \frac{n}{p_1} = p_2 p_3 \cdots p_r = q_2 q_3 \cdots q_s $$
5.  **导出矛盾:** 令 $m = n/p_1$。因为 $n$ 是合数（否则分解唯一），所以 $1 < m < n$。我们得到了整数 $m$ 的两种分解 $p_2 \cdots p_r$ 和 $q_2 \cdots q_s$。由于 $\{p_1, \dots, p_r\}$ 和 $\{q_1, \dots, q_s\}$ 不同，去掉相同的 $p_1=q_1$ 后，$\{p_2, \dots, p_r\}$ 和 $\{q_2, \dots, q_s\}$ 也必定不同。
    这表明 $m$ 是一个比 $n$ 更小的、拥有不同素数分解的整数。这与 $n$ 是具有此性质的*最小*整数的假设相矛盾！
6.  **结论:** 初始假设错误。因此，任何整数 $n > 1$ 的素数分解是唯一的（在不考虑顺序时）。

$Q.E.D.$




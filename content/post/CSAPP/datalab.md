+++
title = "DataLab"
date = 2025-06-27T21:24:03+08:00
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

## 总览

最终结果，看到这个的时候属实不易。原本以为我已经很熟悉二进制了，但是看来还得多练啊。

```text
Correctness Results	Perf Results
Points	Rating	Errors	Points	Ops	Puzzle
1	1	0	2	8	bitXor
1	1	0	2	1	tmin
1	1	0	2	7	isTmax
2	2	0	2	7	allOddBits
2	2	0	2	2	negate
3	3	0	2	10	isAsciiDigit
3	3	0	2	7	conditional
3	3	0	2	5	isLessOrEqual
4	4	0	2	6	logicalNeg
4	4	0	2	36	howManyBits
4	4	0	2	13	floatScale2
4	4	0	2	15	floatFloat2Int
4	4	0	2	4	floatPower2

Score = 62/62 [36/36 Corr + 26/26 Perf] (121 total operators)
```

实验要求：

 - 所有变量声明必须在函数最开始，禁止全局变量。

 - 你只能使用指定的操作符来完成对应的函数。

 - 禁止使用 LLM ，禁止 cheat 。

虽然这么说，但是我也不建议一直死磕他。实在写不出来就去看题解，最重要的是搞懂他们。

### bitXor

```C 
/* 
 * bitXor - x^y using only ~ and & 
 *   Example: bitXor(4, 5) = 1
 *   Legal ops: ~ &
 *   Max ops: 14
 *   Rating: 1
 */
int bitXor(int x, int y) {
  int a = ~x & y;
  int b = x & ~y;
  return ~(~a & ~b);
}
```

> 这个较为简单，只要学了数理逻辑就行。没学也可以画韦恩图。

### tmin

```C
/* 
 * tmin - return minimum two's complement integer 
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {

  return (1 << 31);

}
```

> 知道 $0x80000000$ 就是 INT_MIN，把 $1$ 左移 $31$ 位就行。

### isTmax

```C
/*
 * isTmax - returns 1 if x is the maximum, two's complement number,
 *     and 0 otherwise 
 *   Legal ops: ! ~ & ^ | +
 *   Max ops: 10
 *   Rating: 1
 */
int isTmax(int x) {
  return !(~(x + 1 + x) | !(x + 1));
}
```

> 注意到当 $x$ 为 INT_MAX 的时候，满足 $x + 1 + x = 0$ 。不过直接这么做的话， $btest$ 会给你当 $x=-1$ 时的 $hack$，排除这个就 $ok$ 了。

### allOddBits

```C
/* 
 * allOddBits - return 1 if all odd-numbered bits in word set to 1
 *   where bits are numbered from 0 (least significant) to 31 (most significant)
 *   Examples allOddBits(0xFFFFFFFD) = 0, allOddBits(0xAAAAAAAA) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 2
 */
int allOddBits(int x) {
    int a = 170;
    a = a | (a << 8);
    a = a | (a << 16);
    return !((a & x) ^ a);
}
```

> 思路是通过倍增 $10$ 构造出 $0xAAAAAAAA$，再用这个数去判断 $x$ 是否所有的偶数位都为 $1$。这里 $170$ 是 $0xAA$。

### negate

```C
/* 
 * negate - return -x 
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
  return ~x + 1;
}
```

> 烂熟于心

### isAsciiDigit

```C 
//3
/* 
 * isAsciiDigit - return 1 if 0x30 <= x <= 0x39 (ASCII codes for characters '0' to '9')
 *   Example: isAsciiDigit(0x35) = 1.
 *            isAsciiDigit(0x3a) = 0.
 *            isAsciiDigit(0x05) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 3
 */
int isAsciiDigit(int x) {
  int a = x + ~0x30 + 1;
  int b = 0x39 + ~x + 1;
  a >>= 31;
  b >>= 31;
  return !(a | b);
}
```

> $rating=3$ 的难度马上就体现出来了。
> 
> 思路是把这个不等式分解为 $x - \texttt{0x30} \ge 0$ 和 $\texttt{0x39} - x \ge 0$ 这两个条件。这样，问题就转化为判断 $a$ 和 $b$ 的符号位是否都为 $0$。

### conditional

```C
/* 
 * conditional - same as x ? y : z 
 *   Example: conditional(2,4,5) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 16
 *   Rating: 3
 */
int conditional(int x, int y, int z) {
  int t = !x;
  t = (t << 31) >> 31;
  return ((~t) & y) + (t & z);
}
```

> 翻译一下这个条件，$ans = ([x = 1] \cdot y + [x=0] \cdot z)$ ，其中 $[\ p \ ]$  是艾弗森记号，有$$\begin{cases}
0 & p为假 \\
1 & p为真
\end{cases}$$。这个转化并不难，重要的是，怎么构造出这个互斥的结构。这里最妙的是这个 $code:$ $(t << 31) >> 31$ 。 当 $$\begin{cases}
-1 & t = 1 \\
0 & t = 0
\end{cases}$$ ，巧妙的利用了 int 类型的算术右移。因为不能使用乘号，就只能使用二进制全为 1 或 0 来达到乘号的效果。

### isLessOrEqual

```C
/* 
 * isLessOrEqual - if x <= y  then return 1, else return 0 
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  int t = y + (~x + 1);
  t = t >> 31;
  return !t;
}
```

> 这个和 isAsciiDigit 差不多。我是先把这个想出来才把 isAsciiDigit 做出来的。🥹

### logicalNeg

```C
/* 
 * logicalNeg - implement the ! operator, using all of 
 *              the legal operators except !
 *   Examples: logicalNeg(3) = 0, logicalNeg(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4 
 */
int logicalNeg(int x) {
  int f = (x >> 31) & 1;
  int Tmax = ~(1 << 31);
  return (f ^ 1) & (((Tmax + x) >> 31 & 1) ^ 1);
}
```

> 这是我最开始的版本。首先排除掉 x < 0 的情况，再利用整型溢出排除掉 x > 0 的情况。

```C
int logicalNeg(int x) {
    int sign = (x >> 31) | ((~x + 1) >> 31);
    return sign + 1;
}
```

> 这是我认为实现非常优雅的版本。
>
> 这个版本简洁的多。我们可以注意到这个性质，除了 0 ，其他任何数中自身和相反数必有一个是负数，甚至两个都是负数。
> 那么，我只要让 x 自身的符号位和它相反数的符号位 或 起来，就可以判断这个数是不是 0。而且，由于右移的性质， sign 的表达式一定是 0 和 -1 
> 中的一个。且当且仅当 x 为 0 时， sign 为 0。
> 
> 这一个就很难想出来了。

### howmanyBits

```C
/* howManyBits - return the minimum number of bits required to represent x in
 *             two's complement
 *  Examples: howManyBits(12) = 5
 *            howManyBits(298) = 10
 *            howManyBits(-5) = 4
 *            howManyBits(0)  = 1
 *            howManyBits(-1) = 1
 *            howManyBits(0x80000000) = 32
 *  Legal ops: ! ~ & ^ | + << >>
 *  Max ops: 90
 *  Rating: 4
 */
int howManyBits(int x) {
  int b16, b8, b4, b2, b1, b0; // 检查的位数。
  int sign = x >> 31;
  x = (x & ~sign) | (~x & sign);

  b16 = !!(x >> 16) << 4;
  x >>= b16;

  b8 = !!(x >> 8) << 3;
  x >>= b8;

  b4 = !!(x >> 4) << 2;
  x >>= b4;

  b2 = !!(x >> 2) << 1;
  x >>= b2;

  b1 = !!(x >> 1); 
  x >>= b1;

  b0 = x;
  return b16 + b8 + b4 + b2 + b1 + b0 + 1; // 1 是额外的符号位
}
```

> 根据直觉，这道题显然可以用二分查找👻。好吧，其实是如果要快速定位，也只有二分查找行得通。
>
> 我建议一步一步的思考。首先，先不管负数如何，
> 我先想办法把正数搞出来。根据二分的思路，我先检查上 16 位和下 16 位。如果在上 16 位，我就把它右移到下 16 位来，然后检查 8 位... 
> 
> 注意到这个模式，是无
> 后效性的。也就是说，这是一个可以反复套用自身的一个过程。
> 
> 那这就简单了，我只需要想出 (我先检查上 16 位和下 16 位。如果在上 16 位，我就把它右移到下 16 位来) 这一步的思路，其他的就是 cv 的事了。
> 
> 以 32 位为例，先检查上 16 位，如果上 16 位不存在 1, 那我不需要右移，如果上 16 位存在 1, 那么我就右移。把前半部分的状态定义为 0 (如果上 16 位不存在 1)
> 后半部分定义为 1 (上 16 位存在 1 )，这个就是 !!(x >> 16) ,对右移 16 位的 x 两次取 !
>
> 这下正数的部分搞定了，负数和正数只有符号位不一样。所以只要把负数变成正数，就是和正数一样的套路。

### floatScale2

```C
/* 
 * floatScale2 - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatScale2(unsigned uf) {
    unsigned sign = uf & (1 << 31);
    unsigned exp = (uf >> 23) & 0xff;
    unsigned frac = uf & 0x7fffff;

    if(exp == 0xff) {
        return uf;
    }

    if(exp == 0) {
        frac <<= 1;
    } 

    if(exp != 0) {
        exp += 1;
    }

    uf = sign | (exp << 23) | frac;
    return uf;
}
```

> 搞清楚 IEEE754 浮点数的表示方法，这有一篇[文章](https://zhuanlan.zhihu.com/p/343049681)，或者好好的把教材读明白。
> 
> 这个题不需要考虑当输入为规格数返回为 NaN 的情况，单纯的实现 2.0 * f 这个功能就行。
>
> 浮点数是由 sign + exp + frac 组成的，拆成这几个部件后，独立思考这道题，我认为是可以做出来的。

### floatFloat2Int

```C
/* 
 * floatFloat2Int - Return bit-level equivalent of expression (int) f
 *   for floating point argument f.
 *   Argument is passed as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point value.
 *   Anything out of range (including NaN and infinity) should return
 *   0x80000000u.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
int floatFloat2Int(unsigned uf) {
    unsigned sign = (uf >> 31) & 1;
    int exp = (uf >> 23) & 0xff;
    signed frac = uf & 0x7fffff | 0x800000;
    int temp = exp - 127;

    if(temp > 31) {
        return 0x80000000u;
    }

    if(temp < 0) {
        return 0;
    }

    temp = (temp > 23) ? (frac << (temp - 23)) : (frac >> (23 - temp)); // 这里的左移和右移动手画画就出来了。

    return sign ? -temp : temp;
}
```

> 这里的 frac 默认是规格数的尾数 + 前面的 1。这个题没有什么坑点和难点，题意就是让你把浮点型翻译成 32 位整型。

### floatPower2

```C
/* 
 * floatPower2 - Return bit-level equivalent of the expression 2.0^x
 *   (2.0 raised to the power x) for any 32-bit integer x.
 *
 *   The unsigned value that is returned should have the identical bit
 *   representation as the single-precision floating-point number 2.0^x.
 *   If the result is too small to be represented as a denorm, return
 *   0. If too large, return +INF.
 * 
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. Also if, while 
 *   Max ops: 30 
 *   Rating: 4
 */
unsigned floatPower2(int x) {
    int exp = x + 127;
    if(exp <= 0) {
        return 0;
    }

    if(exp >= 0xff) {
        return 0x7f800000; // 都写到这里了，不会不知道 0x7f800000 是什么吧
    }

    return exp << 23;
}
```

> 这个应该是 rating 为 4 里面最简单的一个题了😂。只要能弄懂前面两个题，那就没有做不出这道题的理由。

## 小结

可以多看一些别人的题解，可能别人的解法也会让你有所收获。不要想着仅仅做出来就行，要做的优雅😏。

CSAPP 不愧是 CMU 的镇系之宝，难度和质量都无可挑剔。

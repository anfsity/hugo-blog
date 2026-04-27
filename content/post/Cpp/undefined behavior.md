+++
title = "C++ 的魔法契约： Undefined Behavior"
date = 2026-01-13T20:27:02+08:00
draft = false
author = "Anfsity"
tags = [
    "C++",
]
categories = [
    "C++",
]
description = ""
image = ""
+++

在 C 和 C++ 中，有一个叫做 ub (undefined behavior) 的概念，你也许听说过他，视他为洪水猛兽。但打败敌人的第一步往往需要先了解他，那么首先， ub 是什么呢？

## Introduction

[标准](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/n4950.pdf)[^1]上面给出的定义是这样的：

![](/post/Cpp/images/Pasted%20image%2020260113171505.png)

未定义行为，即标准对该程序运行结果不施加任何要求，其运行可以为任何结果，也无需保持一致或给出诊断。换句话说，如果你运行了一个包含未定义行为的程序，那么下一刻，你的程序可能会崩溃，你的内存可能会爆炸，世界有可能被外星人入侵。因为其行为是“未定义的”，所以你无法否认：上面的事件都有可能发生。

如果你还没有认识到 ub 存在的危险性，我们先来看一个经典的代码：

```cpp
void contains_null_check(int *P) {
  int dead = *P;
  if (P == 0)
    return;
  *P = 4;
}
```

这个代码看起来人畜无害，但实际上他可能导致外星人入侵。

```cpp
void contains_null_check(int *P) {
  int dead = *P;  // 动作 A: 解引用 P (读取值)
  if (P == 0)     // 动作 B: 检查 P 是否为空
    return;
  *P = 4;         // 动作 C: 再次使用 P (写入值)
}
```

在进行 `int dead = *p` 这个语句时，如果 `p == nullptr` ，这就是 ub ，一旦 ub 发生，之后的任何行为都不再受标准约束，因此编译器可以把后面的 null check 当作“在所有定义良好的执行路径上都不可能为真”来推理并删掉。当然，编译器也可能在发生 ub 后生成向宇宙广播的代码。

```cpp
void contains_null_check(int *P) {
  int dead = *P;  // 动作 A: 解引用 P (读取值)
  *P = 4;         // 动作 C: 再次使用 P (写入值)
}
```

然后再进行死代码消除（DCE）：

![](/post/Cpp/images/Pasted%20image%2020260112220704.png)

> 事实上，在 gcc 之前的版本，gcc （-O2）不会产生这样的汇编，但是 gcc 15.2 产生了。

这是 Evil 啊~（~~激动~~）。

当然，编译器也有可能先进行死代码消除，这导致程序会进行空指针检查：

```cpp
void contains_null_check(int *P) {
  if (P == 0)     // 动作 B: 检查 P 是否为空
    return;
  *P = 4;         // 动作 C: 再次使用 P (写入值)
}
```

ub 最可怕的不是“会崩”，而是它让编译器获得了更强的推理权：一旦某条路径触发 ub，优化器就可以把这条路径当作不存在，从而重排、删除你以为必要的逻辑。

更可怕的是，这样的代码放不胜防，因为同样的代码，在 clang 或 gcc 下都有可能正常编译运行，也有可能发生：当编译器升级后，原来跑的好好的程序突然崩溃了。

 > 目前 clang，gcc 对 cpp 一致性支持比较好，至于 msvc，它太坏了。

哪怕是世界上最聪明的程序员，也无法百分百肯定自己不会写出 ub 的代码。

---
## 行为类别

事实上，C++ 标准不仅定义了什么是 UB，还构建了一套完整的行为类别（Behavior Categories）。为了搞清楚 UB 的边界，我们需要先理清以下几个[标准术语](https://en.cppreference.com/w/cpp/language/ub.html)。


| 术语                                    | Who decides? | 编译器行为                      | 确定性         | 经典案例                                                | 后果                           |
| :------------------------------------ | :----------- | :------------------------- | :---------- | :-------------------------------------------------- | :--------------------------- |
| **Well-defined**                      | Standard | 必须严格生成对应代码                 | 100% 确定     | `std::vector<int> v;`                               | 程序按预期运行，全平台一致。               |
| **Ill-formed**                        | Standard | 必须报错 (Diagnostic required) | N/A         | `void f(int) { return "s"; }`                       | 编译失败。                        |
| **IFNDR** (Ill-formed, no diagnostic) | Standard | 无义务                        | 不确定         | 违反 ODR 原则；某些模板特化错误                                  | 链接错误，或者运行时莫名其妙崩溃。            |
| **Implementation-defined**            | Compiler | 必须在文档中说明                   | 确定 (对特定编译器) | `sizeof(long)`；`FILE*` 的底层类型                        | 代码不可移植，但在特定环境下行为稳定。          |
| **Unspecified**                       | Compiler | 无需说明，甚至无需一致                | 每次编译可能不同    | `foo(unique_ptr(new A), unique_ptr(new B))` 谁先 new？ | 不要写依赖这种行为的代码，否则难以调试。         |
| **Undefined Behavior (UB)**           | None     | 无义务，可做任何事                  | 无限的可能 「」    | 数组越界；解引用空指针；有符号数溢出                                  | Nasal Demons。逻辑被删除、死循环、安全漏洞。 |

我们可以这么理解，对于 `well-defined` ， `ill-formed` ，`IFNDR` 这种由标准进行定义的行为类别来说，其运行结果是唯一确定的，你写下这个代码（比如 `println("{}", 1 + 2)`），无论是在 windows，linux 还是 mac 上编译运行，他的运行结果都是一样的（都是 3），该报错报错，~~无论是在哪个世界线上，都会导向唯一确定的终结~~。

如果说，`well-defined` 和 `ill-formed` 与程序的行为结果是一个严格的一对一的单射，那么，`implementation-defined` 和 `unspecified` 就是一对多的有界集合映射。

标准对其规定了，我不保证你结果是唯一确定的，但是你的结果必须要落在我给出的这几个可能结果里面，比如 `sizeof(int)` ，他可以是 4 也可以是 8，但他不能是 114514 。

对 `implementation-defined` 来说，其在 x 平台下的行为是会在文档里面准确说明的，但对于 `unspecified` 来说，其行为就是未知但会落在一个确定的范围里面，比如经典的函数求值顺序 `foo(A(), B())` ，他是处于量子态的，可能我今天是先 `A` 再 `B` ，明天就可能逆转。但无论如何，在不考虑异常和函数内部的 ub 的情况下，`A` 和 `B` 都会执行完成并把返回值传递给 `foo`。

> 在 C++17 之前，A 和 B 的执行甚至是可以交错的（比如 A 执行了一半去执行 B）。C++17 规定了求值是 Indeterminately sequenced（不确定顺序），即要么先完整做 A，要么先完整做 B，不再允许交错，但具体谁先谁后依然是 unspecified。

这些行为的结果取决于平台，编译器，硬件等等因素，相同的代码在不同的编译器编译出来的产物运行结果可能不同。

`undefined behavior` 就如之前所说，你无法知道其行为到底会产生什么结果。

---

## UB 存在的理由

为什么一定要有 ub 存在呢？为什么不像 jvav，py 一样把所有行为定义清楚？这样不就会非常 safe 了？

你说的没错，这样确实会 safe 一些，那么，代价是什么呢？

c++ 是静态编译，对性能非常敏感的语言，其设计原则之一是：零成本抽象（Zero-overhead Principle）。

举一个简单的例子：

```cpp
void foo(int x) {
	if (x > x + 1) {
		// process x
	}
	// ...
}
```

编译器假设 x 永远不会发生溢出，因为溢出是未定义行为，在良好定义下，这个语句永远为 `false`。编译器就有可能，把这个分支判断彻底删除。

在 jvav 等程序中，整数溢出通常被定义为补码回环（Wrap-around），他不允许编译器删除这个 if，这个 if 在特定情形下会被执行。这意味着，每次运行到这里，cpu 都有可能浪费一些时钟周期。如果在循环内，这也会阻止编译器进行 simd 等优化。

正是因为这是一个 ub，所以编译器才会对其进行优化。编译器优化的前提是，程序员不会写出包含 ub 的代码。

换句话说，ub 是编译器和程序员的契约，编译器假设程序员永远不会写出包含 ub 的代码，这样编译器才能够让程序运行的尽可能的快。

这些微小的优化（DCE，RNCE 等等），对性能的影响是巨大的，面对性能和安全这两个永恒的矛盾点，c/cpp 做出了他的 trade off。

其次，程序在理论上和现实上差距是巨大的，现实世界的种种因素导致程序几乎不可能在所有的硬件平台上保持一致性，对于那些不好定义，甚至无法定义的行为，不妨统一归属于 ub，这既方便，又高效。

> 更多关于 ub 的例子参见 cppreference - [Undefined behavior](https://en.cppreference.com/w/cpp/language/ub.html)。

---

## 如何检查 ub

cpp 程序员无法避免他写出包含 ub 的代码，所以只能尽可能少些可能包含 ub 的代码，或是使用工具。

> 笔者未亲自使用过静态分析工具，资料参考自外部。

- 开启编译器的全部警告，`-Wall -Wextra -Werror -Wshadow` 等等。
- 使用静态代码分析工具，`clang-tidy cppcheck PVS Studio` 等等。
- 在运行时捕获 ub，也就是所谓的 `sanitizers` ，比如 `asan` 抓取内存错误，`ubsan` 尽可能检查 ub 等等。
- 尽可能少些可能导致 ub 的代码，遵循编程范式，多用 modern cpp。

---
## Reference

- [What Every C Programmer Should Know About Undefined Behavior #1/3](https://blog.llvm.org/2011/05/what-every-c-programmer-should-know.html)
- [What Every C Programmer Should Know About Undefined Behavior #2/3](https://blog.llvm.org/2011/05/what-every-c-programmer-should-know_14.html)
- [What Every C Programmer Should Know About Undefined Behavior #3/3](https://blog.llvm.org/2011/05/what-every-c-programmer-should-know_21.html)
- [Undefined behavior](https://en.cppreference.com/w/cpp/language/ub.html)
- [Working Draft, Standard for Programming Language C++](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/n4950.pdf)

---

 > 笔者才疏学浅，文章可能存在错误和纰漏，请谨慎阅读。
 >
 > 值得一提的是，在工业界极致的性能优化中，确实存在一些利用‘UB 假设’来辅助编译器生成的黑魔法（例如利用 std::unreachable() 消除分支，或是早年著名 3D 引擎中的 Fast Inverse Square Root 算法）。受限于笔者目前的经验与本文篇幅，这部分高阶内容暂不展开。

[^1]: 准确来说，这是标准 ISO/IEC 14882:2024 的草案 n4950。

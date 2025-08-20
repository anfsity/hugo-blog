+++
title = "Macro in C/CPP"
date = 2025-08-06T12:36:02+08:00
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

## Encounter

起因是因为这么一段代码

```C
#define trace(...) \
    RecursionTracer tracer_##__LINE__(__func__, #__VA_ARGS__, ##__VA_ARGS__)
```

在我多次调用的时候,出现了如下报错

```cpp
int f(int x) {
    trace(x);
    if(x == 1) {
        return 1;
    }
    int res = x * f(x - 1);
    trace(x, res);
    return res;
}
```

```zsh
clang++ -std=c++23 -g -Wall -Wextra new.cpp -o new
new.cpp:55:5: error: redefinition of 'tracer___LINE__'
   55 |     trace(x, res);
      |     ^
./debug.hpp:213:21: note: expanded from macro 'trace'
  213 |     RecursionTracer tracer_##__LINE__(__func__, #__VA_ARGS__, ##__VA_ARGS__)
      |                     ^
<scratch space>:328:1: note: expanded from here
  328 | tracer___LINE__
      | ^
new.cpp:47:5: note: previous definition is here
   47 |     trace(x);
      |     ^
./debug.hpp:213:21: note: expanded from macro 'trace'
  213 |     RecursionTracer tracer_##__LINE__(__func__, #__VA_ARGS__, ##__VA_ARGS__)
      |                     ^
<scratch space>:326:1: note: expanded from here
  326 | tracer___LINE__
      | ^
1 error generated.
make: *** [Makefile:10: new] Error 1
```

这个时候我对宏还几近一无所知, 对于这样违背常识的报错感到很困惑. 查阅资料解决问题后便决定写一篇这篇文章.

---
## C preprocessor

我们知道, 你写下的 C/C++ Code 从源代码到可执行文件一般会经历四个步骤 :

![https://www.tenouk.com/ModuleW.html](https://i.111666.best/image/XOLRpVHwSR4HluruQsA30b.png)

稍微详细一点的内容可以查阅这篇文章[The four stages of the gcc compiler: preprocessor, compiler, assembler, linker.](https://medium.com/@gpradinett/the-four-stages-of-the-gcc-compiler-preprocessor-compiler-assembler-linker-3dec8714bb9c)

C preprocessor 是一个 text file processor ( 文本文件处理器 ), 提供主要四个功能[^1] : 

- file inclusion (文件包含)
- macro expansion (宏展开)
- conditional compilation (条件编译)
- line control 

而 C preprocessor 就是在第一个阶段 ( 预编译 ) 发挥作用的强大工具.

不过要注意的是, C preprocessor 仅仅是一个文本处理器, 它并不明白 C/C++ 的语法, 这在很多时候, 会导致一些危险的行为.

在源代码中, preprocessor 的指令以 `#` 开头.

---
## Features

### File inclusion

C 预处理器中有两个用于包含文件内容的指令 :

- `#include`, [source file inclusion](https://en.cppreference.com/w/cpp/preprocessor/include.html).
- `#embed`, [resource inclusion](https://en.cppreference.com/w/cpp/preprocessor/embed.html).

#### Source file inclusion

就是常见的 `#include <iostream>`, C 预处理器会将 `iostream` 里面的内容包含到源代码中. 需要注意的是, 这种包含是逻辑上的. 事实上, 为了加速处理过程, `iostream` 里面的内容不会完整的替换到你的源代码中.

对于系统文件一般使用 `<>`, 对于自己构建的文件, 使用 `""` . C 预处理器可能会针对这种不同的区别使用不同的搜索算法.

#### Resource inclusion

在 C23 和 C++26 中引入 `#embed` 指令, 可在代码中使用 `#embed` 插入二进制源文件.

### Conditional compilation

可以理解成适用 C 预处理器的 `if-else` 结构.

比如 : 

```C++
#ifdef VERBOSE
	std::cerr << "trace message" << std::endl;
#endif
```

这里有文档介绍[Conditional compilation](https://www.cs.auckland.ac.nz/references/unix/digital/AQTLTBTE/DOCU_078.HTM)

### Macro string replacement

直观上的来讲, 宏就是一个 snippet, 经过 C preprocessor 处理后, 会展开成一段更长的文本.

#### Object-like

*object-like* macro 定一个别名, 最终预处理器将其替换为实际内容. 它不接受参数, 没有办法参数化. 例如 :

```C++
#define PI 3.14
#define int long long
```

#### Function-like

*function-like* macro 支持传入参数, 也可以让参数为空. 例如 :

```Cpp
#define MAX(a, b) std::max(a, b)
```

### Operators

#### Defined operator

`defined` 是一个一元谓词, 表示当 ** 宏被定义时, `defined` 为真, 否则为假. 

以下两种方式都可以调用 :

```cpp
#if defined(MY_MACRO)
#if defined MY_MACRO
```

#### Token stringification operator

`#` 是一个 operator, 代表一个运算, 而不是一个标识. `#` 将一个标记转化为一个字符串, 并且会自动添加转义符号.比如 :

```C++
#define str(s) #s
```

`str(\n)` expands to `"\n"` and `str(p = "foo\n";)` expands to `"p = \"foo\\n\";"`.

```C++
#define print(var) std::cout << #var << " : " << (var) << std::endl;
```

#### Token concatenation

也就是 `##` , `##` 作为一个 operator, 把两个标记连接成一个. 也就是把两个字符串拼接. 比如 :

```c++
#define DECLARE_STRUCT_TYPE(name) typedef struct name##_s name##_t
```
 
`DECLARE_STRUCT_TYPE(g_object)` expands to `typedef struct g_object_s g_object_t`.

---
## The order of expansion

除了上面提到过的那些, 还有一些常见的 features, 比如 预定义宏, `#warning` , Line control 之类的.

不过, 现在可以把目光放回最开始的那个 bug 了.

我的本意是想要自动创建一个独一无二的对象, 但是编译器提醒我们, 重复定义了 `tracer__LINE__` . 我们发现, `__LINE__` 根本没有展开 !

原因在于, 宏展开的顺序.

*function-like* 宏以如下顺序展开[^2]:

- Stringification operations are replaced with the textual representation of their argument's replacement list (without performing expansion).
- Parameters are replaced with their replacement list (without performing expansion).
- Concatenation operations are replaced with the concatenated result of the two operands (without expanding the resulting token).
- Tokens originating from parameters are expanded.
- The resulting tokens are expanded as normal.

事实上, 我不推荐这么理解, 参考下面这个例子 :

```
#define EXAMPLE(name) origin #name suffix b##name

EXAMPLE(example)
```

这个展开里面既包含 `#` 又包含 `##`, 如果套用这个五步公式. 你会发现你看不懂这五句话在说什么. (说的就是我)

我们这么理解 :

```
#define EXAMPLE(name) origin #(name) suffix b##(name)

origin "example" suffix bexample
```

简单来说, `#` 和 `##` 由于是一个操作符, 他会首先执行自己该做的事. 在我的代码中 `tracer##__LINE__` 会被展开成 `tracer__LINE__`, 而不是这样 `tracer##__LINE__` 变成 `tracer##7` 再 `tracer7`.

我们发现, 由于 operator 的特殊性,  `__LINE__` 并没有展开. 而解决方案是, 先把 `__LINE__` 展开, 再套用进去. 也就是编写一个辅助宏, 先展开 `__LINE__`, 再使用 `##` 操作符.

也就是说, 问题其实是因为 `##` 执行的优先级比展开 `__LINE__` 的优先级高.

其实这些理解起来并不困难, 但是我陷入了之前那五个步骤的定性框架, 总是想用那五个步骤来理解宏的展开顺序.

这种做法太过偏执, 他没有证据证明他说的是对的, 我也没有证据证明他说的是对的.

理解客观物理上到底发生了什么, 是个很有意思的东西, 但是这件事情本身已经脱离了我想要讨论的范围.

只要不影响我对于宏本身的运用和理解, 就没有必要探究这种无意义的事.

```C++
#define TRACE_EXPAN(counter) tracer_##counter
#define TRACE_HELPER(counter) TRACE_EXPAN(counter)

#define trace(...) \
    RecursionTracer TRACE_HELPER(__COUNTER__)(__func__, #__VA_ARGS__, ##__VA_ARGS__)
```

btw, 关于那五个步骤, 在 C11 的草案 [N1570](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf) 的 6.10.3.2 的最后一句 :

 > The order of evaluation of # and ## operators is unspecified.

---
## References

[^1]: 参考自[维基百科](https://en.wikipedia.org/wiki/C_preprocessor#)
[^2]: 参考自[维基百科](https://en.wikipedia.org/wiki/C_preprocessor#Macro_string_replacement)

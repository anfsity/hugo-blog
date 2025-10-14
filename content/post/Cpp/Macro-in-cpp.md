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
lastmod = 2025-10-15T00:52:02
+++

{{< quote source="Fly To Meteor (Milthm Edit)" url="https://www.youtube.com/watch?v=n5lNIpzoizI">}}
Around the right track baby we ain't going back
{{< /quote >}}

## Encounter
---

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

这个时候我对宏还几近一无所知, 对于这样违背常识的报错感到很困惑. 查阅资料解决问题后便决定写一篇总结。

## C preprocessor
---

我们知道, 你写下的 C/C++ Code 从源代码到可执行文件一般会经历四个步骤 :

![https://www.tenouk.com/ModuleW.html](https://i.111666.best/image/br8h4kjHDvngzdxCwDAp6R.png)

 > 细节可以查阅这篇文章[The four stages of the gcc compiler: preprocessor, compiler, assembler, linker.](https://medium.com/@gpradinett/the-four-stages-of-the-gcc-compiler-preprocessor-compiler-assembler-linker-3dec8714bb9c)

C preprocessor 是一个 text file processor ( 文本文件处理器 ), 它主要在编译过程的第一个阶段 --预处理阶段-- 对源代码文件进行操作，主要提供四个功能[^1] : 

- file inclusion (文件包含)
- macro expansion (宏展开)
- conditional compilation (条件编译)
- line control 

不过要注意的是, C preprocessor 仅仅是一个文本处理器, 它并不明白 C/C++ 的语法, 这在很多时候, 会导致一些危险的行为。

## Features
---

### File inclusion

C 预处理器中有两个用于包含文件内容的指令 :

- `#include`, [source file inclusion](https://en.cppreference.com/w/cpp/preprocessor/include.html).
- `#embed`, [resource inclusion](https://en.cppreference.com/w/cpp/preprocessor/embed.html).

#### Source file inclusion

就是常见的 `#include <iostream>`, C 预处理器会将 `iostream` 里面的内容包含到源代码中。

对于标准库和系统级头文件一般使用 `<>`, 对于本地或者用户自定义的头文件, 则使用 `""` . C 预处理器会针对这种形式上的不同使用不同的搜索策略。

#### Resource inclusion

在 C23 和 C++26 中引入 `#embed` 预处理指令, 允许你在编译期间将二进制文件的内容嵌入到源代码当中，生成一个静态的常量数组。

### Conditional compilation

可以理解成适用 C 预处理器的 `if-else` 结构.

比如 : 

```C++
#ifdef VERBOSE
	std::cerr << "trace message" << std::endl;
#endif
```

  > 相关文档介绍[Conditional compilation](https://www.cs.auckland.ac.nz/references/unix/digital/AQTLTBTE/DOCU_078.HTM)

### Macro string replacement

直观上的来讲, 宏就是一个 snippet 的别名, 在预处理阶段， C preprocessor 会扫描源代码，将所有的宏替换成其预先定义好的内容。

#### Object-like

*object-like* macro 定一个别名, 最终预处理器将其替换为实际内容. 它不接受参数, 没有办法实例化. 例如 :

格式为 `# define identifier replacement-list new-line`

```C++
#define PI 3.14
#define int long long
```

#### Function-like

*function-like* macro 行为类似于函数，定义的宏后面必须紧跟一对括号，不能有空格。支持传入参数, 也可以让参数为空. 例如 :

```Cpp
#define MAX(a, b) std::max(a, b)
```

### Operators

#### Defined operator

*defined* 是一个一元谓词, 表示当 `**` 宏被定义时, *defined* 为真, 否则为假. 

一下两种方式都可以调用 *defined* :

```cpp
#if defined(MY_MACRO)
#if defined MY_MACRO
```

#### Token stringification operator

`#` 是一个 operator, 代表一个运算, 而不是一个标识. `#` 将一个标记转化为一个字符串, 并且会自动添加转义符号.比如 :

```C++
#define str(s) #s
```

 > `str(\n)` expands to `"\n"` and `str(p = "foo\n";)` expands to `"p = \"foo\\n\";"`.

```C++
void printFunctionName(std::string s) { 
	//... 
}

void foo() {
	//...
	printFunctionName(#__func__);
}
```

#### Token concatenation

也就是 `##` , `##` 作为一个 operator, 把标记两个标记连接成一个. 也就是把两个字符串拼接. 比如 :

```c++
#define DECLARE_STRUCT_TYPE(name) typedef struct name##_s name##_t
```
 
 > `DECLARE_STRUCT_TYPE(g_object)` expands to `typedef struct g_object_s g_object_t`.

## The order of expansion
---

除了上面提到过的那些, 还有一些常见的 features, 比如 预定义宏, `#warning` , *Line control* 之类的。

不过, 这些都不重要！现在我们把目光放回最开始的那个 bug 。

我的本意是想要自动创建一个独一无二的对象, 但是编译器提醒我们, 重复定义了 `tracer__LINE__` . 根据编译的报错提示，我们发现，问题的根源在于 `__LINE__` 根本没有展开 。

接下来就是本节的难点了。

### Object-like Macro Expansion

首先来思考这样一个问题，考虑如下代码 ：

```cpp
#define A B
#define B A
```

在我们使用宏 A 的时候，会不会无限展开下去呢？

答案是肯定不会的。

我们用一个例子来说明 *object-like* Macro 的递归展开规则 ：

```cpp
#define arg1 arg1 | arg2 | arg3
#define arg2 arg1 2
#define arg3 arg2 3

arg1
// 被展开为 arg1 | arg1 2 | arg1 2 3
```

![image](https://i.111666.best/image/utSQCn0nuItiL3SK7qjfKa.png)

递归定义 `U` 表示 ：「从递归的上一层的 U 与上一个宏的并集」, 最开始 `U` 被定义为 $∅$ ，表示当前宏不是被任何其他宏展开得来的。

- 第一步，`arg1` 维护的 `U` 是空集，将 `arg1 (1)` 展开为 `arg1 | arg2 | arg3 (2)`， 这里对应图里的第一个 `expand` 。
- 第二步，我们从左向右扫描，首先遇到 `arg1 (2)` ，他的维护的集合已经包含了 `{arg1}` ，那么 `arg1 (2)` 就不应该被展开，它保持原样。接着遇到 `|` ，`|` 不是宏，跳过。然后我们遇到第二个宏 `arg2 (2)` , 他维护的集合 `{arg1}` 不包括 `arg2` ，`arg2 (2)` 被展开为 `arg1 2` 。跳过 `|` ，展开 `arg3 (2)` 为 `arg2 3` ，此时 `arg3` 维护的集合变成 `{arg1, arg3}` 。
- 第三步，展开从上一个 `arg3` 继承来的 `arg2 (3)` ，它维护的集合是 `{arg1, arg3}` ，将其展开为 `arg1 1` 。

展开过程结束，最终结果为 `arg1 | arg1 2 | arg1 2 3` 。

可以发现，整个递归过程构成一颗先序遍历的递归树。我们可以用这种方式很好的理解整个 *object-like* 宏的展开规则。

回到先前的 case ：

```cpp
#define A B
#define B A
```

那么答案就很显然了，依赖于使用的宏是 `A` 还是 `B` ，而且只会被展开一次。

### Function-like Macro Expansion

*function-like* 宏以如下顺序展开[^2]:

- Stringification operations are replaced with the textual representation of their argument's replacement list (without performing expansion).
- Parameters are replaced with their replacement list (without performing expansion).
- Concatenation operations are replaced with the concatenated result of the two operands (without expanding the resulting token).
- Tokens originating from parameters are expanded.
- The resulting tokens are expanded as normal.

还有一个额外的特性：

- 每次展开结束后，identifier 会向后看一个 token 判断是否构成一个新的 *function-like*  宏。[^3]

我们来看几个例子来解释这几个步骤 ：

 1. 

```cpp
#define COMMA ,
#define CALL(f, args) f(args)
#define FUNC(a, b) a - b

CALL(FUNC, 1 COMMA 2)
// 1 - 2

#define EMPTY
#define FOO(a, b) a + b
#define BAR(x)    FOO x

BAR((1, 2))
// 1 + 2
```

参数优先展开。

首先展开 `CALL` ，`f` 对应 `FUNC`, `args` 对应 `1 COMMA 2` , `COMMA` 是宏，优先展开为 `,` ，展开后变成 `FUNC(1, 2)` 。

每次展开结束后，identifier 会向后看一个 token 判断是否构成一个新的 *function-like*  宏。

然后重新扫描，发现 `FUNC(1, 2)` 可以被宏匹配，展开为 `1 - 2`。

2. 

```cpp
#define STRINGIZE_IMPL(x) #x
#define STRINGIZE(x)      STRINGIZE_IMPL(x)

#define CAT_IMPL(a, b) a##b
#define CAT(a, b)      CAT_IMPL(a, b)

#define VAL 123

// STRINGIZE(VAL) -> "123"
// STRINGIZE_IMPL(VAL) -> "VAL"
// CAT(VAL, VAL) -> 123123
// CAT_IMPL(VAL, VAL) -> VALVAL
```

参数列表里的参数会被优先展开。但如果该参数在替换列表中被 # 或 ## 所调用，那么该参数不展开。

`STRINGIZE(VAL)` 被展开为 "123" ，但是 `STRINGIZE_IMPL(VAL)` 就会先展开为 `#VAL` 再展开为 `"VAL"` 。

`CAT` 同理。

3. 

```cpp
#define A(x) B(x)
#define B(y) A(y)

A(1) 
// A(1)
```

过程和 *object-like* 一样，首先 `A(1)` 的禁用集 (U) 是 $∅$，被展开为 `B(1)` ， U 中添加 `{A}` ，接着再展开成 `A(1)` ，U 中为 `{A, B}` 终止展开。

U 中元素包含所有从上一次展开的宏，不一定是递归展开的宏。

```cpp
#define BAR() 1 BAZ()
#define BAZ() BAR
#define FOO(x) BAR() - x()

FOO(BAR())
// BAR() -> 1 BAZ()
// BAZ() -> BAR
// FOO(BAR()) -> FOO(1 BAR) -> BAR() - 1 BAR()
// ...........................U{FOO}...U{BAZ, BAR}
// BAR() - 1 BAR() -> 1 BAR - 1 BAR()
// --- end --- //
```

理解了以上内容后，我之前遇到的 bug 也就很容易明白错在哪里了，也就是上面 *function-like* Marco 展开的第二个例子说的。

也很容易修复，利用一个辅助宏，先展开参数再 `##` 上去就行了。

```cpp
#define TRACE_EXPAN(counter) tracer_##counter
#define TRACE_HELPER(counter) TRACE_EXPAN(counter)

#define trace(...) \
    RecursionTracer TRACE_HELPER(__COUNTER__)(__func__, #__VA_ARGS__, ##__VA_ARGS__)
```

### 可变参数宏

`__VA_ARGS__` 比较简单，需要需要注意的是使用的时候应该加上 `##` :

```cpp
#define LOG(fmt, ...) printf(fmt, ##__VA_ARGS__)
LOG("User %s", "Alex") // -> printf("User %s", "Alex");
LOG("System started."); // -> printf("System started.");
```

这是为了防止传入参数个数为 0 的时候，`,` 剩余。使用 `##` 可以把这个 `,` 吞掉。

在 [gcc 拓展](https://gcc.gnu.org/onlinedocs/cpp/Variadic-Macros.html#Variadic-Macros-1)中，实现了一个宏 `__VA_OPT__` 表示一个参数是 optional 的，于是上面的代码可以改成 ：

```cpp
#define LOG(fmt, ...) printf(fmt __VA_OPT__(,) __VA_ARGS__)
```

表示如果 `...` 不为空，就在这里插入一个 `,` 。

## References
---

[^1]: 参考自[维基百科](https://en.wikipedia.org/wiki/C_preprocessor#)
[^2]: 参考自[维基百科](https://en.wikipedia.org/wiki/C_preprocessor#Macro_string_replacement)
[^3]: [宏定义黑魔法-从入门到奇技淫巧 (3) - function-like 的宏展开](zhuanlan.zhihu.com/p/27019165)
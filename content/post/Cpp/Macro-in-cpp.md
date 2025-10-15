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
lastmod = 2025-10-15T07:52:02
+++

{{< quote source="Fly To Meteor (Milthm Edit)" url="https://www.youtube.com/watch?v=n5lNIpzoizI">}}
Around the right track baby we ain't going back
{{< /quote >}}

---

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

这个时候我对宏还几近一无所知, 对于这样违背常识的报错感到很困惑. 查阅资料解决问题后便决定写一篇总结。

---

## C Preprocessor

我们知道, 你写下的 C/C++ Code 从源代码到可执行文件一般会经历四个步骤 :

![https://www.tenouk.com/ModuleW.html](https://i.111666.best/image/br8h4kjHDvngzdxCwDAp6R.png)

 > 细节可以查阅这篇文章[The four stages of the gcc compiler: preprocessor, compiler, assembler, linker.](https://medium.com/@gpradinett/the-four-stages-of-the-gcc-compiler-preprocessor-compiler-assembler-linker-3dec8714bb9c)

C preprocessor 是一个 text file processor ( 文本文件处理器 ), 它主要在编译过程的第一个阶段 --预处理阶段-- 对源代码文件进行操作，主要提供四个功能[^1] : 

- file inclusion (文件包含)
- macro expansion (宏展开)
- conditional compilation (条件编译)
- line control 

不过要注意的是, C preprocessor 仅仅是一个文本处理器, 它并不明白 C/C++ 的语法, 这在很多时候, 会导致一些危险的行为。

---

## Features

### File inclusion

C 预处理器中有两个用于包含文件内容的指令 :

- `#include` ([source file inclusion](https://en.cppreference.com/w/cpp/preprocessor/include.html)) 。
- `#embed` ([resource inclusion](https://en.cppreference.com/w/cpp/preprocessor/embed.html))。

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

 ---

## The Order Of Expansion

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

递归定义禁用集 `U` 表示 ：「从递归的上一层的 U 与上一个宏的并集」, 最开始 `U` 被定义为 $∅$ ，表示当前宏不是被任何其他宏展开得来的。

- 第一步，`arg1` 维护的 `U` 是空集，将 `arg1 (1)` 展开为 `arg1 | arg2 | arg3 (2)`， 这里对应图里的第一个 `expand` 。
- 第二步，我们从左向右扫描，首先遇到 `arg1 (2)` ，他的维护的集合已经包含了 `{arg1}` ，那么 `arg1 (2)` 就不应该被展开，它保持原样。接着遇到 `|` ，`|` 不是宏，跳过。然后我们遇到第二个宏 `arg2 (2)` , 他维护的集合 `{arg1}` 不包括 `arg2` ，`arg2 (2)` 被展开为 `arg1 2` 。跳过 `|` ，展开 `arg3 (2)` 为 `arg2 3` ，此时 `arg3` 维护的集合变成 `{arg1, arg3}` 。
- 第三步，展开从上一个 `arg3` 继承来的 `arg2 (3)` ，它维护的集合是 `{arg1, arg3}` ，将其展开为 `arg1 1` 。

展开过程结束，最终结果为 `arg1 | arg1 2 | arg1 2 3` 。

我这图写的稍微有些误导性，需要指出的是，这个 expand 不是像 bfs 那样逐层展开的，而是像 dfs 那样遇到就展开到底部再返回。

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

预处理器向后看，发现 `FUNC(1, 2)` 可以被匹配函数式宏，展开为 `1 - 2`。

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

### variadic macro

`__VA_ARGS__` 比较简单，需要需要注意的是使用的时候应该加上 `##` :

这是为了防止传入参数个数为 0 的时候，`,` 剩余。使用 `##` 可以把这个 `,` 吞掉。

```cpp
#define LOG(fmt, ...) printf(fmt, ##__VA_ARGS__)
LOG("User %s", "Alex") // -> printf("User %s", "Alex");
LOG("System started."); // -> printf("System started.");
```

在[ gcc 拓展](https://gcc.gnu.org/onlinedocs/cpp/Variadic-Macros.html#Variadic-Macros-1)中，实现了一个宏 `__VA_OPT__` 表示一个参数是 optional 的，于是上面的代码可以改成 ：

```cpp
#define LOG(fmt, ...) printf(fmt __VA_OPT__(,) __VA_ARGS__)
```

表示如果 `...` 不为空，就在这里插入一个 `,` 。

### Delayed expansion

```cpp
#define A() 123

#define EMPTY()
#define DEFER(id) id EMPTY()
#define EXPAND(...) __VA_ARGS__

DEFER(A)()
EXPAND(DEFER(A)())
```

考虑 `DEFER(A)()` 宏，当他展开到 `A EMPTY()()` 的时候，`EMPTY()` 被展开，此时结果为 `A ()` ，注意这一轮扫描已经结束了。在 `DEFER(A)()` 这一次宏展开的重新扫描过程中，A 和 () 无法构成一次函数式宏调用，因此展开被延迟了。注意在此时 `A ()` 被展开成 `A ()` 的前一时刻的 `U` 是 `{DEFFER, EMPTY}` ，但是当生成 `A ()` 后，`U` 被销毁，重新变成空集。

当我们给这个宏的外面再套一层壳的时候，`EXPAND()` 宏使得预处理器重新扫描 `A ()` ，它被识别为一个函数式宏，展开成 `123` 。注意这个时候 `A ()` 的 `U` 被消除了，展开完后的 `U` 是 `{A}` 而不是 `{DEFFER, EMPTY, A}` 。

我们在这里重新提到了禁用集 `U` ，是因为它在接下来这个魔法中发挥了至关重要的作用。
### A Little Magic

```cpp
#define BAR_I() BAR
#define BAR() 1 BAR_I

BAR () () () // U {}
-> BAR_I () () // U {BAR}
-> BAR () // U {BAR_I} 注意！在执行上一步的展开时，U 被消除了
-> BAR_I // U {BAR} 此处也消除了上一轮的 U
```

也就是说，每当我展开过程中出现一个新的 *function-like* 宏时，这个新的 *function-like* 宏不会继承它源头的 U 。

我们利用刚才的延迟展开，可以实现以下代码 ：

```cpp
#define BAR_I() BAR
#define BAR()  DEFER(BAR_I)()() 1

BAR()                 -> BAR_I()() 1
EXPAND(BAR())         -> BAR_I()() 1 1
EXPAND(EXPAND(BAR())) -> BAR_I()() 1 1 1
```

这说明宏可以构成一个有限的递归栈，进而说明了宏是图灵完备的。

 > 以上代码来自于[宏定义黑魔法-从入门到奇技淫巧 (5) - 实现图灵完备的宏](https://zhuanlan.zhihu.com/p/27146532)。

### X-Macros

假设我们有一个结构体 `User` ，我们需要将它序列化为 JSON 字符串，也要能够从 JSON 字符串中解析出来。

```cpp
struct User {
    std::string name;
    int         id;
};
```

我们的目的是自动生成下面功能的函数

- void toJSON (const User &user, std::ostream &os);
- void fromJSON (User &user, const JsonObj &json);

我们创建一个 `userMembers.def` 文件，列出 `User` 结构体的所有成员。

```cpp
// userMembers.def
// X(type, name)
X(std::string, name)
X(int,           id)
```

在我们的主代码中 ：

```cpp
#include ...
// 各种头文件包含

struct User {
#define X(type, name) type name;
#include "userMembers.def"
#undef X
// serMembers.def 的内容被展开后，立马 undef X，自动生成了结构体 User 。
};

void toJSON (const User &user, std::ostream &os) {
	os << "{";
	bool first = true;
#define X(type, name) \
	if (!first)  { os << ","; } \
	os << "\"" << #name << "\":" << json_quote(user.name); \
	first = false;
// 宏定义结束

	#include "userMembers.def"
// userMembers.def 里面的内容被自动展开为上面的内容
// 比如 ：
// Expands to  
// if (!first) {  
// os << ",";  
// }  
// os << "\"" << "name" << "\":" << json_quote(user.name);  
// first = false;
// if (!first) {  
// os << ",";  
// }  
// os << "\"" << "id" << "\":" << json_quote(user.id);  
// first = false;

#undef X
	os << "}";
}

void fromJSON (User &user, const JsonObj &json) {
#define X(type, name) json.get_to(#name, user.name);
	#include "userMembers.def"
#undef X
}
```

通过 X 宏，可以实现自动生成结构体，自动生成对应的解析函数，唯一要做的修改就是在 `userMembers.def` 里面添加或删除变量。

```cpp
// userMembers.def
// X(type, name)
X(std::string, name)
X(int,           id)
X(int,        score)
```
---

## Macros FAQ

### Operator Precedence

```cpp
#define SQUARE(x) x * x

int result = SQUARE(3 + 2); 
```

我们期望得到结果 5 ，但是实际上得到是 `3  + 2 * 3 + 2` 。
### Repeated Evaluation of Arguments

```cpp
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int x = 5;
int y = 8;
int z = MAX(x++, y++);
// x 期望是 6, y 期望是 9, z 期望是 8
```

但实际上宏在展开的过程中 `x++` ， `y++` 都出现了两次，这个行为是未定义的，结果未知，但肯定和期望值不同。

### Name Clashes

宏的定义是全局的，这就很容易造成命名冲突。

不过在 c++20 中，引入了模块化来解决 `#include` 和宏所带来的全局污染问题。
### Semicolon Swallowing

```cpp
#define LOG(msg) printf("%s\n", msg);

if (condition)
    LOG("It was true");
else
    do_something_else();
    
// if (condition)
//     printf("%s\n", "It was true");;
// else
//     do_something_else();
```

当然你也可以在第一个分支里选择不加分号，不过这种别扭的行为还是禁止的为好。

常用的技巧是使用 `do-while(0)` 语句来形成一个完整的语义。

```cpp
#define LOG(msg) \
    do { \
        printf("%s\n", msg); \
    } while(0)

// 展开后:
// if (condition)
//     do { ... } while(0); // 这是一个单一的语句，需要一个分号
// else
//     ...
```

宏还有一些缺点，比如无法调试，阅读困难等等。现有的序列化和反序列化，枚举转化为字符串 ，ORM 等等操作都需要借助宏来实现，标准库的源代码也总会有宏的身影。总的来说，宏并不是一个很好的东西，但他也是一个不可或缺的东西。在现代 cpp 中，可以使用 template , constexpr 等等来替换宏，但仍然有很多地方宏是不可被替代的。这就是为什么 c++26 的反射被那么多人期待。

---

## References
[^1]: 参考自[维基百科](https://en.wikipedia.org/wiki/C_preprocessor#)
[^2]: 参考自[维基百科](https://en.wikipedia.org/wiki/C_preprocessor#Macro_string_replacement)
[^3]: [宏定义黑魔法-从入门到奇技淫巧 (3) - function-like 的宏展开](zhuanlan.zhihu.com/p/27019165)
+++
title = "You Dont Know Cpp and Neither I Do"
date = 2026-04-27T16:24:07+08:00
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

来点语言律师题，之前刷 reddit 看到的，作者取了个非常中二的名字（，空闲时间做了把他搬过来了。

> 原文仓库: https://github.com/0xd34df00d/you-dont-know-cpp

## Assigning to references

Does this work? If it doesn't, why and what's the easiest fix?

```cpp
constexpr decltype(auto) Get()
{
  static int longLiving = 0;
  auto& ref = longLiving;
  return ref;
}

void DoFoo()
{
  Get() = 42;
}
```

What about this one? If this one doesn't, why and what's the easiest fix?
```cpp
struct Foo { int a; };

template<int Idx, typename T>
constexpr decltype(auto) Get(T& f)
{
  auto& [...fields] = f;  // C++26 structured binding introducing a pack
  return fields... [Idx];
}

void DoFoo()
{
  Foo f;
  Get<0>(f) = 42;
}
```

第一个是对的，第二个是错的，为什么呢？

根据 `decltype` 的[规定](https://en.cppreference.com/cpp/language/decltype)，我们可以推导出：

| 写法                         | `decltype` 推导结果             | 语法分类          | 推导出的返回类型     | 结果                |
| :------------------------- | :-------------------------- | :------------ | :----------- | :---------------- |
| `return fields...[Idx];`   | 规则 1：`decltype(entity)`     | id-expression | `int` (传值)   | 产生 **prvalue**，报错 |
| `return (fields...[Idx]);` | 规则 2：`decltype(expression)` | lvalue        | `int&` (传引用) | 产生 **lvalue**，合法  |

在不带括号时 `fields...[Idx]` 是一个 id-expression。其被推导为 `decltype(entity)` 里的 `entity`。对于结构化绑定，编译器会直接提取它底层绑定的变量类型。在这里，底层类型是 `int`。因此，`decltype(auto)` 将函数返回值推导为 `int`。函数返回一个 prvalue，你不能对一个 pvalue 赋值。

而我们加上括号后， 括号强制改变了它的语法属性，使其变成了一个左值表达式，此时编译器触发 `decltype(expression)` 规则。因为该表达式是一个 lvalue，标准规定 `decltype` 必须将其推导为引用类型 `int&`。因此，函数返回了对原始数据的引用，赋值操作完全合法。

> 我找到一篇写的很详细的博客 C++ value categories and `decltype` demystified: https://www.scs.stanford.edu/\~dm/blog/decltype.html

---

## Defaulted equality

Does this work?
```cpp
#include <compare>

// note no operator==
struct Foo
{
    int a;
    std::strong_ordering operator<=>(const Foo&) const = default;
};

bool testFoo(Foo f1, Foo f2)
{
    return f1 == f2;
}
```

Does this work?
```cpp
struct Bar
{
    int a;
    std::strong_ordering operator<=>(const Bar&) const;
};

std::strong_ordering Bar::operator<=>(const Bar&) const = default;

bool testBar(Bar b1, Bar b2)
{
    return b1 == b2;
}
```

`<=>` 是 cpp 20 引进的一个[新特性](https://en.cppreference.com/cpp/language/operator_comparison#Three-way_comparison)，他的核心是，比较时不返回 `bool`，而是返回一个序关系。这是一个很方便的特性，使用它，在重载运算符上就变得十分方便。是我十分喜欢的一个抽象。

这是一个例子：https://godbolt.org/z/34EjovMca

在这[一节](https://eel.is/c++draft/class.compare.default)的 3.2 中，说明：

 > If the [_member-specification_](https://eel.is/c++draft/class.mem.general#nt:member-specification "11.4.1 General [class.mem.general]") does not explicitly declare any member or friend named operator==, an == operator function is declared implicitly for each three-way comparison operator function defined as defaulted in the [_member-specification_](https://eel.is/c++draft/class.mem.general#nt:member-specification "11.4.1 General [class.mem.general]"), with the same access and [_function-definition_](https://eel.is/c++draft/dcl.fct.def.general#nt:function-definition "9.6.1 General [dcl.fct.def.general]") and in the same class scope as the respective three-way comparison operator function, except that the return type is replaced with bool and the [_declarator-id_](https://eel.is/c++draft/dcl.decl.general#nt:declarator-id "9.3.1 General [dcl.decl.general]") is replaced with operator==
> 机翻：如果成员声明没有显式声明任何名为 operator== 的成员或朋友，则对于在成员声明中定义为默认的三向比较运算符函数，会隐式声明一个 == 运算符函数，具有相同的访问权限和函数定义，并在相应的三向比较运算符函数的相同类作用域中，但返回类型被替换为 bool，声明标识符被替换为 operator==

在第一个例子中，`<=>` 被声明为了 `default`，同时 == 也会被声明。但是在第二个例子中，由于我们没有给出 `<=>` 的默认实现，编译器不会为我们声明 == 函数，就算我们在后面补充上了 `<=>` 的实现，== 依旧依赖于我们手动实现。

---

## Specialization fun

You have this in your header:
```cpp
template<typename>
constexpr auto IsSimpleContainer = [] { struct Undefined {}; return Undefined {}; } ();

template<typename T>
constexpr bool IsSimpleContainer<std::vector<T>> = true;

// vectors of bools are very special!
template<>
constexpr bool IsSimpleContainer<std::vector<bool>> = false;

template<typename T>
constexpr bool IsSimpleContainer<std::deque<T>> = true;
```

How can this bite you?

It's alright if only one TU includes this header.
But if more than one does, the linker might complain
on a CWG 2387-conforming implementation:
a fully specialized variable template (the one for `std::vector<bool>`)
is a variable _definition_, so all the usual variable linkage rules apply.

The fix is to add `inline` to that line only:
```cpp
template<>
inline constexpr bool IsSimpleContainer<std::vector<bool>> = false;
```

Also, `constexpr` doesn't help: unlike `constexpr` functions,
`constexpr` variables are not implicitly `inline`.

Bonus points for …

… immediately thinking "unless they are `static` class data members, of course!" when reading the previous sentence.

---

## `requires`-constrained return types

```cpp
template<typename... Args>
struct Dummy
{
  int value;

  void foo()
    requires(sizeof... (Args) == 0)
  {
  }

  std::optional<Args...> foo()
    requires(sizeof... (Args) == 1)
  {
    return {};
  }

  std::optional<std::tuple<Args...>> foo()
    requires(sizeof... (Args) > 1)
  {
    return {};
  }
};

int main()
{
  Dummy<> d { 42 };
}
```

`Dummy<>` does not typecheck. _Do you expect_ it to not typecheck? Why it does not typecheck and how to fix it?

Solution constraint

No, you are not allowed to hide it under `auto` + deduced type. For the actual type in the actual use case that prompted writing this, the return type then needs to be written in every branch, and it's annoying, and also reduces discoverability of the API.

看似可以完美的触发 SFINAE，但是不妨注意到，在 `std::optional<Args...> foo` 中，如果 `Args...`为空，这里就是一个 hard error，正如编译器给出的 `Too few template arguments for class template 'optional'`。

如何修复呢？

我们可以用一个基类 `DummyBase` 来包装，再根据包的大小特化 `Dummy` ，如 https://godbolt.org/z/vdPsojqv3

我们也可以用一个辅助类型来包装，确保 `optional` 里面永远不为空，就像这样：

```cpp
template<typename... Ts>
struct OptionalReturn {
    using type = void;
};

template<typename T>
struct OptionalReturn<T> {
    using type = std::optional<T>;
};

template<typename... Ts> requires (sizeof...(Ts) > 1)
struct OptionalReturn<Ts...> {
    using type = std::optional<std::tuple<Ts...>>;
};

template<typename... Args>
struct Dummy {
    int value;
    // 此时即使 Args 为空，OptionalReturn<Args...>::type 也只是一个类型定义
    // 不会触发 std::optional 的错误展开
    typename OptionalReturn<Args...>::type foo(); 
};
```

Bonus question

Some usual approaches don't work:
* Making `foo` itself a template with a default template parameter, like
  ```
  template<typename... MyArgs = Args...>
    requires(sizeof...(MyArgs) == 1)
  std::optional<MyArgs...> foo()
  ```
  is not well-formed since packs can't have default values.
* Using something like `template<typename T = std::tuple_element_t<0, std::tuple<Args...>>` and then having `std::optional<T>` in the "unary" `foo()` case:
  `std::tuple_element_t` hard-errors on out-of-bounds index instead of merely being SFINAEd away.
* A C++26 variation of that with pack indexing with `template<typename T = Args...[0]>`:
  out-of-bounds in pack indexing is also somehow a hard error instead of being SFINAEd away.

Given this, what can you say about orthogonality and well-thought-ness of C++?

hhh, 我不好说。

---

## Is this valid?

```cpp
struct Foo
{
  struct Nested
  {
    bool field = true;
  };

  void doSmth(const Nested& = Nested{});
};
```

Answer: see [this bugzilla entry](https://gcc.gnu.org/bugzilla/show_bug.cgi?id=88165).

为了让我们在类成员函数中使用后面才会定义的变量，编译器不会立即处理两种内容，直到整个类结束后才会构造，这里第一是类成员变量的初始值，第二是函数的默认构造函数。

在这个代码中，由于 `doSmth` 还在类中，我们 `Nested` 不存在构造函数，一旦我们写下 `const Nested& = Nested{}`，就代表我们需要 `Nested` 有构造函数。这是什么，循环依赖了，万测尽，悲。

理解了原理，似乎我们也很好修改，只需要给 `Nested` 手动添加一个构造函数就行了。但是，如下代码依然会有错误：

```cpp
struct Foo
{
  struct Nested
  {
    bool field = true;
    Nested() = default;
  };

  void doSmth(const Nested& = Nested{});
};
```

因为将构造函数声明为 `default` 和直接表明我们这个 `Nested` 类有构造函数 `Nested() {};` 是不一样的，`default` 不代表 `Nested` 类一定有构造函数，这取决于类的实现。

值得一提的是，msvc，会编译成功，哈哈哈哈。

---

## Some covariance (协变)

Is this valid?
```cpp
struct Base
{
  virtual Base* getFoo() { return nullptr; }
};

struct Derived : Base
{
  Derived* getFoo() override { return nullptr; }
};
```

Sure: this is covariance in action.

What about this?
```cpp
struct Base
{
  virtual const Base* getFoo() { return nullptr; }
};

struct Derived : Base
{
  Base* getFoo() override { return nullptr; }
};
```

Yep, also good: in some sense, `Base*` is a subtype of `const Base*`.
And, of course, `Derived*` would've worked too.

Now, this is surely valid too, right?
```cpp
struct Base
{
  virtual const int* getFoo() { return 0; }
};

struct Derived : Base
{
  int* getFoo() override { return 0; }
};
```

Nope: non-class types play by different rules, because otherwise the language would've been too consistent
(see https://eel.is/c++draft/class.virtual\#8\).

那么问题来了，我们要怎么正确是实现呢？

一个显然的思路是包装一下我们的 `int`，但这样不够通用而且太繁琐了。

额，如果忽视 runtime 环境的话，用 CRTP 可以很好的解决这个问题：

```cpp
template <typename Derived, typename T> struct Base {
    T *getFoo() { return static_cast<Derived *>(this)->getFooImpl(); }
};

struct Derived : Base<Derived, int> {
    int *getFooImpl() { return &data; }
    int data;
};
```

还有别的方法吗？我们也可以这么处理：

```cpp
struct Base {
    virtual const int *getFoo() const { return getFooImpl(); }

  protected:
    virtual const int *getFooImpl() const { return nullptr; }
};

struct Derived : Base {
    using Base::getFoo;
    int *getFoo() { return const_cast<int *>(getFooImpl()); }

  protected:
    const int *getFooImpl() const override {
        return nullptr;
    }
};
```

这么写显然很丑陋。。

---

## `constexpr` string literals

Does this compile?

```cpp
constexpr auto f() { return "f"; }
constexpr auto g() { return "g"; }

static_assert(f() == f());
static_assert(f() != g());
```

Here the **answer** is easy:
it's an open question, discussed in [CWG #2765](https://www.open-std.org/jtc1/sc22/wg21/docs/cwg_active.html#2765).

可能会有 `Static assertion expression is not an integral constant expression` ，因为在比较字符串地址。

如果要比较，请不要使用 auto。

---

## When is this function safe or unsafe to use?

```c++
template<auto V>
const auto& foo() { return V; }
```

u1s1, 有点幻视：

```cpp
auto<auto auto>
auto auto& auto() { auto auto; }
```

It's safe for class types and unsafe for, say, `int`s.
For some reason the standard threats them differently, so

```c++
const auto& v1 = foo<42>();       // bad! dangling reference

struct S { int val; };
const auto& v2 = foo<S { 42 }>(); // fine!
```

Finding the corresponding clauses in the standard is left as an exercise for the reader.

---

## Maps of non-copyable, non-movable types

Suppose you have a type that's not copyable nor movable, like
```c++
struct ThreadedResource
{
  std::unique_ptr<Resource> handle;
  std::mutex mutex; // mutex isn't move-constructible nor move-assignable nor copyable
};
```

假设你需要一个把从 `int` 映射到 `ThreadedResource` 的 hashmap。一个方法是使用 `shared_ptr` 来包装一下 `ThreadedResouce`。如 `std::unoredred_map<int, std::shared_ptr<ThreadedResource>>`。空指针表示这里没有映射。

这很麻烦（？）因为它会有额外的内存开销和访问，导致了性能下降。

你能做的更好吗？

 一个可能的答案是使用 `std::optional`,它可以更清晰的表达 "no value"。

因为对象不能移动，我们得使用分段构造 `piecewise_construct`：

```c++
auto handle = ...;
map.emplace(std::piecewise_construct,      // 将 key 和 value 分开构造
// forward as tuple：将构造函数需呀哦的参数打包成元组
            std::forward_as_tuple(locale), // key
            std::forward_as_tuple(
            std::in_place,             // 就地构造
            std::move(handle))         
```

请注意，`ThreadedResource` 字段的顺序是 `mutex` 在 `handle` 之后，

因此无需向 `mutex` 传递初始化器，一切都能正常运行。

---

## Incrementing enums

Is this valid?

```cpp
enum E { A, B };

E& operator++(E& e)
{
    // some implementation
}
```

虽然我们不能对枚举自增，但是我们可以重载枚举的 `++` 运算符。

比如：

```cpp
#include <iostream>
#include <cassert>

enum Status {
    ready,    // 0
    running,  // 1
    stopped   // 2
};

// 重载前置 ++
Status& operator++(Status& s) {
    if (s == stopped) {
        s = ready;
    } else {
        s = static_cast<Status>(static_cast<int>(s) + 1);
    }
    return s;
}

int main() {
    Status myStatus = ready;
    ++myStatus; // 现在 myStatus 变成了 running
	assert(myStatus == running);
    return 0;
}
```

---
## `operator new`

Is this valid?

```cpp
struct Bar
{
    int n;

    void* operator new(size_t sz)
    {
        return ::operator new(sz + n);
    }
};
```

How about this?

```cpp
struct Bar
{
    virtual void* operator new(size_t sz)
    {
        return ::operator new(sz);
    }
};
```

显然不对，`new` 操作符是隐式 static 的，而此时 n 还没有创建完成。既然对象不存在，哪里来的分配内存？对于虚函数来说，此时同理没有 vtbl。

## How are these two functions different?
```c++
template<typename T>
T mkT1() { return {}; }
   
template<typename T>
T mkT2() { return T {}; }
```
   
`mkT1` 是[复制列表初始化](https://en.cppreference.com/cpp/language/copy_initialization)，`mkT2` 是直接列表初始化。

他们直接的区别在于对 `explicit` 构造函数的处理。T1 函数不允许调用标记为 `explicit` 的构造函数。

并且在 c++ 17 之前，`T{}` 会创建一个临时对象，这导致 `std::mutex` 这种无法使用。

---

## Is this code valid?
```c++
struct Foo
{
  int a;

  Foo() = delete;
  Foo(int) = delete;
};
   
int main()
{
  Foo foo1 {};
  Foo foo2 { 10 };
}
```

这同样涉及到 cpp 的初始化，在 c++20 之前，一个类被视为聚合体，如果：

- 没有用户提供的构造函数
- 没有私有或保护的非静态数据成员
- 没有基类，没有虚函数

在这里，`Foo() = delete` 属于用户声明，但不属于用户提供。所以他被视为聚合体。在聚合初始化中，编译器会绕过构造函数，直接给成员赋值而不需要构造函数。

这就导致了上面这种看起来很不合理的代码在 c++17 标准下可以编译通过。

btw， c++20 修改了聚合体的定义，以上代码无法在 c++20 以上编译。

---

## (^_=...=_^)

What does this code do, and on what features of C++17 does it rely?
```c++
template<typename F, typename... Ts>
void foo(F f, Ts... ts)
{
  int _;
  (_ = ... = (f(ts), 0));
}
```

这个标题幻视我们的反射 `[:O_o:]`

这个代码很难读，实际上 cpp 模板里面有很多这样很难读的代码。。。。。。

它依赖了变长参数模板，折叠表达式，赋值运算符的评估顺序。简单的来说，如果我们调用 `foo(func, 1, 2, 3)` 其会依次调用 `func(3)` `func(2)` `func(1)`。

我们详细讲解一下。

假设我们调用 `foo(f, t1, t2)` ，`(_ = ... = (f(ts), 0))` 是一个二元左折叠。其结构 `(Init op ... op Pack)`。

展开后，看起来像这样： `((_ = (f(t1), 0)) = (f(t2), 0))`。根据 c++17 标准，在表达式 `A = B` 中，B 在 A 先执行。所以先执行 t2 然后再 t1。

这个代码有什么问题呢？当我们偷偷重载了 `operator,` 或 `operator=` 的时候，就有可能有问题。

当然，还有一个最大的问题，就是可读性太差太差了。。。

---

## Conceptual concepts

Assume the following declarations:
```c++
template <typename T>
concept Trivial = std::is_trivial_v<T>;

template <typename T, typename U>
  requires Trivial<T>
void f(T t, U u) { std::cout << 1; }

template <typename T, typename U>
  requires Trivial<T> && Trivial<U>
void f(T t, U u) { std::cout << 2; }
```

1. Is `f(1, 2)` valid? If yes, what would it print?

2. What if `Trivial<T> && Trivial<U>` is replaced by `Trivial<T> && Trivial<T>` in the second definition?

3. What about `Trivial<T> || Trivial<U>`?

4. What if the definition of `Trivial` gets "inlined", replacing all `Trivial<T>`s with `sd::is_trivial_v<T>`?

答案是 2,

```
Call to 'f' is ambiguousclang(ovl_ambiguous_call)

foo.cpp(10, 6): Candidate function [with T = int, U = int]

foo.cpp(16, 6): Candidate function [with T = int, U = int]
```

1 和 ambiguous。

---


## Fun with fun templates

What does `bar1` print?
```cpp
template<typename T>
int foo(T) { return 1; }

template<>
int foo(int*) { return 2; }

template<typename T>
int foo(T*) { return 3; }

void bar1()
{
    int test;
    std::cout << foo(&test) << foo<int>(&test) << foo<int*>(&test) << '\n';
}
```

What if we reorder the definitions, as in `bar2`?
```cpp
template<typename T>
int foo(T) { return 1; }

template<typename T>
int foo(T*) { return 3; }

template<>
int foo(int*) { return 2; }

void bar2()
{
    int test;
    std::cout << foo(&test) << foo<int>(&test) << foo<int*>(&test) << '\n';
}
```

Can we still specialize the first template after we've introduced the second one?


Yep:
```cpp
template<>
int foo<int*>(int*) { return 2; }
```


把这个和上面那个放在一起来讲吧。当初学模板元做的笔记：

在类模板的特化过程中，编译器会先将模板转化成函数模板，借助函数模板重载来决定优先级。
   
函数模板偏序规则：
   
如果模板 A 能够处理的所有情况，模板 B 都能处理。而模板 B 能处理的情况，模板 A 未必能处理。则模板 A 比 B 更特化。
   
文章的意思大概是：编译器捏造一个类型 U，用类型 U 带入模板 A，生成一个具体的函数签名。 然后用这个函数签名，去试图匹配模板 B 如果能匹配，则说明 A 比 B 特化。反过来做一遍，就能够比较 A 和 B 的特化程度了。
   
```cpp
template <typename T> void foo(T);   // #1
template <typename T> void foo(T *); // #2
```

如果我们要比较 `#1` 和 `#2` 的特化程度，首先，尝试 `#2` 带入 `#1` ，我们用一个模板实参 U（比如说 int） 带入 `#2`。也就是 `template <typename T = U> void foo(U *);` （`foo(int *)`）然后尝试 U* 带入 `#1`，也就是 `template <typename T> void foo(U *)`（可以想象成 `foo(int *)` 去匹配 `#1`）此时，`#1` 的 T 可以被推导为 U*。

然后，我们再尝试用 `#1` 带入 `#2`，同理用一个模板实参 U 带入 `#1` `template <typename T = U> void foo(U);` 去匹配 `#2`，得到 `T* = U` -> 失败

综上得出：`#2` 的特化程度比 `#1` 高。

函数模版既可以重载，又可以全特化，函数模板的每一个重载都是主模板。实例化过程中，先进行重载决议，然后再特化匹配。也就是说，在重载决议阶段，只考虑主模板，不考虑主模板的全特化。选择主模板后，才进行特化匹配。这样的规则会导致：如果模板特化的位置不同，最终匹配到的模板也有可能不同。所以我们不应该使用函数模板全特化，而是使用函数重载。

放在这里就是：

> 下面的解析是 AIGC。

```cpp
template<typename T> int foo(T) { return 1; }   // #1 (主模板)
template<> int foo(int*) { return 2; }          // #1 的特化 (因为此时只有 #1 可见)
template<typename T> int foo(T*) { return 3; }  // #2 (另一个主模板)
```

1.  **`foo(&test)`**：
    *   主模板 `#1` (T=int*) 和 `#2` (T=int) 都在候选名单中。
    *   根据偏序规则，`#2` 比 `#1` 更特化（$T*$ 优于 $T$）。
    *   选择 `#2`。由于 `#2` 在此处没有特化版本，返回 3。
2.  **`foo<int>(&test)`**：
    *   指定 `T=int`。只有 `#2` 匹配（`foo(int*)`）。返回 3。
3.  **`foo<int*>(&test)`**：
    *   指定 `T=int*`。
    *   `#1` 变为 `foo(int*)`，匹配。
    *   `#2` 变为 `foo(int**)`，不匹配。
    *   选择 `#1`。检查 `#1` 的特化，发现 `foo(int*)`，返回 2。

结果：332

```cpp
template<typename T> int foo(T) { return 1; }   // #1
template<typename T> int foo(T*) { return 3; }  // #2
template<> int foo(int*) { return 2; }          // #2 的特化 (因为 #2 比 #1 更特化)
```

注意：这里的全特化 `template<> int foo(int*)` 会关联到当前最匹配的主模板，即 `#2`。

1.  **`foo(&test)`**：
    *   选择主模板 `#2`。检查其特化，发现 `foo(int*)`。返回 2。
2.  **`foo<int>(&test)`**：
    *   选择主模板 `#2`。检查其特化，发现 `foo(int*)`。返回 2。
3.  **`foo<int*>(&test)`**：
    *   `#1` 匹配，`#2` 不匹配。
    *   选择 `#1`。`#1` 在此处没有特化。返回 1。

结果：221

---

## I C `memset`

Assume an instance of a `struct` is `memset`ed to zeroes. What would be the value of the padding?

Further assume a field of that structure is updated. What would be the value of the padding after that field? After other fields?

都是未指定的。

为了更加直观的了解这个，我们来看看其内存模型。

假设有这么一个类：

```cpp
struct Sample {
  char a;    // 1 byte
  // Padding: 3 bytes
  int b;     // 4 bytes
  char c;    // 1 byte
  // Padding: 3 bytes
};
```

在我们 memset 完后：

![](/post/Cpp/images/Pasted%20image%2020260426232232.png)

如图，无论是执行完 `s.a = 'x';` 前后，填充位的值都不可靠。为什么呢，希腊奶。但既然标准这么规定了，就不要依赖这种行为（真不会依赖吗？）

anyway，在我的电脑上：

![](/post/Cpp/images/Pasted%20image%2020260426232454.png)

---

## Is this code valid?
```c
char arr[5] = { 0 };
auto pastEnd = arr + 10;
```

What about this one?
```c
char arr[5] = { 0 };
auto pastEnd = arr + 5;
```

第一个不合法，第二个合法。但是注意不要这么做

```cpp
char arr[5];
char *pastEnd = arr + 5; 
char value = *pastEnd;   // ub
```


---

## Which lines are UB, if any?
```c++
#include <iostream>

struct Foo1
{
    int a;
};

struct Foo2
{
    int a;
    Foo2() = default;
};

struct Foo3
{
    int a;

    Foo3();
};

Foo3::Foo3() = default;

int main()
{
    Foo1 foo11, foo12 {};
    Foo2 foo21, foo22 {};
    Foo3 foo31, foo32 {};

    std::cout << foo11.a << std::endl;
    std::cout << foo12.a << std::endl;
    std::cout << foo21.a << std::endl;
    std::cout << foo22.a << std::endl;
    std::cout << foo31.a << std::endl;
    std::cout << foo32.a << std::endl;
}
```

找了个稍微老一点的 gcc 版本 https://godbolt.org/z/bTE77GEs3

可以观察到 11 21 31 32 全是 ub。

11 12 13 是 ub，这很显然。但 32 为什么是呢？

涉及到 user-provided https://eel.is/c++draft/dcl.fct.def.default 。

根据 c 嘎嘎标准，在类外提供构造函数，这被视为 user-provided 的构造函数，对于 user-provided 的构造函数来说，编译器直接调用该构造函数，不再进行额外的零初始化。

所以，如果类外实现构造函数，最好手动初始化所有成员。

---

## Is this code valid?
```c++
struct X { int a, b; };
X *make_x() {
    X *p = (X*)malloc(sizeof(struct X));
    p->a = 1;
    p->b = 2;
    return p;
}
```

Depends on the C++ version, and whether it is C++ to begin with.

Up until C++17, neither an `x` object nor an `int` subobjects are created, and this code is UB.

Starting with C++20, an `x` object and its `int` subobjects are implicitly created, and this code is valid.

It always has been valid C code, though. 

我以为这是对的（毕竟我只在 c 里面写过这样的代码。

在 c++20 之前，malloc 并不创建对象。访问 p->a 时，该内存地址并没有一个真正的 X 对象存在.对象必须使用 `new` 显示创建。

如果要正确的写的话：

```cpp
 *make_x() {
  // Allocate raw memory
  void *mem = std::malloc(sizeof(X));
  if (!mem)
    return nullptr;

  // Use placement new to start the lifetime of X at that address.
  X *p = new (mem) X;

  p->a = 1;
  p->b = 2;
  return p;
}
```


---

## Is using this function dangerous?
```cpp
auto foo1()
{
    return "Gotta love C++";
}
```

What about this one?
```cpp
auto foo2()
{
    const char *str = "Gotta love C++";
    return str;
}
```

This one?
```cpp
auto foo3()
{
    const char str[] = "Gotta love C++";
    return str;
}
```

Nope, nope, yep.

Why? What's the crucial difference between these functions? Is there any difference in their types?

Accessing any element of the "array" returned by `foo1` and `foo2` is fine.
Try doing that to `foo3` and you'll get an UB, since you'll be using an object whose lifetime has ended!

`foo1` and `foo2` return a pointer to a string that is, roughly speaking, allocated and stored somewhere in the executable at compile time.

The pointer returned by `foo3` references the _local_ array `str` which is initialized by _copying_ that same string.
This array is local to `foo3` and its lifetime ends once the function has returned, hence the UB.


While modern compilers output a warning, what's a reliable and somewhat general way to check functions like this?

Mark all these functions `constexpr` and try using them in a constant evaluated context, like `static_assert`:
```cpp
static_assert(foo1()[0] == 'G');
static_assert(foo2()[0] == 'G');
static_assert(foo3()[0] == 'G');
```

Say, clang outputs:
```
error: non-constant condition for static assertion
   22 | static_assert(foo3()[0] == 'G');
      |               ~~~~~~~~~~^~~~~~
error: accessing 'str' outside its lifetime
   22 | static_assert(foo3()[0] == 'G');
      |               ~~~~~~~~^
note: declared here
   16 |     const char str[] = "Gotta love C++";
      |                ^~~
```

---

## What does this print?
```cpp
struct Evil {
  auto begin() { return std::counted_iterator("Library", 7); }
  friend auto begin(Evil&) { return std::counted_iterator("Core", 4); }
  friend auto end(Evil&) { return std::default_sentinel; }
};

Evil rg;
for (char c : rg) { putchar(c); }
std::ranges::for_each(rg, [](char c) { putchar(c); });
```

_borrowed from Arthur O'Dwyer's blog, [where](https://quuxplusone.github.io/blog/2024/12/09/foreach-versus-for/) he also considers this in more detail_

输出是 `CoreLibrary`。

这个应该是一个老生长谈的问题了，不过这里展示的比较隐秘，一般是用 `std::swap` 来讲解 ADL 和 CPO 的。

CPO 和 tag invoke 是现代 cpp 比较重要的特性，ranges 里面大量使用 cpo 进行实现。

---

## Are these functions different?
```cpp
int f() {
    int x = 0;
    return *(&x - 1 + 1);
}

int g() {
    int x = 0;
    return *(&x + 1 - 1);
}
```

`f()` 会是好函数吗？（

事实上，`f` 是 ub， 而 `g` 没有问题。

_borrowed from  Daniil Zhuravlev's blog, [where](https://wtrtwr.by/posts/cpp-fun-fact-5/) he explains what language in the C++ Standard makes it UB and shows a proof that function `f` is fishy_

## Conclusion

我真是疯了，把这个写完了。你如果问我：“我把这些都学会了，我能变成 cpp 大佬吗”？我觉得不行，毕竟揪着偏门语言特性不放大概率是魔怔人。

累了，放张图。

![](/post/Cpp/images/118000020_p0.png)

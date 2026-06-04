+++
title = "You Dont Know Cpp and Neither I Do"
date = 2026-05-31T12:10:07+08:00
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

Let's do some language lawyer questions. I came across this on Reddit a while ago. The author gave it a very *chuunibyou* (edgy) name (, I went through them in my free time and ported them over here.

> Original repository: https://github.com/0xd34df00d/you-dont-know-cpp

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

The first one is correct, and the second one is wrong. Why?

According to the `decltype` [rules](https://en.cppreference.com/cpp/language/decltype), we can deduce the following:

| Syntax                       | `decltype` Deduction Result    | Value Category | Deduced Return Type | Result                  |
| :------------------------- | :-------------------------- | :------------ | :----------- | :---------------- |
| `return fields...[Idx];`   | Rule 1: `decltype(entity)`     | id-expression | `int` (by value)   | Yields a **prvalue**, error |
| `return (fields...[Idx]);` | Rule 2: `decltype(expression)` | lvalue        | `int&` (by reference) | Yields an **lvalue**, valid  |

Without parentheses, `fields...[Idx]` is an id-expression. It triggers the `decltype(entity)` rule. For structured bindings, the compiler directly extracts the underlying type of the variable it binds to. Here, the underlying type is `int`. Therefore, `decltype(auto)` deduces the function's return type as `int`. The function returns a prvalue, and you cannot assign a value to a prvalue.

When we add parentheses, the parentheses forcefully change its grammatical property, making it an lvalue expression. At this point, the compiler triggers the `decltype(expression)` rule. Because the expression is an lvalue, the standard dictates that `decltype` must deduce it as a reference type, `int&`. Therefore, the function returns a reference to the original data, making the assignment operation completely valid.

> I found a very detailed blog post demystifying this: C++ value categories and `decltype` demystified: https://www.scs.stanford.edu/\~dm/blog/decltype.html

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

`<=>` is a [new feature](https://en.cppreference.com/cpp/language/operator_comparison#Three-way_comparison) introduced in C++20. Its core idea is that instead of returning a `bool` upon comparison, it returns an ordering relationship. This is a very convenient feature that makes overloading operators a lot easier. It is an abstraction that I really like.

Here is an example: https://godbolt.org/z/34EjovMca

In section 3.2 of this [clause](https://eel.is/c++draft/class.compare.default), it states:

> If the [_member-specification_](https://eel.is/c++draft/class.mem.general#nt:member-specification "11.4.1 General [class.mem.general]") does not explicitly declare any member or friend named operator==, an == operator function is declared implicitly for each three-way comparison operator function defined as defaulted in the [_member-specification_](https://eel.is/c++draft/class.mem.general#nt:member-specification "11.4.1 General [class.mem.general]"), with the same access and [_function-definition_](https://eel.is/c++draft/dcl.fct.def.general#nt:function-definition "9.6.1 General [dcl.fct.def.general]") and in the same class scope as the respective three-way comparison operator function, except that the return type is replaced with bool and the [_declarator-id_](https://eel.is/c++draft/dcl.decl.general#nt:declarator-id "9.3.1 General [dcl.decl.general]") is replaced with operator==

In the first example, `<=>` is declared as `default`, so `==` is simultaneously declared. However, in the second example, since we didn't provide a default implementation for `<=>` inside the member specification, the compiler won't declare the `==` function for us. Even if we supplement the implementation of `<=>` later on, `==` still relies on us implementing it manually.

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

It seems like this would perfectly trigger SFINAE, but note that in `std::optional<Args...> foo`, if `Args...` is empty, this becomes a hard error, exactly as the compiler outputs: `Too few template arguments for class template 'optional'`.

How do we fix it?

We can use a base class `DummyBase` to wrap it, and then specialize `Dummy` based on the pack size, like this: https://godbolt.org/z/vdPsojqv3

We can also use a helper type to wrap it, ensuring that the type inside `optional` is never empty, like this:

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
    // Now even if Args is empty, OptionalReturn<Args...>::type is just a type definition
    // It won't trigger the hard error from std::optional expanding incorrectly
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

hhh, hard to say.

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

To allow us to use variables defined later in class member functions, the compiler won't process two things immediately until the entire class definition is finished. First is the initial values of class member variables, and second is the default arguments of functions (requiring constructors).

In this code, since `doSmth` is still inside the class and our `Nested` doesn't have a constructor yet, once we write `const Nested& = Nested{}`, it means we require `Nested` to have a constructor. What is this? A circular dependency. All options exhausted, sad.

Understanding the principle, it seems easy to fix: we just need to manually add a constructor to `Nested`. However, the following code will still have errors:

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

Because declaring a constructor as `default` is not the same as explicitly stating that our `Nested` class has a constructor like `Nested() {};`. `default` does not mean the `Nested` class will definitely have a constructor; it depends on the class's implementation.

It is worth mentioning that MSVC will compile this successfully, hahahaha.

---

## Some covariance

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

So the question is, how do we implement this correctly?

An obvious idea is to wrap our `int`, but this isn't generic enough and is too cumbersome.

Uh, if we ignore the runtime environment, we can solve this problem very well using CRTP:

```cpp
template <typename Derived, typename T> struct Base {
    T *getFoo() { return static_cast<Derived *>(this)->getFooImpl(); }
};

struct Derived : Base<Derived, int> {
    int *getFooImpl() { return &data; }
    int data;
};
```

Are there other methods? We can also handle it like this:

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

Writing it this way is obviously very ugly...

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

You might get `Static assertion expression is not an integral constant expression` because it is comparing string addresses.

If you want to compare them, please do not use `auto`.

---

## When is this function safe or unsafe to use?

```c++
template<auto V>
const auto& foo() { return V; }
```

To be honest, I'm hallucinating a bit seeing this:

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

Suppose you need a hashmap mapping from `int` to `ThreadedResource`. One approach is to wrap `ThreadedResource` with `shared_ptr`, like `std::unordered_map<int, std::shared_ptr<ThreadedResource>>`. A null pointer indicates no mapping here.

This is annoying (?) because it incurs additional memory overhead and indirection, leading to a performance drop.

Can you do better?

One possible answer is to use `std::optional`, which can express "no value" more clearly.

Because the object cannot be moved, we have to use piecewise construction (`piecewise_construct`):

```c++
auto handle = ...;
map.emplace(std::piecewise_construct,      // Construct the key and value piecewise
// forward as tuple: pack the arguments required by the constructor into a tuple
            std::forward_as_tuple(locale), // key
            std::forward_as_tuple(
            std::in_place,             // Construct in-place
            std::move(handle))         
```

Please note that the order of the fields in `ThreadedResource` is `mutex` after `handle`.

Therefore, there is no need to pass an initializer to `mutex`, and everything will work fine.

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

Although we cannot increment an enum directly, we can overload the `++` operator for the enum.

For example:

```cpp
#include <iostream>
#include <cassert>

enum Status {
    ready,    // 0
    running,  // 1
    stopped   // 2
};

// Overload prefix ++
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
    ++myStatus; // Now myStatus becomes running
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

Obviously incorrect. The `new` operator is implicitly static, and at this point, `n` has not been fully created yet. Since the object doesn't exist, where does the memory allocation come from? For virtual functions, similarly, there is no vtbl at this point.

## How are these two functions different?
```c++
template<typename T>
T mkT1() { return {}; }
   
template<typename T>
T mkT2() { return T {}; }
```
   
`mkT1` is [copy-list-initialization](https://en.cppreference.com/cpp/language/copy_initialization), and `mkT2` is direct-list-initialization.

The direct difference between them lies in the handling of `explicit` constructors. The `mkT1` function does not allow calling constructors marked as `explicit`.

Moreover, before C++17, `T{}` would create a temporary object, which caused things like `std::mutex` to be unusable here.

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

This also involves C++ initialization. Before C++20, a class was considered an aggregate if:

- It has no user-provided constructors
- It has no private or protected non-static data members
- It has no base classes and no virtual functions

Here, `Foo() = delete` is user-declared, but not user-provided. So it is treated as an aggregate. In aggregate initialization, the compiler bypasses the constructor and directly assigns values to members without needing a constructor.

This leads to the above seemingly unreasonable code being able to compile under the C++17 standard.

Btw, C++20 modified the definition of aggregates, and the above code cannot compile in C++20 and above.

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

This title makes me hallucinate our reflection `[:O_o:]`

This code is very hard to read. Actually, there's a lot of such unreadable code in C++ templates...

It relies on variadic templates, fold expressions, and the evaluation order of the assignment operator. Simply put, if we call `foo(func, 1, 2, 3)`, it will sequentially call `func(3)`, `func(2)`, `func(1)`.

Let's explain it in detail.

Suppose we call `foo(f, t1, t2)`. `(_ = ... = (f(ts), 0))` is a binary left fold. Its structure is `(Init op ... op Pack)`.

After expansion, it looks like this: `((_ = (f(t1), 0)) = (f(t2), 0))`. According to the C++17 standard, in the expression `A = B`, `B` is evaluated before `A`. So it executes `t2` first and then `t1`.

What's wrong with this code? When we secretly overload `operator,` or `operator=`, there might be problems.

Of course, there is one biggest problem: the readability is just too, too poor...

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

The answer is 2,

```
Call to 'f' is ambiguousclang(ovl_ambiguous_call)

foo.cpp(10, 6): Candidate function [with T = int, U = int]

foo.cpp(16, 6): Candidate function [with T = int, U = int]
```

For 1, it's ambiguous.

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


Let's talk about this together with the one above. These are notes I took back when I learned template metaprogramming:

During the specialization of class templates, the compiler will first convert the template into a function template and use function template overloading to determine priority.
   
Function template partial ordering rules:
   
If template B can handle all situations that template A can handle, but template A may not be able to handle situations that template B can handle, then template A is more specialized than B.
   
The article roughly means: the compiler fabricates a type U, substitutes type U into template A to generate a concrete function signature. Then it uses this function signature to try and match template B. If it matches, it means A is more specialized than B. Doing this in reverse allows comparing the specialization degree of A and B.
   
```cpp
template <typename T> void foo(T);   // #1
template <typename T> void foo(T *); // #2
```

If we want to compare the specialization degree of `#1` and `#2`, first, try substituting `#2` into `#1`. We use a template argument U (e.g., `int`) to substitute into `#2`. That is, `template <typename T = U> void foo(U *);` (`foo(int *)`). Then try to substitute `U*` into `#1`, which is `template <typename T> void foo(U *)` (you can imagine `foo(int *)` trying to match `#1`). At this time, `T` in `#1` can be deduced as `U*`.

Then, we try substituting `#1` into `#2`. Similarly, substitute a template argument U into `#1`: `template <typename T = U> void foo(U);` and try to match it with `#2`, resulting in `T* = U` -> Failed.

In conclusion: the specialization degree of `#2` is higher than `#1`.

Function templates can be both overloaded and fully specialized. Every overload of a function template is a primary template. During instantiation, overload resolution is performed first, followed by specialization matching. This means that during the overload resolution phase, only primary templates are considered, not their full specializations. After a primary template is selected, specialization matching occurs. Such rules lead to this: if the position of the template specialization is different, the ultimately matched template might also be different. Therefore, we shouldn't use full specialization of function templates, but rather function overloading.

Applying it here:

> The analysis below is by AIGC.

```cpp
template<typename T> int foo(T) { return 1; }   // #1 (Primary template)
template<> int foo(int*) { return 2; }          // Specialization of #1 (since only #1 is visible here)
template<typename T> int foo(T*) { return 3; }  // #2 (Another primary template)
```

1.  **`foo(&test)`**:
    *   Primary templates `#1` (T=int*) and `#2` (T=int) are both in the candidate list.
    *   According to the partial ordering rules, `#2` is more specialized than `#1` ($T*$ is better than $T$).
    *   Select `#2`. Since `#2` has no specialized version here, it returns 3.
2.  **`foo<int>(&test)`**:
    *   Explicitly specify `T=int`. Only `#2` matches (`foo(int*)`). Returns 3.
3.  **`foo<int*>(&test)`**:
    *   Explicitly specify `T=int*`.
    *   `#1` becomes `foo(int*)`, which matches.
    *   `#2` becomes `foo(int**)`, which doesn't match.
    *   Select `#1`. Check `#1`'s specializations, find `foo(int*)`, and return 2.

Result: 332

```cpp
template<typename T> int foo(T) { return 1; }   // #1
template<typename T> int foo(T*) { return 3; }  // #2
template<> int foo(int*) { return 2; }          // Specialization of #2 (since #2 is more specialized than #1)
```

Note: Here, the full specialization `template<> int foo(int*)` will associate with the currently best-matching primary template, which is `#2`.

1.  **`foo(&test)`**:
    *   Select primary template `#2`. Check its specializations, find `foo(int*)`. Returns 2.
2.  **`foo<int>(&test)`**:
    *   Select primary template `#2`. Check its specializations, find `foo(int*)`. Returns 2.
3.  **`foo<int*>(&test)`**:
    *   `#1` matches, `#2` doesn't match.
    *   Select `#1`. `#1` has no specialization here. Returns 1.

Result: 221

---

## I C `memset`

Assume an instance of a `struct` is `memset`ed to zeroes. What would be the value of the padding?

Further assume a field of that structure is updated. What would be the value of the padding after that field? After other fields?

They are all unspecified.

To understand this more intuitively, let's look at its memory model.

Suppose we have such a struct:

```cpp
struct Sample {
  char a;    // 1 byte
  // Padding: 3 bytes
  int b;     // 4 bytes
  char c;    // 1 byte
  // Padding: 3 bytes
};
```

After we finish `memset`:

![](/post/Cpp/images/Pasted%20image%2020260426232232.png)

As shown in the figure, whether before or after executing `s.a = 'x';`, the value of the padding bits is unreliable. Why? Shiranai (I have no idea). But since the standard dictates it this way, don't rely on this behavior (would people really not rely on it?).

Anyway, on my computer:

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

The first one is invalid, the second one is valid. But be careful not to do this:

```cpp
char arr[5];
char *pastEnd = arr + 5; 
char value = *pastEnd;   // UB
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

I found a slightly older GCC version https://godbolt.org/z/bTE77GEs3

You can observe that 11, 21, 31, 32 are all UB.

11, 12, 13 are UB, which is obvious. But why is 32? (Note: referring to `foo32`)

It involves user-provided constructors https://eel.is/c++draft/dcl.fct.def.default .

According to the C++ standard, providing a constructor outside the class is considered a user-provided constructor. For user-provided constructors, the compiler calls that constructor directly and no longer performs additional zero-initialization.

Therefore, if you implement a constructor outside the class, it's best to manually initialize all members.

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

I thought this was correct (after all, I've only written code like this in C).

Before C++20, `malloc` did not create objects. When accessing `p->a`, a real `X` object does not exist at that memory address. Objects must be explicitly created using `new`.

If we want to write it correctly:

```cpp
X *make_x() {
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

The output is `CoreLibrary`.

This is probably a very cliché topic, but it is demonstrated rather subtly here. Usually, `std::swap` is used to explain ADL and CPO.

CPO and tag invoke are relatively important features in modern C++, and `ranges` heavily uses CPOs in its implementation.

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

Would `f()` be a good function? (

In fact, `f` is UB, while `g` is fine.

_borrowed from Daniil Zhuravlev's blog, [where](https://wtrtwr.by/posts/cpp-fun-fact-5/) he explains what language in the C++ Standard makes it UB and shows a proof that function `f` is fishy_

## Conclusion

I must be crazy to have actually finished writing this. If you ask me: "If I learn all of this, can I become a C++ guru?", I think not. After all, obsessing over obscure language features will most likely just make you an obsessive fanatic.

I'm tired :) Take a break.

![](/post/Cpp/images/118000020_p0.png)

*P.S. The English text above was translated by a Large Language Model without manual proofreading. Please excuse any unnatural phrasing or slight losses in the original emotional nuance.*
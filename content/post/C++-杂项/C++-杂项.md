---
title: "C++ 杂项"
date: 2025-05-24T22:40:03+08:00
draft: false
author: "Anfsity"
tags: [c++]
categories: [Other]
description: ""
---
## $Part\ I.$

- Static Variables in a Function

可以认为，声明在函数中被直接初始化的静态变量，就相当于把变量声明在全局，但是静态变量的作用域仅仅在函数内部其作用。

- Static Member Variables in a Class

在类里面声明的静态变量分配空间时只被分配一次，所以类中所有实例化的对象中的静态变量相同，也就是静态变量和所有对象共享。也正是因为这个原因，静态变量不能使用构造函数进行初始化。 

```C++
#include <iostream>
using namespace std;

class GfG {
public:
  
  	// Static data member
    static int i;

    GfG(){
        // Do nothing
    };
};

// Static member inintialization
//int GfG::i = 1;

int main() {
  
    // Prints value of i
    cout << GfG::i;
}
```

```text
/tmp/ccPusLB5.o: In function `main':
Solution.cpp:(.text.startup+0xd): undefined reference to `GfG::i`
collect2: error: ld returned 1 exit status
```

编译器在编译阶段为可能存在的 `int GfG::` 打上引用，因为编译器假设 `GfG::i` 的定义会在其他地方提供，然而链接的阶段并没有找到为 `GfG::i` 分配空间的地方，所以抛出一个引用错误 `undefined reference to GfG::i`

- Static Member Function in a Class

类似的，静态成员函数只能调用静态变量，被所有类共享。

- Global Static Variable 

全局静态变量具有内部链接，也就是对于链接器来说，全局静态变量是看不见的，他只能被当前的翻译单元所访问，可以用来防止其他相同名字的其他文件变量冲突。注意定义在头文件中的静态变量作用域也被限制在当前的翻译单元，也就是对所有引用头文件的翻译单元来说，每个翻译单元都有一个静态变量的副本


Static 修饰的变量或者函数，导致的性质就是他的作用域会被改变，要想理解 static 关键词，应该先对程序的编译过程有一定的认识。

[参考链接](https://www.geeksforgeeks.org/static-keyword-cpp/)

---

## $Part\ II.$

*$Tag\ Dispatch$* 

```C++
// C++ Program to show the implementation of
// tag dispatch
#include <bits/stdc++.h>
using namespace std;

// Creating the different tags of type empty
// struct
struct t1{};
struct t2{};

// Defining a function for type t2
void fun(int a, t1) {
    cout << "Calling function of tag t" << 
      a << endl;
}

// Defining the function with different 
// implementation for type t2
void fun(int a, t2) {
    cout << "Function with tag t" << 
      a << endl;
}

int main() {

    // Function calling with different tags
    fun(1, t1{});
    fun(2, t2{});
  	return 0;
}
```

标签调度，其实是利用函数重载的一种 c++ 技巧，可以用来处理这样一种情况：你要做出不同的操作对具有相似参数和返回值的同名函数。

这是一种静态多态($static\ polymorphism$)

[参考博客](https://iamsorush.com/posts/cpp-tag-dispatch/)

---
## $Part\ III.$

*$Duff's\ Device$*

```C++
#include <iostream>
#include <vector>
#include <numeric>

void copyIntArray(std::vector<int>& src, std::vector<int>& dest, int size) {
    int rounds = size / 8;
    int i = 0;

    switch(size % 8) {
        case 0: 
            while(rounds-- > 0) {
                dest[i] = src[i++];

                case 7 : dest[i] = src[i++];
                case 6 : dest[i] = src[i++];
                case 5 : dest[i] = src[i++];
                case 4 : dest[i] = src[i++];
                case 3 : dest[i] = src[i++];
                case 2 : dest[i] = src[i++];
                case 1 : dest[i] = src[i++];
                    
            };
    }
}

int main () {
    int size = 20;
    std::vector<int> src(size, 0), dest(20);

    std::iota(src.begin(), src.end(), 1); 

    copyIntArray(src, dest, size);

    for(int i = 0; i < size; ++i) {
        std::cout << dest[i] << std::endl;
    }
        
    return 0;
}
```

利用 switch 语句的特性进行非常奇怪的操作，这被叫做 $Duff's\ device$， 可以用来模拟 C++ 的协程，但是在 C++20 版本已经提供了官方封装的协程。

[How does Duff's Device work?](https://www.geeksforgeeks.org/duffs-device-work/)

---
## $Part\ IV.$

```C++
#pragma once

#include <optional>
#include <stdexcept>

/*
 * A Ref<T> represents a "borrowed"-or-"owned" reference to an object of type T.
 * Whether "borrowed" or "owned", the Ref exposes a constant reference to the inner T.
 * If "owned", the inner T can also be accessed by non-const reference (and mutated).
 */
template<typename T>
class Ref
{
  static_assert( std::is_nothrow_move_constructible_v<T> );
    // Type Trait : 模板 T 是否是可移动构造的？
    // _v : 获取类型特性模板类中 :: value , 在 c++17 之前 ，通过 std::is_nothrow_move_constructible<T>::value
  static_assert( std::is_nothrow_move_assignable_v<T> );

public:
  // default constructor -> owned reference (default-constructed)
  Ref()
    requires std::default_initializable<T>
    : obj_( std::in_place )
  {}

  // construct from rvalue reference -> owned reference (moved from original)
  Ref( T&& obj ) : obj_( std::move( obj ) ) {} // NOLINT(*-explicit-*)

  // move constructor: move from original (owned or borrowed)
  Ref( Ref&& other ) noexcept = default;

  // move-assignment: move from original (owned or borrowed)
  Ref& operator=( Ref&& other ) noexcept = default;

  // borrow from const reference: borrowed reference (points to original)
  static Ref borrow( const T& obj )
  {
    Ref ret { uninitialized };
    ret.borrowed_obj_ = &obj;
    return ret;
  }

  // duplicate Ref by producing borrowed reference to same object
  Ref borrow() const
  {
    Ref ret { uninitialized };
    ret.borrowed_obj_ = obj_.has_value() ? &obj_.value() : borrowed_obj_;
    return ret;
  }

#ifndef DISALLOW_REF_IMPLICIT_COPY
  // implicit copy via copy constructor -> owned reference (copied from original)
  Ref( const Ref& other ) : obj_( other.get() ) {}

  // implicit copy via copy-assignment -> owned reference (copied from original)
  Ref& operator=( const Ref& other )
  {
    if ( this != &other ) {
      obj_ = other.get();
      borrowed_obj_ = nullptr;
    }
    return *this;
  }
#else
  // forbid implicit copies
  Ref( const Ref& other ) = delete;
  Ref& operator=( const Ref& other ) = delete;
#endif

  ~Ref() = default;

  bool is_owned() const { return obj_.has_value(); }
  bool is_borrowed() const { return not is_owned(); }

  // accessors

  // const reference to object (owned or borrowed)
  const T& get() const { return obj_.has_value() ? *obj_ : *borrowed_obj_; }

  // mutable reference to object (owned only)
  T& get_mut()
  {
    if ( not obj_.has_value() ) {
      throw std::runtime_error( "attempt to mutate borrowed Ref" );
    }
    return *obj_;
  }

  operator const T&() const { return get(); } // NOLINT(*-explicit-*)
  operator T&() { return get_mut(); }         // NOLINT(*-explicit-*)
  const T* operator->() const { return &get(); }
  T* operator->() { return &get_mut(); }

  explicit operator std::string_view() const
    requires std::is_convertible_v<T, std::string_view>
  {
    return get();
  }

  T release()
  {
    if ( obj_.has_value() ) {
      return std::move( *obj_ );
    }

#ifndef DISALLOW_REF_IMPLICIT_COPY
    return get();
#else
    throw std::runtime_error( "Ref::release() called on borrowed reference" );
#endif
  }

private:
  const T* borrowed_obj_ {};
  std::optional<T> obj_ {};

  struct uninitialized_t
  {};
  static constexpr uninitialized_t uninitialized {};

  explicit Ref( uninitialized_t /*unused*/ ) {}
};

template<typename T>
static Ref<T> borrow( const T& obj )
{
  return Ref<T>::borrow( obj );
}

```


$Q \& A$ 

1.  **`static_assert` 是做什么用的？为什么这里要检查 `std::is_nothrow_move_constructible_v<T>` 和 `std::is_nothrow_move_assignable_v<T>`？如果 `T` 类型不满足这些条件会怎么样？**

2.  **默认构造函数 `Ref()` 后面的 `requires std::default_initializable<T>` 是什么意思？它和普通的构造函数有什么区别？**

3.  **`std::optional<T> obj_` 和 `const T* borrowed_obj_` 这两个成员变量是如何协同工作来表示 "owned" 和 "borrowed" 状态的？为什么不直接用一个指针和一个布尔标志位？**

4.  **`struct uninitialized_t {}; static constexpr uninitialized_t uninitialized {};` 和私有构造函数 `explicit Ref(uninitialized_t)` 这一套组合的目的是什么？为什么 `borrow` 函数需要这样创建一个 `Ref` 对象？**

5.  **`#ifndef DISALLOW_REF_IMPLICIT_COPY ... #else ... #endif` 这段预处理指令是用来做什么的？为什么会有允许或禁止隐式拷贝的选项？拷贝构造函数和拷贝赋值运算符在 "owned" 和 "borrowed" 状态下是如何工作的？**

6.  **`operator const T&() const` 和 `operator T&()` 这两个类型转换运算符为什么没有 `explicit` 关键字 (注释中提到了 `NOLINT(*-explicit-*)`)？它们允许什么样的隐式转换，这在实际使用中会有什么好处或潜在风险？**

7.  **`T release()` 函数在 `Ref` 是 "owned" 和 "borrowed" 状态时行为有什么不同？为什么在 "borrowed" 状态下（如果 `DISALLOW_REF_IMPLICIT_COPY` 被定义）会抛出异常？`std::move(*obj_)` 的作用是什么？**

8.  **文件末尾的自由函数 `template<typename T> static Ref<T> borrow(const T& obj)` 和类内部的静态成员函数 `static Ref borrow(const T& obj)` 有什么区别？为什么会提供一个自由函数版本？这里的 `static` 用在自由函数模板上是什么意思？**
9. **除了类型转换运算符，代码还重载了 operator->() 和 operator->() const。这两个箭头运算符的重载允许我们像使用指针一样使用 Ref 对象（例如 ref_obj->member_func()），它们是如何实现这一点的？在 "owned" 和 "borrowed" 状态下，它们分别返回什么？**

 > 以上问题由 Gemini 生成。

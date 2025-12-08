+++
title = "C++ Coroutines (1)"
date = 2025-11-28T08:21:14+08:00
draft = false
author = "Anfsity"
tags = [
    "C++",
]
categories = [
    "C++",
]
description = "Translated from Lewis Baker"
image = ""
+++

 > 这是 [Lewis Baker](https://lewissbaker.github.io/) 关于 C++ 协程系列文章的[第一篇](https://lewissbaker.github.io/2017/09/25/coroutine-theory)。

 > This is the first of a series of posts on the [C++ Coroutines TS](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2017/n4680.pdf), a new language feature that is currently on track for inclusion into the C++20 language standard.

这是关于 [C++ Coroutines TS](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2017/n4680.pdf) 系列博文的第一篇，一个崭新的语言特性正在按计划纳入 C++20 的语言标准。
<!-- on track 在轨中，按照计划-->

 > In this series I will cover how the underlying mechanics of C++ Coroutines work as well as show how they can be used to build useful higher-level abstractions such as those provided by the [cppcoro](https://github.com/lewissbaker/cppcoro) library.

在这个系列中，我将会涵盖 C++ 协程如何工作的底层机制，同时展示如何利用他们构建一个有用的如由 [cppcoro](https://github.com/lewissbaker/cppcoro) 库提供的高层抽象。

 > In this post I will describe the differences between functions and coroutines and provide a bit of theory about the operations they support. The aim of this post is introduce some foundational concepts that will help frame the way you think about C++ Coroutines.

在这篇博客中，我将会描述函数和协程之间的不同，并且提供一点点他们支持操作的理论。这篇博客的目的是介绍一些基础概念来帮助你形成思考 C++ 协程的方式。

## Corountines are Functions are Coroutines

 > A coroutine is a generalisation of a function that allows the function to be suspended and then later resumed.

一个协程是一个能让函数被挂起然后恢复的泛化函数。

 > I will explain what this means in a bit more detail, but before I do I want to first review how a “normal” C++ function works.
 
我将会更加详细的解释这意味着什么，但是在我解释之前，我希望先来复习一下一个 “普通的” c++ 函数是如何工作的。

## "Normal" Functions

 > A normal function can be thought of as having two operations: **Call** and **Return** (Note that I’m lumping “throwing an exception” here broadly under the **Return** operation).
 
一个普通的函数可以可以被认为有两种操作：**Call** 和 **Return** （注意我在这里把 “抛出异常” 归结为广泛的 **Return** 操作）。

 > The Call operation creates an activation frame, suspends execution of the calling function and transfers execution to the start of the function being called.

**Call** 操作创建一个激活帧，暂停调用函数的执行并且转移执行权到被调用函数的开始。

 > The **Return** operation passes the return-value to the caller, destroys the activation frame and then resumes execution of the caller just after the point at which it called the function.

<!-- just after 紧接着 -->
**Return** 操作将返回值传递给调用者，销毁激活帧，然后紧接着在调用该函数的位置之后恢复调用者的执行。

 > Let’s analyse these semantics a little more…

让我们进一步分析这些语义。。。

 ### Activation Frames

 > So what is this ‘activation frame’ thing?

所以，这个 “激活帧” 到底是什么呢？

 > You can think of the activation frame as the block of memory that holds the current state of a particular invocation of a function. This state includes the values of any parameters that were passed to it and the values of any local variables.

你可以把激活帧视作一块维护当前特定函数调用状态的内存。这个状态包括被传入函数的参数的值和其他任何局部变量。

 > For “normal” functions, the activation frame also includes the return-address - the address of the instruction to transfer execution to upon returning from the function - and the address of the activation frame for the invocation of the calling function. You can think of these pieces of information together as describing the ‘continuation’ of the function-call. ie. they describe which invocation of which function should continue executing at which point when this function completes.

<!-- upon 当...发生时，在...发生后紧接着 -->
对 “普通” 函数来说，激活帧也包括返回地址 - 即从函数返回后，(CPU) 要执行指令的地址 - 和调用函数此次调用的激活帧地址。你可以认为这些信息共同描述了函数调用的“延续性”。也就是说，他们描述了哪个函数的哪个调用应该在函数完成的哪个位置继续执行。

 > With “normal” functions, all activation frames have strictly nested lifetimes. This strict nesting allows use of a highly efficient memory allocation data-structure for allocating and freeing the activation frames for each of the function calls. This data-structure is commonly referred to as “the stack”.

对于 “普通” 函数，每个激活帧都有严格嵌套的生命周期。这种严格嵌套的关系，使得高效率内存分配数据结构的分配和释放每个函数调用的激活帧得以成立。这种数据结构通常被称为 “栈”。

 > When an activation frame is allocated on this stack data structure it is often called a “stack frame”.

当激活帧被分配到这个栈数据结构时，通常被称为 “栈帧”。

 > This stack data-structure is so common that most (all?) CPU architectures have a dedicated register for holding a pointer to the top of the stack (eg. in X64 it is the `rsp` register).

这种栈数据结构是如此的常见，以至于绝大多数 CPU 架构都有一个专用的寄存器来保存栈顶指针（如：X64 的 `rsp` 寄存器）。

 > To allocate space for a new activation frame, you just increment this register by the frame-size. To free space for an activation frame, you just decrement this register by the frame-size.

为了给新的激活帧分配空间，你只需给这个寄存器的值加上帧大小。为了释放激活帧的空间，你只需给这个寄存器的值减去帧大小。

### The 'Call' Operation

 > When a function calls another function, the caller must first prepare itself for suspension.

当一个函数调用另一个函数时，调用者必须先为挂起做好准备。

 > This ‘suspend’ step typically involves saving to memory any values that are currently held in CPU registers so that those values can later be restored if required when the function resumes execution. Depending on the calling convention of the function, the caller and callee may coordinate on who saves these register values, but you can still think of them as being performed as part of the **Call** operation.

<!-- typically 通常的 
     involves 涉及，包含 -->
这个 “挂起” 步骤通常涉及将当前 CPU 寄存器的值保存进内存，以便稍后函数恢复执行时，能够在需要的情况下还原这些值。取决于函数的调用约定，调用者和被调用者也许会协调谁来保存这些值，但你仍然可以将这一过程视为**调用**操作的一部分。

 > The caller also stores the values of any parameters passed to the called function into the new activation frame where they can be accessed by the function.

调用者会将被传进被调用函数的参数值储存进一个新的可以被函数访问的激活帧。

 > Finally, the caller writes the address of the resumption-point of the caller to the new activation frame and transfers execution to the start of the called function.

最终，调用者将调用者的恢复点地址写入新的激活帧，并且转移执行到被调用函数的开始。

 > In the X86/X64 architecture this final operation has its own instruction, the `call` instruction, that writes the address of the next instruction onto the stack, increments the stack register by the size of the address and then jumps to the address specified in the instruction’s operand.

在 X86/X64 架构中，这个最终操作有他自己的指令 - `call` 指令。这个指令将下一个指令的地址写入栈中，给栈指针的值加上地址大小，然后跳转到在指令操作数里面指定的地址。

### The 'Return' Operation

 > When a function returns via a `return`-statement, the function first stores the return value (if any) where the caller can access it. This could either be in the caller’s activation frame or the function’s activation frame (the distinction can get a bit blurry for parameters and return values that cross the boundary between two activation frames).

当函数经过 `return` 语句时返回时，函数首先把返回值（如果存在）存进一个调用者可以访问的位置。这个位置可以是调用者的激活帧或者函数的激活帧（当参数和返回值跨越两个激活帧的边界时，界限可能会有些模糊）。

 > Then the function destroys the activation frame by:
 >
 > -  Destroying any local variables in-scope at the return-point.
 > -  Destroying any parameter objects
 > -  Freeing memory used by the activation-frame

然后函数通过以下方式销毁激活帧：

 - 销毁所有在 return-point 作用域内的局部变量。
 - 销毁所有参数对象。
 - 释放激活帧占用的内存。

 > And finally, it resumes execution of the caller by:
 >
 > -  Restoring the activation frame of the caller by setting the stack register to point to the activation frame of the caller and restoring any registers that might have been clobbered by the function.
 > -  Jumping to the resume-point of the caller that was stored during the ‘Call’ operation.

最终，调用者通过：

<!-- clobber 揍人，严重受损，覆写，意外修改 -->
 - 通过设置栈指针指向调用者的激活帧，来还原调用者的激活帧。还原那些可能被函数覆写后的寄存器。
 - 跳转到在 `Call` 操作中储存的调用者恢复点。

恢复调用者执行。

 > Note that as with the ‘Call’ operation, some calling conventions may split the responsibilities of the ‘Return’ operation across both the caller and callee function’s instructions.

<!-- as with 与...类似 -->
请注意，与“调用”操作类似，某些调用约定也许会将“返回”操作的责任分割到调用者和被调用者的指令中。

## Coroutines

 > Coroutines generalise the operations of a function by separating out some of the steps performed in the **Call** and **Return** operations into three extra operations: **Suspend**, **Resume** and **Destroy**.

<!-- generalise 概括，推广，泛化 -->
协程通过把函数操作内**调用**和**返回**的部分执行步骤细分， 将其泛化为三个额外的操作：**挂起**，**恢复**，**销毁**。

 > The **Suspend** operation suspends execution of the coroutine at the current point within the function and transfers execution back to the caller or resumer without destroying the activation frame. Any objects in-scope at the point of suspension remain alive after the coroutine execution is suspended.

**挂起**操作在函数内部的当前位置暂停协程的执行，同时在不销毁激活帧的情况下，将执行权转移回调用者 (caller) 或恢复者 (resumer)。在协程执行挂起后，任何在挂起点作用域内的对象都会保持存活。

 > Note that, like the **Return** operation of a function, a coroutine can only be suspended from within the coroutine itself at well-defined suspend-points.

注意到如同函数的**返回**操作，一个协程仅能在协程内部的一个明确定义的挂起点被挂起。

 > The **Resume** operation resumes execution of a suspended coroutine at the point at which it was suspended. This reactivates the coroutine’s activation frame.

**恢复**操作在挂起点恢复执行协程。这重新激活了协程的激活帧。

 > The **Destroy** operation destroys the activation frame without resuming execution of the coroutine. Any objects that were in-scope at the suspend point will be destroyed. Memory used to store the activation frame is freed.

**销毁**操作销毁销毁协程的激活帧，而不再恢复协程的执行。任何在挂起点作用域内的对象都将被销毁。激活帧占用的内存也会被释放。

### Coroutine activation frames

 > Since coroutines can be suspended without destroying the activation frame, we can no longer guarantee that activation frame lifetimes will be strictly nested. This means that activation frames cannot in general be allocated using a stack data-structure and so may need to be stored on the heap instead.

因为协程可以不销毁激活帧挂起，所以我们不能再保证激活帧的生命周期是严格嵌套的。这意味着激活帧通常无法使用栈数据结构来分配内存，因此可能需要分配在堆上。

 > There are some provisions in the C++ Coroutines TS to allow the memory for the coroutine frame to be allocated from the activation frame of the caller if the compiler can prove that the lifetime of the coroutine is indeed strictly nested within the lifetime of the caller. This can avoid heap allocations in many cases provided you have a sufficiently smart compiler.

<!-- provisions 供应品，条款，规定 -->
<!-- provided 假如，在...条件下 -->
在 C++ Coroutines TS 中有些机制，如果编译器能够证明协程的生命周期确实是严格嵌套在调用者的生命周期内部的，可以允许协程帧的内存分配到调用者的激活帧上。只要你有一个足够聪明的编译器，这可以在很多情况下避免堆分配。

 > With coroutines there are some parts of the activation frame that need to be preserved across coroutine suspension and there are some parts that only need to be kept around while the coroutine is executing. For example, the lifetime of a variable with a scope that does not span any coroutine suspend-points can potentially be stored on the stack.

<!-- kepp around 被保留/存在
     span 跨越/横跨 -->
对于协程，激活帧的某些部分需要在协程挂起期间被保留，而有些部分只需要在协程执行期间存在。例如，如果一个变量的作用域没有横跨任何协程挂起点，那么他就有可能被储存在栈上面。

 > You can logically think of the activation frame of a coroutine as being comprised of two parts: the ‘coroutine frame’ and the ‘stack frame’.

你可以在逻辑上认为协程的激活帧由两个部分组成：“协程帧”和“栈帧”。

 > The ‘coroutine frame’ holds part of the coroutine’s activation frame that persists while the coroutine is suspended and the ‘stack frame’ part only exists while the coroutine is executing and is freed when the coroutine suspends and transfers execution back to the caller/resumer.

<!-- persist 持续 -->
“协程帧”保存了协程激活帧中在协程挂起期间依然持久存在的那部分数据，而“栈帧”部分仅在协程执行期间存在，当协程挂起并将执行权交还给调用者/恢复者时，这部分就会被释放。

### The ‘Suspend’ operation

 > The Suspend operation of a coroutine allows the coroutine to suspend execution in the middle of the function and transfer execution back to the caller or resumer of the coroutine.

协程的挂起操作允许协程在函数中间暂停执行，并且将执行权转移回协程的调用者或恢复者。

 > There are certain points within the body of a coroutine that are designated as suspend-points. In the C++ Coroutines TS, these suspend-points are identified by usages of the `co_await` or `co_yield` keywords.

<!-- designated 指定
     identified 鉴定，识别 -->
在协程的内部有些位置被指定为挂起点。在 C++ Coroutines TS 中，这些挂起点通过 `co_await` 和 `co_yield` 关键字识别。

 > When a coroutine hits one of these suspend-points it first prepares the coroutine for resumption by:
 >
 >   - Ensuring any values held in registers are written to the coroutine frame
 >   - Writing a value to the coroutine frame that indicates which suspend-point the coroutine is being suspended at. This allows a subsequent Resume operation to know where to resume execution of the coroutine or so a subsequent Destroy to know what values were in-scope and need to be destroyed.

当协程执行到了这些挂起点之一时，它首先会通过以下方式为恢复协程做准备：

 - 确保所有储存在寄存器里面的值被写进协程帧。
 - 向协程帧里面写入一个值，表明在协程里面的哪些一个挂起点正在被挂起。这保证了后续的恢复操作知道协程在哪里恢复执行，或者让后续的销毁操作知道哪些值在作用域内，需要被销毁。

 > Once the coroutine has been prepared for resumption, the coroutine is considered ‘suspended’.

一旦协程完成了恢复准备，这个协程就被认为是“挂起”。

 > The coroutine then has the opportunity to execute some additional logic before execution is transferred back to the caller/resumer. This additional logic is given access to a handle to the coroutine-frame that can be used to / later resume or destroy it.

然后协程在执行权被转移回调用者/恢复者之前，有机会去执行一些额外的逻辑。这些额外的逻辑能够访问一个句柄，该句柄后续能被用来恢复或者销毁协程帧。

 > This ability to execute logic after the coroutine enters the ‘suspended’ state / allows the coroutine to be scheduled for resumption without the need for synchronisation / that would otherwise be required if the coroutine was scheduled for resumption prior to entering the ‘suspended’ state / due to the potential for suspension and resumption of the coroutine to race. I’ll go into this in more detail in future posts.

这种协程在进入“挂起”状态后仍能执行逻辑的能力，允许我们为协程的恢复进行调度，而不需要同步（如果我们为协程恢复调度先于进入“挂起”状态，由于协程潜在的挂起恢复竞争，会导致需要进行同步）。我会在未来的博客进一步深入讨论这个。

 > The coroutine can then choose to either immediately resume/continue execution of the coroutine or can choose to transfer execution back to the caller/resumer.

随后，协程可以选择立即恢复/继续协程的执行，或者将执行权转移回调用者/恢复者。

 > If execution is transferred to the caller/resumer the stack-frame part of the coroutine’s activation frame is freed and popped off the stack.

如果执行权转移回调用者/恢复者，协程激活帧的栈帧部分将会被释放，并从栈顶弹出。

### The ‘Resume’ operation

 > The **Resume** operation can be performed on a coroutine that is currently in the ‘suspended’ state.

**恢复**操作可以针对当前处于“挂起”状态的协程来执行。

 > When a function wants to resume a coroutine it needs to effectively ‘call’ into the middle of a particular invocation of the function. The way the resumer identifies the particular invocation to resume is by calling the `void resume()` method on the coroutine-frame handle provided to the corresponding **Suspend** operation.

<!-- provided to ?
     effectively 实际上 -->
当一个函数想要恢复协程时，他实际上需要‘call’到函数特定调用的中间位置。恢复者识别这种特定的恢复调用的方式是，在那个由相应**挂起**操作提供的协程帧句柄上，调用 `void resume()` 方法。

 > Just like a normal function call, this call to `resume()` will allocate a new stack-frame and store the return-address of the caller in the stack-frame before transferring execution to the function.

就如普通的函数调用，`resume()` 的调用会分配一个新的栈帧，并在执行权被转移回函数之前，将调用者的返回地址储存到栈帧里面。

 > However, instead of transferring execution to the start of the function it will transfer execution to the point in the function at which it was last suspended. It does this by loading the resume-point from the coroutine-frame and jumping to that point.

然而，不同于将执行权转移回函数的开始，这个调用会把执行权转移到函数上一次被挂起的位置。它通过加载协程帧里的恢复位置并跳转到这个位置来实现这个操作。

 > When the coroutine next suspends or runs to completion this call to `resume()` will return and resume execution of the calling function.

当协程的下次挂起或运行完成时，`resume()` 的调用将会返回，并恢复调用函数的执行。

### The ‘Destroy’ operation

 > The **Destroy** operation destroys the coroutine frame without resuming execution of the coroutine.
 
**销毁**操作销毁协程帧，而不恢复协程的执行。

 > This operation can only be performed on a suspended coroutine.

这个操作仅能在被挂起的协程上执行。

 > The **Destroy** operation acts much like the **Resume** operation in that it re-activates the coroutine’s activation frame, including allocating a new stack-frame and storing the return-address of the caller of the **Destroy** operation.

**销毁**操作在重新激活协程帧这一点上，与**恢复**操作十分类似，这包括分配一个新的栈帧和储存**销毁**操作调用者的返回地址。

 > However, instead of transferring execution to the coroutine body at the last suspend-point it instead transfers execution to an alternative code-path that calls the destructors of all local variables in-scope at the suspend-point before then freeing the memory used by the coroutine frame.

然而，不同于将执行权转移到函数上一个挂起点的协程内部，它把执行权转移到另一个代码路径上。在协程帧占用的内存被释放之前，这个代码路径调用挂起点处作用域内所有局部变量的析构函数。

 > Similar to the **Resume** operation, the **Destroy** operation identifies the particular activation-frame to destroy by calling the `void destroy()` method on the coroutine-frame handle provided during the corresponding **Suspend** operation.

与**恢复**操作类似，**销毁**操作在相应**挂起**操作提供的协程帧句柄上，调用 `void destroy()` 方法，来识别将要被销毁的特定激活帧。

### The ‘Call’ operation of a coroutine

 > The Call operation of a coroutine is much the same as the call operation of a normal function. In fact, from the perspective of the caller there is no difference.

协程的调用操作与普通函数的调用操作非常相似。事实上，从调用者的视角来看，这没有任何区别。

 > However, rather than execution only returning to the caller when the function has run to completion, with a coroutine the call operation will instead resume execution of the caller when the coroutine reaches its first suspend-point.

<!-- rather than A, B instead 不再是 A，取而代之的是 B -->
<!-- with a coroutine 对协程来说 -->
然而，函数只有运行完成后才将执行权返回给调用者，而协程不同，协程的调用操作会在协程到达第一个挂起点时，就恢复调用者的执行。

 > When performing the **Call** operation on a coroutine, the caller allocates a new stack-frame, writes the parameters to the stack-frame, writes the return-address to the stack-frame and transfers execution to the coroutine. This is exactly the same as calling a normal function.

当正在协程中执行**调用**操作时，调用者分配一个新的栈帧，将参数、返回地址写入栈帧，并转移执行权给协程。这与普通函数的调用是完全相同的。

 > The first thing the coroutine does is then allocate a coroutine-frame on the heap and copy/move the parameters from the stack-frame into the coroutine-frame so that the lifetime of the parameters extends beyond the first suspend-point.

协程做的第一件事是，在堆上分配一个协程帧，把参数从栈帧复制/移动到协程帧上面，以便参数的生命周期能够延续到第一个挂起点之后。

### The ‘Return’ operation of a coroutine

 > The **Return** operation of a coroutine is a little different from that of a normal function.

协程的**返回**操作和普通函数有稍微的不同。

 > When a coroutine executes a `return`-statement (`co_return` according to the TS) operation it stores the return-value somewhere (exactly where this is stored can be customised by the coroutine) and then destructs any in-scope local variables (but not parameters).

当协程执行一个 `return` 语句（依据 TS 是 `co_return`）时，它把返回值储存到某些地方（具体在哪些地方可以由协程自定义），然后析构在作用域内的所有局部变量（不包括参数）。

 > The coroutine then has the opportunity to execute some additional logic before transferring execution back to the caller/resumer.

在转移执行权给调用者/恢复者之前，协程有机会去执行一些额外的逻辑。

 > This additional logic might perform some operation to publish the return value, or it might resume another coroutine that was waiting for the result. It’s completely customisable.

这些额外的逻辑也许会执行一些操作去发布返回值，或者恢复另一个正在等待结果的协程。这完全是自定义的。

 > The coroutine then performs either a **Suspend** operation (keeping the coroutine-frame alive) or a **Destroy** operation (destroying the coroutine-frame).

然后协程会执行**挂起**操作（保持协程帧存活）或者**销毁**操作（销毁协程帧）。

 > Execution is then transferred back to the caller/resumer as per the **Suspend/Destroy** operation semantics, popping the stack-frame component of the activation-frame off the stack.

<!-- as per 按照 -->
随后，执行权会按照**挂起/销毁**操作的语义转移回调用者/恢复者，并将激活帧的栈帧部分从栈中弹出。

 > It is important to note that the return-value passed to the **Return** operation is not the same as the return-value returned from a **Call** operation as the return operation may be executed long after the caller resumed from the initial **Call** operation.

<!-- long after -->
很重要的一点是，传递给 **Return** 操作的返回值，和 **Call** 操作的返回的返回值是不一样的，因为 **return** 操作执行的时间点，可能比调用者从初始 **Call** 操作的时间点要晚很久。

## An illustration

 > To help put these concepts into pictures, I want to walk through a simple example of what happens when a coroutine is called, suspends and is later resumed.
 
<!-- walk through 梳理 -->
为了以图解的方式阐释这些概念，我希望带你梳理一些关于协程被调用，挂起，以及稍后被恢复时的简单例子。

 > So let’s say we have a function (or coroutine), `f()` that calls a coroutine, `x(int a)`.

假如我们有一个函数（或者协程）`f()`, 它调用一个协程 `x(int a)`。
 
 > Before the call we have a situation that looks a bit like this:

在调用之前我们的（内存）情况大致如下：

```txt
STACK                     REGISTERS               HEAP

                          +------+
+---------------+ <------ | rsp  |
|  f()          |         +------+
+---------------+
| ...           |
|               |
```

 > Then when `x(42)` is called, it first creates a stack frame for `x()`, as with normal functions.

然后当 `x(42)` 被调用，它首先为 `x()` 创建一个栈帧，如同普通的函数。

```txt
STACK                     REGISTERS               HEAP
+----------------+ <-+
|  x()           |   |
| a  = 42        |   |
| ret= f()+0x123 |   |    +------+
+----------------+   +--- | rsp  |
|  f()           |        +------+
+----------------+
| ...            |
|                |
```

 > Then, once the coroutine `x()` has allocated memory for the coroutine frame on the heap and copied/moved parameter values into the coroutine frame we’ll end up with something that looks like the next diagram. Note that the compiler will typically hold the address of the coroutine frame in a separate register to the stack pointer (eg. MSVC stores this in the `rbp` register).

<!-- end up with 最终得到
     typically 通常的 -->
然后，一旦协程 `x()` 为协程帧在堆上分配了内存，并复制/移动参数值到协程帧里，我们最终得到类似如下图表的情况。注意到编译器通常会把协程帧的地址保存在和栈指针不同的寄存器（eg. MSVC 把这个储存在 `rbp` 寄存器）。

```txt
STACK                     REGISTERS               HEAP
+----------------+ <-+
|  x()           |   |
| a  = 42        |   |                   +-->  +-----------+
| ret= f()+0x123 |   |    +------+       |     |  x()      |
+----------------+   +--- | rsp  |       |     | a =  42   |
|  f()           |        +------+       |     +-----------+
+----------------+        | rbp  | ------+
| ...            |        +------+
|                |
```

 > If the coroutine x() then calls another normal function g() it will look something like this.

如果协程 `x()` 接下来调用了另一个普通函数 `g()`，情况如下：

```txt
STACK                     REGISTERS               HEAP
+----------------+ <-+
|  g()           |   |
| ret= x()+0x45  |   |
+----------------+   |
|  x()           |   |
| coroframe      | --|-------------------+
| a  = 42        |   |                   +-->  +-----------+
| ret= f()+0x123 |   |    +------+             |  x()      |
+----------------+   +--- | rsp  |             | a =  42   |
|  f()           |        +------+             +-----------+
+----------------+        | rbp  |
| ...            |        +------+
|                |
```

 > When g() returns it will destroy its activation frame and restore x()’s activation frame. Let’s say we save g()’s return value in a local variable b which is stored in the coroutine frame.

<!-- let's say we 假设 -->
当 `g()` 返回时，它将会摧毁自己的激活帧，并且恢复 `x()` 的激活帧。假设我们把 `g()` 的返回值保存在了储存在协程帧上的局部变量 b 上。

```txt
STACK                     REGISTERS               HEAP
+----------------+ <-+
|  x()           |   |
| a  = 42        |   |                   +-->  +-----------+
| ret= f()+0x123 |   |    +------+       |     |  x()      |
+----------------+   +--- | rsp  |       |     | a =  42   |
|  f()           |        +------+       |     | b = 789   |
+----------------+        | rbp  | ------+     +-----------+
| ...            |        +------+
|                |
```

 > If x() now hits a suspend-point and suspends execution without destroying its activation frame then execution returns to f().

如果现在 `x()` 遇到了挂起点并挂起执行，且没有销毁其激活帧，那么执行权会返回给 `f()`。

 > This results in the stack-frame part of x() being popped off the stack while leaving the coroutine-frame on the heap. When the coroutine suspends for the first time, a return-value is returned to the caller. This return value often holds a handle to the coroutine-frame that suspended that can be used to later resume it. When x() suspends it also stores the address of the resumption-point of x() in the coroutine frame (call it RP for resume-point).

这导致 `x()` 的栈帧部分从栈里弹出，而协程帧则保留在堆上。当协程首次挂起时，会将一个返回值返回给调用者。这个返回值通常保存了一个指向挂起的协程帧的句柄，稍后可以用于恢复协程。当 `x()` 被挂起时，它还会把 `x()` 的恢复点地址储存在协程帧中（称之为 RP）。

```txt
STACK                     REGISTERS               HEAP
                                        +----> +-----------+
                          +------+      |      |  x()      |
+----------------+ <----- | rsp  |      |      | a =  42   |
|  f()           |        +------+      |      | b = 789   |
| handle     ----|---+    | rbp  |      |      | RP=x()+99 |
| ...            |   |    +------+      |      +-----------+
|                |   |                  |
|                |   +------------------+
```

 > This handle may now be passed around as a normal value between functions. At some point later, potentially from a different call-stack or even on a different thread, something (say, h()) will decide to resume execution of that coroutine. For example, when an async I/O operation completes.

<!-- passed around 传递 -->
<!-- at some point later -->
这个句柄现在也许可以作为普通值在函数之间传递。在稍后的某个时间点，可能是不同的调用栈，甚至是在另一个线程上，某个函数（比如 h()）决定恢复该协程的执行。比如，当一个异步 I/O 操作完成时。

 > The function that resumes the coroutine calls a void resume(handle) function to resume execution of the coroutine. To the caller, this looks just like any other normal call to a void-returning function with a single argument.

协程恢复函数调用 `void resume(handle)` 来恢复协程的执行。对调用者来说，这就像其他普通的对 `void`-returning 单参数函数调用一样。

 > This creates a new stack-frame that records the return-address of the caller to resume(), activates the coroutine-frame by loading its address into a register and resumes execution of x() at the resume-point stored in the coroutine-frame.

这创建了一个新的栈帧，其中记录了 `resume()` 调用者的返回地址，通过加载它的地址到寄存器中来激活协程帧，并在储存于协程帧的恢复点处，恢复 `x()` 的执行。

```txt
STACK                     REGISTERS               HEAP
+----------------+ <-+
|  x()           |   |                   +-->  +-----------+
| ret= h()+0x87  |   |    +------+       |     |  x()      |
+----------------+   +--- | rsp  |       |     | a =  42   |
|  h()           |        +------+       |     | b = 789   |
| handle         |        | rbp  | ------+     +-----------+
+----------------+        +------+
| ...            |
|                |
```

## In summary

 > I have described coroutines as being a generalisation of a function that has three additional operations - ‘Suspend’, ‘Resume’ and ‘Destroy’ - in addition to the ‘Call’ and ‘Return’ operations provided by “normal” functions.

我已经把协程描述为函数的泛化，除了“普通”函数提供的 `call` 和 `Return` 操作外，它还有三个额外的操作 - **Suspend**（挂起），**Resume**（恢复）和 **Destroy**（销毁）。

 > I hope that this provides some useful mental framing for how to think of coroutines and their control-flow.

我希望这能提供一些有用的思维框架，帮助你理解协程及其控制流。

 > In the next post I will go through the mechanics of the C++ Coroutines TS language extensions and explain how the compiler translates code that you write into coroutines.

在下一篇文章中，我将深入讲解 C++ Coroutines TS 语言拓展的机制，并解释编译器是如何将你编写的代码转换为协程的。
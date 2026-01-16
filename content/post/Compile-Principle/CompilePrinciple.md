+++
title = "Compile Principle"
date = 2025-12-02T18:23:54+08:00
draft = false
author = "Anfsity"
tags = [
    "Compile Principle",
]
categories = [
    "Compile Principle",
]
description = ""
image = "https://i.111666.best/image/HiQlT92puMfjRJrwWFumCW.jpeg"
+++

思来想去，还是在 CS143 和 pku 的编译原理之间选择了 pku 的，顺便再看看 LLVM 的 [Kaleidoscope](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/LangImpl01.html)。

CS143 是经典课程了，但是 pku 的 lab 又足够诱人，它给予了你高度的自由从头来设计一个编译器。

虽然说是从头，但是其前端基本上是交给 yacc 了，所要做的事仅仅是解析正则和写写语法，并不需要亲自动手实现递归下降。而解析 ir 的部分也由 maxXing 写好了，只需要写完剩余的 rsicv 生成即可。

虽说做了一些简化工作，但是实际动手起来还是很费时。

快写完了，只剩一个 lv9 了，这里唯一比较烦人的一点是，koopa 相关的内容太少了，不得不经常翻找 koopa.h 去阅读源码，其实这也还算好，clangd 实现了 go to definition 功能，但是源码的注释太简陋了，只能一个一个试出其变量的作用。

写了一些笔记：

>  [Before Everything Begins]({{< relref "compilePrinciplePart0.md" >}})

---

www
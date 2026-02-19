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

差不多两个月的时间，如果除去中间因为期末考试和放寒假玩了一个星期导致的真空期，剩下的差不多一个月出头，比我想象的其实要快很多。大抵是搓编译器太有意思了。

写点感想。这个 lab 是极好的，真好国内有这么高质量的课程。美中不足的是，相关的文档有点缺乏（koopa），引导稍微有点不够。但总的来说，课程的开放保持的恰到好处，给予你足够的思索空间，既不像傻子一样全部一步一步的告诉你，也不像某些天书一样不说人话。

课程正文在数组部分截止，最难的就是 lv8 和 lv9，前面的都是小喽啰，后面的附加内容是一些相关优化（没有浮点数支持），虽然目前还没有写，但打算以后也一并做了。

感谢 maxxing 创作了质量如此之高的教程。
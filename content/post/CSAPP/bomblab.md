+++
title = "Bomblab"
date = 2025-11-01T03:19:47+08:00
draft = false
author = "Anfsity"
tags = [
    "",
]
categories = [
    "",
]
description = ""
image = ""
hidden = "true"
+++

## Introduction

Bomb Lab 是 CSAPP 的第二个实验。在这个实验中，你将获得一个邪恶博士的二进制炸弹。二进制炸弹是由一系列阶段组成的程序，每个阶段你都要找到一个正确的密钥来拆除这个阶段，否则你将得到一个 "BOOM!!!"。只有当所有阶段都被拆除时，炸弹才算拆除。

整个实验十分有趣，你将学会 gdb 的使用，实际了解程序在运行过程中的汇编表示，掌握扎实的静态源码分析能力。纵使实验很难，但也不要轻言放弃，放松下来多读几次源码，你会发现这其实很简单。

当我拆解完所有的炸弹，回望这十几个小时的努力，不由得再次感叹 CSAPP 的课程质量之高，以及对 CMU 学生的敬佩。

这篇文章大致按照我在做 bomb lab 的过程进行编写，我对它进行了一些加工，让它尽可能保持通俗易懂的同时没那么 "spoiler"。阅读这篇文章仅仅需要你对汇编有一些基础的了解 (真的只有一点点) ，如果你还没有尝试拆解 bomb，可以没有太大障碍的入手，如果你是做过 bomb lab 的过来人，我希望它对你也有一些参考价值。

实验材料和我在做 bomb lab 时查看过的文档我会放在文章的最后面。
## Familiar with Bomb

下载完源码后，我们会得到一个 bomb.tar ，键入 `tar -xvf bomb.tar` 进行解压之后，会会有三个文件。

```bash
.
├── bomb
├── bomb.c
└── README

1 directory, 3 files
```

其中 bomb 是需要拆解的二进制炸弹，bomb.c 是整个 bomb 的源代码。

在一无所知的情况下，我们先来看看 bomb.c。

![image](https://i.111666.best/image/IdTE0LcssTIaCOV8U72OvG.png)

通过这个源码，我们可以知道整个炸弹由 6 个 phase 和一个潜藏的 bonus 组成。那么我们要找的密码，肯定就在这些代码里面。问题是要怎么得到他们呢？

先别急着使用 gdb ，我们用 `strings` 看看这个 bomb 里面到底有什么。

  > strings 可以打印二进制文件里面的所有的可打印字符串。

```bash
strings bomb > bomb.strings
nvim bomb.strings
```

刨去一堆看不太懂的东西，我们可以发现似乎有些可读句子在里面 ：

![image](https://i.111666.best/image/RWr7zf5fGtmq842xlwQ1MH.png)

看看这些句子，除了祝贺你成功拆除了 phase，似乎还有些别的 "杂质" 在这里面，这些会不会是密码呢？

把这个暂且放在一边，接着我们用 objdump 反汇编一下 bomb 炸弹 :

```bash
objdump help
# 可以查看帮助文档
objdump -d bomb | less
# 你可以直接在终端里面阅读
objdump -d bomb > bomb.asm
# 或者重定向至文本里面
objdump -d bomb | grep bomb
# 或者查看自己感兴趣的内容
```

bomb.asm 似乎很长，一时眼花缭乱。不过我们可以在 IDE 里面直接搜索关键字，先看看我们最关心的 "bomb" 吧。

```bash
objdump -d bomb | grep bomb
bomb:     file format elf64-x86-64
  400e19:	e8 84 05 00 00       	call   4013a2 <initialize_bomb>
  400ef2:	e8 43 05 00 00       	call   40143a <explode_bomb>
  400f10:	e8 25 05 00 00       	call   40143a <explode_bomb>
  400f20:	e8 15 05 00 00       	call   40143a <explode_bomb>
  400f65:	e8 d0 04 00 00       	call   40143a <explode_bomb>
  400fad:	e8 88 04 00 00       	call   40143a <explode_bomb>
  400fc4:	e8 71 04 00 00       	call   40143a <explode_bomb>
  401035:	e8 00 04 00 00       	call   40143a <explode_bomb>
  401058:	e8 dd 03 00 00       	call   40143a <explode_bomb>
  401084:	e8 b1 03 00 00       	call   40143a <explode_bomb>
  4010c6:	e8 6f 03 00 00       	call   40143a <explode_bomb>
  401123:	e8 12 03 00 00       	call   40143a <explode_bomb>
  401140:	e8 f5 02 00 00       	call   40143a <explode_bomb>
  4011e9:	e8 4c 02 00 00       	call   40143a <explode_bomb>
  401267:	e8 ce 01 00 00       	call   40143a <explode_bomb>
  40127d:	e8 b8 01 00 00       	call   40143a <explode_bomb>
00000000004013a2 <initialize_bomb>:
00000000004013ba <initialize_bomb_solve>:
000000000040143a <explode_bomb>:
  401494:	e8 a1 ff ff ff       	call   40143a <explode_bomb>
  401595:	e8 a0 fe ff ff       	call   40143a <explode_bomb>
```

看起来这个 explode_bomb 函数就是引爆炸弹的函数了，接下来找到我们的 main 函数 ：

![image](https://i.111666.best/image/F00YcWQkjvMJYTZAAmHEkH.png)

不管那些奇奇怪怪的函数调用，基本和 bomb.c 的结构是一样的，再看看 phase_1 ：

![image](https://i.111666.best/image/h6ibRcE4zOBcTgV9zb15r3.png)

很短，看起来是输入一个字符串，然后和一个字符串比较，根据结果引爆炸弹。我们当然可以直接通过分析得到得到这个密码，虽然手段有些复杂，但是为什么不使用更加强大和简单的工具呢？

## References

这里先把一些肯定要查的表列出来。他们在拆炸弹的过程中很有帮助

 - [x86 汇编表](https://cs.brown.edu/courses/cs033/docs/guides/x64_cheatsheet.pdf)
 - [x86-64 寄存器简介](https://wiki.osdev.org/CPU_Registers_x86-64)
 - [x86-64 ABI](https://gitlab.com/x86-psABIs/x86-64-ABI)

## Deep into Bomb

### Phase 1

上面我们初步认识了 bomb 的结构，现在我们要正式借助 gdb 开始拆炸弹了。

 > gdb (GNU Debugger) 是一个运行在 \*unix 上的强大调试工具。它提供了广泛的跟踪，检查，修改计算机程序执行的功能。用户可以监控和修改程序内部变量的值。我们主要使用的是它的监控功能。gdb 有很多指令，不过不要急，慢慢来，我们总会熟悉他的。
 > 
 > 事实上也可以通过修改内部变量的值来达到拆解炸弹的目的，不过对于修这门课的学生来说，这不能通过服务器远程校验。

```bash
gdb bomb
GNU gdb (GDB) 16.3
Copyright (C) 2024 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-pc-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<https://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from bomb...
(gdb) 
```

这就是 `gdb bomb` 后出现的内容，不要害怕他。

首先有一个很明确的需求，我肯定不能保证我的输入就是正确答案，我要怎么防止爆炸呢？

我们可以使用 gdb 的断点 (breakpoint) 功能 ：

```bash
(gdb) break explode_bomb 
# exp 可以使用 tab 进行补全，断点可以根据函数名称，地址，pc 指针偏移量等等来进行设置
Breakpoint 1 at 0x40143a
```

这表明我们在 explode_bomb 这个函数的地址处 (0x40143a) 设置了一个断点，我们可以使用 `info breakpoints` 来查看当前设置的断点信息。如果不记得命令，记得 help ：

```bash
(gdb) info breakpoints 
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x000000000040143a <explode_bomb>
(gdb) help info
info, inf, i
Generic command for showing things about the program being debugged.

List of info subcommands:

info address -- Describe where symbol SYM is stored.
info all-registers -- List of all registers and their contents, for selected stack frame.
info args -- All argument variables of current stack frame or those matching REGEXPs.
...
```

btw，这些指令都有简写，比如 info 可以简写成 i ，breakpoints 和 break 可以简写成 b ，文章后面都会使用这些简写。

`run` (简写 r) 指令可以启动程序，同样的 `start` (简写 s) 也可以启动程序，不过 start 会在 main 函数设置一个断点，在运行到 main 时自动停止。

 > shell clear 可以清空屏幕，或者使用 Ctrl+L 也可以。你也可以为 shell clear 设置一个别名，命令如下
 > ```bash
 > define cls
 > shell clear
 > end
 > ```

添加一个断点到 phase_1 ，因为我们要详细看看 phase_1 的内部情况。

```bash
(gdb) i b
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x000000000040143a <explode_bomb>
(gdb) b phase_1
Breakpoint 2 at 0x400ee0
(gdb) r
# 启动！
Starting program: /home/anfsity/Project/CSAPP/bomb/bomb 

This GDB supports auto-downloading debuginfo from the following URLs:
  <https://debuginfod.archlinux.org>
Enable debuginfod for this session? (y or [n]) n
Debuginfod has been disabled.
To make this setting permanent, add 'set debuginfod enabled off' to .gdbinit.
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/usr/lib/libthread_db.so.1".
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
```

如果你看到了这个 debuginfod ，这是 gdb 的拓展内容，可以帮你查看动态链接库的参数。它对我们完成这个 bomb lab 并没有太大的帮助，跳过它即可。
 
 随便输点内容进去 ：

```bash
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
hello bomb lab

Breakpoint 2, 0x0000000000400ee0 in phase_1 ()
(gdb) 
```

可以看到程序停到了 phase_1，我们使用 disassemble (disas) 指令反汇编这个函数 ：

```bash
(gdb) disassemble 
Dump of assembler code for function phase_1:
=> 0x0000000000400ee0 <+0>:     sub    $0x8,%rsp
   0x0000000000400ee4 <+4>:     mov    $0x402400,%esi
   0x0000000000400ee9 <+9>:     call   0x401338 <strings_not_equal>
   0x0000000000400eee <+14>:    test   %eax,%eax
   0x0000000000400ef0 <+16>:    je     0x400ef7 <phase_1+23>
   0x0000000000400ef2 <+18>:    call   0x40143a <explode_bomb>
   0x0000000000400ef7 <+23>:    add    $0x8,%rsp
   0x0000000000400efb <+27>:    ret
End of assembler dump.
```

这和我们在 bomb.asm 看到的内容是一样的，不过这个对地址的偏移量做了优化，十进制看起来比十六进制可读性更高，不是吗。

你也许注意到了 => ，这表示我们的程序现在停到了`0x0000000000400ee0`，还没有执行这个地址对应的指令。

我们在书中看到过，rsp 是栈指针，这表示这个函数会开辟一个 8 字节大小的空间。

接下来是一个 mov 指令，把立即数 $0x402400 复制给了 esi。

这里要重点说一下。刚刚开始做 bomb lab 的时候，我搞不明白为什么程序要把这些值丢到这些寄存器里面，一开始只能靠猜，后面会打印寄存器的值来看，再后面学到了这些寄存器的惯用法。

![image](https://i.111666.best/image/SanLZAyfwiwuWD999873oD.png)

![image](https://i.111666.best/image/WZLS3RF0bInxziaf1ELX7O.png)

这两张图很重要，他们很简洁，十分方便查阅。对于 esi ，它会被当作第二个函数的第二个参数使用，同时被用于存储字符串指针。

也就是说，就 string_not_euqal 这个 fucntion 而言，rdi 里面保存第一个参数，rsi 里面保存第二个参数，rax 作为返回值。

我们使用 stepi (si) 执行一个汇编指令。

简单解释一下，step (s) 表示执行一个语句，stepi 表示执行一个汇编指令，nexti (ni) 和 next (n) 的表现和 stepi 还有 step 没有什么区别，只有在调用一个函数的时候，比如当我在 call fun 的时候，stepi 会进入 fun 内部，但是 nexti 不会。

```bash
si
si
Dump of assembler code for function phase_1:
   0x0000000000400ee0 <+0>:     sub    $0x8,%rsp
   0x0000000000400ee4 <+4>:     mov    $0x402400,%esi
=> 0x0000000000400ee9 <+9>:     call   0x401338 <strings_not_equal>
# 这里如果是 stepi 的话，就进入了 stirngs not euqal 内部
# 如果是 nexti 的话，就到了下一个指令 test 的位置
   0x0000000000400eee <+14>:    test   %eax,%eax
   0x0000000000400ef0 <+16>:    je     0x400ef7 <phase_1+23>
   0x0000000000400ef2 <+18>:    call   0x40143a <explode_bomb>
   0x0000000000400ef7 <+23>:    add    $0x8,%rsp
   0x0000000000400efb <+27>:    ret
End of assembler dump.
```

理所当然的，我们想知道在和什么字符串进行比较，顺便验证一下上面两张表的正确性 ：

```bash
(gdb) x/s $rdi
0x603780 <input_strings>:       "hello bomb lab"
# 这是我们的输入
(gdb) x/s $rsi
0x402400:       "Border relations with Canada have never been better."
# 这是加载地址里面存的内容
(gdb) p $rax
$2 = 6305664
# rax 现在是一个随机值
(gdb) 
```

这里 x 是 examine ，p 是 print 的意思。两者都以 `/` 作为 FMT 的起始：

```bash
Examine memory: x/FMT ADDRESS.
ADDRESS is an expression for the memory address to examine.
FMT is a repeat count followed by a format letter and a size letter.
Format letters are o(octal), x(hex), d(decimal), u(unsigned decimal),
  t(binary), f(float), a(address), i(instruction), c(char), s(string)
  and z(hex, zero padded on the left).
Size letters are b(byte), h(halfword), w(word), g(giant, 8 bytes).
The specified number of objects of the specified size are printed
according to the format.  If a negative number is specified, memory is
examined backward from the address.

Defaults for format and size letters are those previously used.
Default count is 1.  Default address is following last thing printed
with this command or "print".
(gdb) help p
print, inspect, p
Print value of expression EXP.
Usage: print [[OPTION]... --] [/FMT] [EXP]

Options:
  -address [on|off]
    Set printing of addresses.

  -array [on|off]
    Set pretty formatting of arrays.
```

这里寄存器用美元符号 $ 开头。x 的输入值是一个地址，打印这个地址里面的内容，而 p 会默认用十进制直接打印输入值。如果要像 x 一样的行为的话，需要对值进行解引用，比较繁琐。

上面的内容告诉我们，rsi 是第二个参数，他也恰好是一个字符串的头指针地址，这个字符串是 "Border relations with Canada have never been better." 

```bash
(gdb) ni
0x0000000000400eee in phase_1 ()
(gdb) disas
Dump of assembler code for function phase_1:
   0x0000000000400ee0 <+0>:     sub    $0x8,%rsp
   0x0000000000400ee4 <+4>:     mov    $0x402400,%esi
   0x0000000000400ee9 <+9>:     call   0x401338 <strings_not_equal>
=> 0x0000000000400eee <+14>:    test   %eax,%eax
   0x0000000000400ef0 <+16>:    je     0x400ef7 <phase_1+23>
   0x0000000000400ef2 <+18>:    call   0x40143a <explode_bomb>
   0x0000000000400ef7 <+23>:    add    $0x8,%rsp
   0x0000000000400efb <+27>:    ret
End of assembler dump.
(gdb) p $rax
$8 = 1
```

观察到 rax 的值改变了，rax 一般作为函数的返回值使用，所以这里 rax 为 1 表示 strings not equal 返回了一个 1。

接下来是一个 test 指令 ：

![image](https://i.111666.best/image/C1fKnJcED2EzrMzsarRyQn.png)

```bash
=> 0x0000000000400eee <+14>:    test   %eax,%eax
   0x0000000000400ef0 <+16>:    je     0x400ef7 <phase_1+23>
   # je = jump if equal or jump if zero
   # 这里贴心的告诉你会跳到的位置，phase_1 实际上是一个标签，不占用内存，为了方便可读性而生成的， +23 是偏移量，组合起来告诉我们，这个指令会跳到这里 ：
   # 0x0000000000400ef7 <+23>:    add    $0x8,%rsp
   # 而这个地方是把栈指针还原，说明函数已经结束了
```

简单的来说，这两个组合起来，表示当 eax 值为 0 的时候，jump 。eax 不为零时，不 jump ，然后就爆炸了。

显然 phase1 的密码我们已经知道了，我们键入 r ：

```bash
(gdb) r
# r 也可以用来重新运行程序
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/anfsity/Project/CSAPP/bomb/bomb 
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/usr/lib/libthread_db.so.1".
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
Border relations with Canada have never been better.

Breakpoint 2, 0x0000000000400ee0 in phase_1 ()
(gdb) b phase_2
Breakpoint 3 at 0x400efc
(gdb) c
Continuing.
Phase 1 defused. How about the next one?
```

看见了吗，我们成功的拆除了这个炸弹的第一个部分。

### Phase 2

接下来我们向 phase 2 迈进，可以使用 delete breakpoints 删除不想要的断点 ：

```bash
(gdb) i b
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x000000000040143a <explode_bomb>
2       breakpoint     keep y   0x0000000000400efc <phase_2>
        breakpoint already hit 1 time
3       breakpoint     keep y   0x0000000000400ee0 <phase_1>
(gdb) d 3
(gdb) i b
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x000000000040143a <explode_bomb>
2       breakpoint     keep y   0x0000000000400efc <phase_2>
        breakpoint already hit 1 time
```

对 phase 2 反汇编，有时候会出现这个有点烦人的翻页提示，可以把它关掉：

```bash
   0x0000000000400f25 <+41>:    add --Type <RET> for more, q to quit, c to continue without paging--c
(gdb) set pagination off
# 关闭翻页提示
```

```bash
(gdb) disas
Dump of assembler code for function phase_2:
=> 0x0000000000400efc <+0>:     push   %rbp
   0x0000000000400efd <+1>:     push   %rbx
   0x0000000000400efe <+2>:     sub    $0x28,%rsp
   0x0000000000400f02 <+6>:     mov    %rsp,%rsi
   0x0000000000400f05 <+9>:     call   0x40145c <read_six_numbers>
   0x0000000000400f0a <+14>:    cmpl   $0x1,(%rsp)
   0x0000000000400f0e <+18>:    je     0x400f30 <phase_2+52>
   0x0000000000400f10 <+20>:    call   0x40143a <explode_bomb>
   0x0000000000400f15 <+25>:    jmp    0x400f30 <phase_2+52>
   0x0000000000400f17 <+27>:    mov    -0x4(%rbx),%eax
   0x0000000000400f1a <+30>:    add    %eax,%eax
   0x0000000000400f1c <+32>:    cmp    %eax,(%rbx)
   0x0000000000400f1e <+34>:    je     0x400f25 <phase_2+41>
   0x0000000000400f20 <+36>:    call   0x40143a <explode_bomb>
   0x0000000000400f25 <+41>:    add    $0x4,%rbx
   0x0000000000400f29 <+45>:    cmp    %rbp,%rbx
   0x0000000000400f2c <+48>:    jne    0x400f17 <phase_2+27>
   0x0000000000400f2e <+50>:    jmp    0x400f3c <phase_2+64>
   0x0000000000400f30 <+52>:    lea    0x4(%rsp),%rbx
   0x0000000000400f35 <+57>:    lea    0x18(%rsp),%rbp
   0x0000000000400f3a <+62>:    jmp    0x400f17 <phase_2+27>
   0x0000000000400f3c <+64>:    add    $0x28,%rsp
   0x0000000000400f40 <+68>:    pop    %rbx
   0x0000000000400f41 <+69>:    pop    %rbp
   0x0000000000400f42 <+70>:    ret
End of assembler dump.
```

这里比较奇怪，把 rsp 复制给了 rsi，这是在干什么呢？这个指令后马上 call 了 read six numbers 函数，可以联想这个操作和 read six numbers 有关，那我们就进入 read six numbers 看看 ：

```bash
(gdb) advance read_six_numbers 
# 直接前进到这个函数里面停下，缩写是 adv
0x000000000040145c in read_six_numbers ()
(gdb) disas
Dump of assembler code for function read_six_numbers:
=> 0x000000000040145c <+0>:     sub    $0x18,%rsp
   0x0000000000401460 <+4>:     mov    %rsi,%rdx
   0x0000000000401463 <+7>:     lea    0x4(%rsi),%rcx
   0x0000000000401467 <+11>:    lea    0x14(%rsi),%rax
   0x000000000040146b <+15>:    mov    %rax,0x8(%rsp)
   0x0000000000401470 <+20>:    lea    0x10(%rsi),%rax
   0x0000000000401474 <+24>:    mov    %rax,(%rsp)
   0x0000000000401478 <+28>:    lea    0xc(%rsi),%r9
   0x000000000040147c <+32>:    lea    0x8(%rsi),%r8
   0x0000000000401480 <+36>:    mov    $0x4025c3,%esi
   0x0000000000401485 <+41>:    mov    $0x0,%eax
   0x000000000040148a <+46>:    call   0x400bf0 <__isoc99_sscanf@plt>
   0x000000000040148f <+51>:    cmp    $0x5,%eax
   0x0000000000401492 <+54>:    jg     0x401499 <read_six_numbers+61>
   0x0000000000401494 <+56>:    call   0x40143a <explode_bomb>
   0x0000000000401499 <+61>:    add    $0x18,%rsp
   0x000000000040149d <+65>:    ret
End of assembler dump.
```

这个里面看起来很复杂，什么也看不懂，不过按照我们已知的知识，先看看 0x4025c3 这个里面存了什么 ：

```bash
(gdb) x/s 0x4025c3
0x4025c3:       "%d %d %d %d %d %d"
```

这个指令下面不远有一个 sscanf 调用，根据 sscanf 的[接口](https://en.cppreference.com/w/c/io/fscanf.html) ：

```cpp
int sscanf( const char *buffer, const char *format, ... );
```

依据 esi 的惯用法，这里大概率就是存放 format 的字符串。还有下面的 cmp 和 jump 告诉我们，要输入 6 个数字。这里的 buffer 是我们的读入数据，放在 rdi 里面 ：

```bash
(gdb) x/s $rdi
0x6037d0 <input_strings+80>:    "1 2 3 4 5 6"
```

根据之前看到的寄存器惯用表，rdi 是第一个参数，rsi 是第二个参数，可以看到最后确实执行了这个操作 `mov    $0x4025c3,%esi` 。

我们来详细解析一下这个过程，在调用这个 read 函数前， 程序先干了这么一件事 `mov    %rsp,%rsi` ，这个命令的作用暂且不表，看看前面一长串 mov lea 指令干了什么 ：

![image](https://i.111666.best/image/hLieyC6aUltRyUg24AUcMt.png)

之前整个的 mov 和 lea 操作的 source 都是对 rsi 和 rsi 的偏移量进行操作。事实上，从 rsi 开始，每隔 4 个字节，就会把其地址放进寄存器里面，上面这个图给出了对应关系。

如果以 sscanf 的接口作为例子，比如

```cpp
int sscanf( const char *buffer, const char *format, &num1, ...);
```

num1 这个变量的地址在 rsi ，通过 rdx 传进了 sscanf 函数，也就是引用 (&num1)，我们可以通过打印地址内容来验证这一点。

```bash
(gdb) p/x $rsi
$14 = 0x7fffffffd980
# 得到调用函数前的 rsi 里面的值，这里保存了之前的 rsp 的值，根据表格内容，我们确定 rdx 里面保存第一个参数，此时 rdx = rsi。
(gdb) adv *read_six_numbers +51
# *表示我调用的是一个地址
0x000000000040148f in read_six_numbers ()
(gdb) disas $pc, $pc+0x4*3
Dump of assembler code from 0x40148f to 0x40149b:
=> 0x000000000040148f <read_six_numbers+51>:    cmp    $0x5,%eax
   0x0000000000401492 <read_six_numbers+54>:    jg     0x401499 <read_six_numbers+61>
   0x0000000000401494 <read_six_numbers+56>:    call   0x40143a <explode_bomb>
   0x0000000000401499 <read_six_numbers+61>:    add    $0x18,%rsp
End of assembler dump.
(gdb) x/6dw 0x7fffffffd980
0x7fffffffd980: 1       2       3       4
0x7fffffffd990: 5       6
# 和我们想的一样，从 rsi (之前的) 开始，每隔 4 个字节保存了我们的输入 
```

仅仅依靠上面那张表可能还有点疑惑，我再补充一点。

call 指令是一个复合指令，这个地方可以发现 rsp 的地址和 phase_2 里面的 rsp 地址不一样，偏移了 0x8。也就是说，我们所处的这个 read six numbers 地址和之前 phase_2 里面并不连续，所以这里理论上不存在 rsp 和 rsi 的地址对应关系。在我们跳出 read six numbers 函数后，rsp 的地址又恢复了。

```bash
(gdb) disas
Dump of assembler code for function phase_2:
   0x0000000000400efc <+0>:     push   %rbp
   0x0000000000400efd <+1>:     push   %rbx
   0x0000000000400efe <+2>:     sub    $0x28,%rsp
=> 0x0000000000400f02 <+6>:     mov    %rsp,%rsi
   0x0000000000400f05 <+9>:     call   0x40145c <read_six_numbers>
   0x0000000000400f0a <+14>:    cmpl   $0x1,(%rsp)
(gdb) p/x $rsp
$15 = 0x7fffffffd980
(gdb) si
0x0000000000400f05 in phase_2 ()
(gdb) disas $pc, $pc+4
Dump of assembler code from 0x400f05 to 0x400f09:
=> 0x0000000000400f05 <phase_2+9>:      call   0x40145c <read_six_numbers>
End of assembler dump.
(gdb) p/x $rsi
$16 = 0x7fffffffd980
(gdb) si
0x000000000040145c in read_six_numbers ()
(gdb) disas
Dump of assembler code for function read_six_numbers:
=> 0x000000000040145c <+0>:     sub    $0x18,%rsp
(gdb) p/x $rsp
$17 = 0x7fffffffd978
(gdb) b *0x0000000000400f0a
Breakpoint 4 at 0x400f0a
(gdb) continue
# continue 的简写是 c
Continuing.
Breakpoint 4, 0x0000000000400f0a in phase_2 ()
(gdb) p/x $rsp
$18 = 0x7fffffffd980
```

当使用的寄存器个数超出 6 个后，参数就会被丢到栈里面，就是这几个指令 ：

```bash
   0x0000000000401467 <+11>:    lea    0x14(%rsi),%rax
   0x000000000040146b <+15>:    mov    %rax,0x8(%rsp)
   0x0000000000401470 <+20>:    lea    0x10(%rsi),%rax
   0x0000000000401474 <+24>:    mov    %rax,(%rsp)
```

这里之所以要把参数丢到栈里面，是因为一些历史遗留原因。而把 `lea 0x14(%rsi), 0x8(%rsp)` 变成两步，是因为两步的性能更好。

总结一下，read six numbers 函数把我们的输入转化成 6 个数字保存在了栈上，这个连续内存的开始地址是 `0x7fffffffd980` ，同时也是调用 read six numbers 之前的 rsp 里面保存的内容，也是调用 read six numbers 后 rsp 里面的内容，这就是为什么会有这个指令的原因 `cmpl   $0x1,(%rsp)`。因为 rsp 里面的地址是第一个数字 (num1) 所在的地址。

```bash
(gdb) x/d $rsp
0x7fffffffd980: 1
```

我在做 phase_2 时， read six numbers 里面的内容困扰了我很久。最终我没有搞懂这里面到底发生了什么，而是将其视为一个黑盒，检查寄存器里面的内容，猜出来 rsp 里面的值的。说实话，没有搞明白 read six numbers 这个函数不会影响我们拆炸弹，但我在这里把这个写清楚的原因是因为我觉得在写题目过程中遇到一些搞不明白的东西真的很烦人，纵使他不影响你做题，他也会像一个疙瘩一样在心里作痒不停。

```bash
=> 0x0000000000400f0a <+14>:    cmpl   $0x1,(%rsp)
   0x0000000000400f0e <+18>:    je     0x400f30 <phase_2+52>
   0x0000000000400f10 <+20>:    call   0x40143a <explode_bomb>
   0x0000000000400f15 <+25>:    jmp    0x400f30 <phase_2+52>
   0x0000000000400f17 <+27>:    mov    -0x4(%rbx),%eax
   0x0000000000400f1a <+30>:    add    %eax,%eax
   0x0000000000400f1c <+32>:    cmp    %eax,(%rbx)
   0x0000000000400f1e <+34>:    je     0x400f25 <phase_2+41>
   0x0000000000400f20 <+36>:    call   0x40143a <explode_bomb>
   0x0000000000400f25 <+41>:    add    $0x4,%rbx
   0x0000000000400f29 <+45>:    cmp    %rbp,%rbx
   0x0000000000400f2c <+48>:    jne    0x400f17 <phase_2+27>
   0x0000000000400f2e <+50>:    jmp    0x400f3c <phase_2+64>
   0x0000000000400f30 <+52>:    lea    0x4(%rsp),%rbx
   0x0000000000400f35 <+57>:    lea    0x18(%rsp),%rbp
   0x0000000000400f3a <+62>:    jmp    0x400f17 <phase_2+27>
   0x0000000000400f3c <+64>:    add    $0x28,%rsp
   0x0000000000400f40 <+68>:    pop    %rbx
   0x0000000000400f41 <+69>:    pop    %rbp
   0x0000000000400f42 <+70>:    ret
```

现在我们跳出了 read six numbers 函数，第一个指令是和 1 进行比较，如果不相等就会爆炸。

下面我们用 num1...6 表示我们输入的数字。

那么我们的 num1 字就要是 1 ，跳到 +52 行，这里把 rbx 设置成了 rsp + 0x4 ，这是我们num2 的位置。而 rsp + 0x18 是一个循环边界。我们多看几步，在 +41 行可以看到 rbx += 0x4 后再和 rbp 进行比较。稍微计算一下，会循环 6 次。

回到现在所在的行数，jump 到 +27 行，`mov    -0x4(%rbx),%eax`， rbx - 0x4 也就是 num1 所在的地址，mov 会把这个地址的内容也就是 num1 赋值给 eax。

然后 `add    %eax,%eax` ，即 eax += eax，eax 变成 $2num1$ ， 比较 2num1 和 num2 ，如果不相等就引爆炸弹。

我们假设这两个值相等，亦即 num2 = 2，跳到 +41 行 ，rbx += 4，和 rbx 比较。然后回到 27 行，直到这两个值相等，跳到 64 行，表示这个函数结束。

现在我们可以概括出这个循环的轮廓了，用代码描述，大概长这样 ：

```cpp
    if (num[0] != 1) {
        explode_bomb();
    }
    for (int i = 1; i < 6; ++i) {
        if (num[i] != 2 * num[i - 1]) {
            explode_bomb();
        }
    }
```

到这里，我们已经可以解决这个 phase 了。很显然，答案就是 "1 2 4 8 16 32" 。

### Phase 3

我得承认，到这里我们已经经过了相当一段距离了，不过别灰心，让我们继续。

phase 3 似乎有点长，但乍一看，发现有很多个 jump 指令，而且都是跳往同一个地方 ：

```bash
Breakpoint 6, 0x0000000000400f43 in phase_3 ()
(gdb) disas
Dump of assembler code for function phase_3:
=> 0x0000000000400f43 <+0>:     sub    $0x18,%rsp
   0x0000000000400f47 <+4>:     lea    0xc(%rsp),%rcx
   0x0000000000400f4c <+9>:     lea    0x8(%rsp),%rdx
   0x0000000000400f51 <+14>:    mov    $0x4025cf,%esi
   0x0000000000400f56 <+19>:    mov    $0x0,%eax
   0x0000000000400f5b <+24>:    call   0x400bf0 <__isoc99_sscanf@plt>
   0x0000000000400f60 <+29>:    cmp    $0x1,%eax
   0x0000000000400f63 <+32>:    jg     0x400f6a <phase_3+39>
   0x0000000000400f65 <+34>:    call   0x40143a <explode_bomb>
   0x0000000000400f6a <+39>:    cmpl   $0x7,0x8(%rsp)
   0x0000000000400f6f <+44>:    ja     0x400fad <phase_3+106>
   0x0000000000400f71 <+46>:    mov    0x8(%rsp),%eax
   0x0000000000400f75 <+50>:    jmp    *0x402470(,%rax,8)
   0x0000000000400f7c <+57>:    mov    $0xcf,%eax
   0x0000000000400f81 <+62>:    jmp    0x400fbe <phase_3+123>
   0x0000000000400f83 <+64>:    mov    $0x2c3,%eax
   0x0000000000400f88 <+69>:    jmp    0x400fbe <phase_3+123>
   0x0000000000400f8a <+71>:    mov    $0x100,%eax
   0x0000000000400f8f <+76>:    jmp    0x400fbe <phase_3+123>
   0x0000000000400f91 <+78>:    mov    $0x185,%eax
   0x0000000000400f96 <+83>:    jmp    0x400fbe <phase_3+123>
   0x0000000000400f98 <+85>:    mov    $0xce,%eax
   0x0000000000400f9d <+90>:    jmp    0x400fbe <phase_3+123>
   0x0000000000400f9f <+92>:    mov    $0x2aa,%eax
   0x0000000000400fa4 <+97>:    jmp    0x400fbe <phase_3+123>
   0x0000000000400fa6 <+99>:    mov    $0x147,%eax
   0x0000000000400fab <+104>:   jmp    0x400fbe <phase_3+123>
   0x0000000000400fad <+106>:   call   0x40143a <explode_bomb>
   0x0000000000400fb2 <+111>:   mov    $0x0,%eax
   0x0000000000400fb7 <+116>:   jmp    0x400fbe <phase_3+123>
   0x0000000000400fb9 <+118>:   mov    $0x137,%eax
   0x0000000000400fbe <+123>:   cmp    0xc(%rsp),%eax
   0x0000000000400fc2 <+127>:   je     0x400fc9 <phase_3+134>
   0x0000000000400fc4 <+129>:   call   0x40143a <explode_bomb>
   0x0000000000400fc9 <+134>:   add    $0x18,%rsp
   0x0000000000400fcd <+138>:   ret
End of assembler dump.
```

按照惯例，先看看 rsi 里面的内容 ：

```bash
(gdb) x/s 0x4025cf
0x4025cf:       "%d %d"
```

这说明我们需要两个数字。根据之前的经验，rdx 和 rcx 分别是第三和第四参数，说明 rsp + 0x8 里面保存第一个数字，rsp + 0xc 里面保存第二个数字。

```bash
(gdb) x/s $rdi
0x603820 <input_strings+160>:   "1 2"
(gdb) adv *0x0000000000400f6a 
0x0000000000400f6a in phase_3 ()
(gdb) disas $pc, $pc + 0x4 * 8
Dump of assembler code from 0x400f6a to 0x400f8a:
=> 0x0000000000400f6a <phase_3+39>:     cmpl   $0x7,0x8(%rsp)
   0x0000000000400f6f <phase_3+44>:     ja     0x400fad <phase_3+106>
   0x0000000000400f71 <phase_3+46>:     mov    0x8(%rsp),%eax
   0x0000000000400f75 <phase_3+50>:     jmp    *0x402470(,%rax,8)
   0x0000000000400f7c <phase_3+57>:     mov    $0xcf,%eax
   0x0000000000400f81 <phase_3+62>:     jmp    0x400fbe <phase_3+123>
   0x0000000000400f83 <phase_3+64>:     mov    $0x2c3,%eax
   0x0000000000400f88 <phase_3+69>:     jmp    0x400fbe <phase_3+123>
End of assembler dump.
(gdb) x/dw $rsp + 0x8
0x7fffffffd9a8: 1
(gdb) x/dw $rsp + 0xc
0x7fffffffd9ac: 2
```

和我们的期望是一样的。下面的 ja 是 

![image](https://i.111666.best/image/9W7hqlF0ZJfUfiBAEM10PX.png)

这限制了我们的第一个参数只能在 0 和 7 之间，接下来是这两个指令 ：

```bash
   0x0000000000400f71 <+46>:    mov    0x8(%rsp),%eax
   0x0000000000400f75 <+50>:    jmp    *0x402470(,%rax,8)
```

第一个是把我们的第一个数放到 eax ，第二个是一个 jmp。* 表示间接跳转，是将操作数里面的值作为地址跳转。

我们随便敲几个数字进去，看看跳到哪里 ：

```bash
(gdb) x/xw 0x402470 + 8 * 0
0x402470:       0x00400f7c
(gdb) x/xw 0x402470 + 8 * 7
0x4024a8:       0x00400fa6
(gdb) x/xw 0x402470 + 8 * 6
0x4024a0:       0x00400f9f
(gdb) x/xw 0x402470 + 8 * 3
0x402488:       0x00400f8a
```

诶，这几个地址，刚好在我们的 phase_3 里面。结合之前的限制，我们可以猜出这是一个 switch 语句。

```bash
(gdb) x/xw *(0x402470 + 8 * 1)
0x400fb9 <phase_3+118>: 0x000137b8
```

```bash
   0x0000000000400fb9 <+118>:   mov    $0x137,%eax
   0x0000000000400fbe <+123>:   cmp    0xc(%rsp),%eax
   0x0000000000400fc2 <+127>:   je     0x400fc9 <phase_3+134>
   0x0000000000400fc4 <+129>:   call   0x40143a <explode_bomb>
   0x0000000000400fc9 <+134>:   add    $0x18,%rsp
```

这很简单，告诉我们第二个数字的值必须要是 0x137 也就是 311。

恭喜，我们成功拆解了第三个 phase，这个看起来吓人其实很简单的 phase。

### Phase 4

Halfway there !

```bash
Breakpoint 7, 0x000000000040100c in phase_4 ()
(gdb) disas
Dump of assembler code for function phase_4:
=> 0x000000000040100c <+0>:     sub    $0x18,%rsp
   0x0000000000401010 <+4>:     lea    0xc(%rsp),%rcx
   0x0000000000401015 <+9>:     lea    0x8(%rsp),%rdx
   0x000000000040101a <+14>:    mov    $0x4025cf,%esi
   # %d %d 之前看过的
   0x000000000040101f <+19>:    mov    $0x0,%eax
   0x0000000000401024 <+24>:    call   0x400bf0 <__isoc99_sscanf@plt>
   0x0000000000401029 <+29>:    cmp    $0x2,%eax
   0x000000000040102c <+32>:    jne    0x401035 <phase_4+41>
   0x000000000040102e <+34>:    cmpl   $0xe,0x8(%rsp)
   0x0000000000401033 <+39>:    jbe    0x40103a <phase_4+46>
   0x0000000000401035 <+41>:    call   0x40143a <explode_bomb>
   0x000000000040103a <+46>:    mov    $0xe,%edx
   0x000000000040103f <+51>:    mov    $0x0,%esi
   0x0000000000401044 <+56>:    mov    0x8(%rsp),%edi
   0x0000000000401048 <+60>:    call   0x400fce <func4>
   0x000000000040104d <+65>:    test   %eax,%eax
   0x000000000040104f <+67>:    jne    0x401058 <phase_4+76>
   0x0000000000401051 <+69>:    cmpl   $0x0,0xc(%rsp)
   0x0000000000401056 <+74>:    je     0x40105d <phase_4+81>
   0x0000000000401058 <+76>:    call   0x40143a <explode_bomb>
   0x000000000040105d <+81>:    add    $0x18,%rsp
   0x0000000000401061 <+85>:    ret
End of assembler dump.
```

和 phase 3 一样是输入两个数字，略过重复步骤，来到 34 行，告诉我们第一个数必须小于等于 0xe 。

跳到 46 行，这是在做 func4 的准备工作，不用关心这个，到时候我们可以直接打印寄存器来看。现在我们更关心调用 func4 后什么会导致爆炸。

首先检测返回值是不是 0，然后又检测我们的第二个输入的数字是不是 0。现在很明确了，我们的输入应该是这样 `? (<= 0xe) 0` 。

进入 func4 准备一探究竟吧 ：

```bash
(gdb) adv func4
0x0000000000400fce in func4 ()
(gdb) disas
Dump of assembler code for function func4:
=> 0x0000000000400fce <+0>:     sub    $0x8,%rsp
   0x0000000000400fd2 <+4>:     mov    %edx,%eax
   0x0000000000400fd4 <+6>:     sub    %esi,%eax
   0x0000000000400fd6 <+8>:     mov    %eax,%ecx
   0x0000000000400fd8 <+10>:    shr    $0x1f,%ecx
   0x0000000000400fdb <+13>:    add    %ecx,%eax
   0x0000000000400fdd <+15>:    sar    $1,%eax
   0x0000000000400fdf <+17>:    lea    (%rax,%rsi,1),%ecx
   0x0000000000400fe2 <+20>:    cmp    %edi,%ecx
   0x0000000000400fe4 <+22>:    jle    0x400ff2 <func4+36>
   0x0000000000400fe6 <+24>:    lea    -0x1(%rcx),%edx
   0x0000000000400fe9 <+27>:    call   0x400fce <func4>
   0x0000000000400fee <+32>:    add    %eax,%eax
   0x0000000000400ff0 <+34>:    jmp    0x401007 <func4+57>
   0x0000000000400ff2 <+36>:    mov    $0x0,%eax
   0x0000000000400ff7 <+41>:    cmp    %edi,%ecx
   0x0000000000400ff9 <+43>:    jge    0x401007 <func4+57>
   0x0000000000400ffb <+45>:    lea    0x1(%rcx),%esi
   0x0000000000400ffe <+48>:    call   0x400fce <func4>
   0x0000000000401003 <+53>:    lea    0x1(%rax,%rax,1),%eax
   0x0000000000401007 <+57>:    add    $0x8,%rsp
   0x000000000040100b <+61>:    ret
End of assembler dump.
```

看着很复杂，可是要记着我们输入的两个数字一个存在 edi 里面，一个压根没在这个 func4 里面出现，而 edi 也仅在 41 行和 20 行出现了分别出现了一次。

我们看看 41 行，edi 和 ecx 比较了一下，然后出现了一个分岔。

```cpp
if (ecx >= edi) {
	goto func4 + 57;
} else {
	esi = M[ecx + 1];
	func4();
	eax = 2 * eax + 1;
}
```

写成代码大概长这样，再看看 20 行 ：

```cpp
if (ecx <= edi) {
	goto func4 + 36;
} else {
	edx = M[rcx - 1];
	func4();
	eax += eax;
	goto func4 + 57;
}
```

诶，我们发现，如果说 ecx = edi 的话，就直接跳出去了。而恰好，36 行把 eax 赋值成了 0，那就看看 ecx 是怎么变化的。

在 20 行前面没有引入变量，那就是说，我只要跳到 20 行，打印 ecx 的值就可以了。

```bash
(gdb) adv *0x0000000000400fe2
0x0000000000400fe2 in func4 ()
(gdb) disas $pc, $pc + 4
Dump of assembler code from 0x400fe2 to 0x400fe6:
=> 0x0000000000400fe2 <func4+20>:       cmp    %edi,%ecx
   0x0000000000400fe4 <func4+22>:       jle    0x400ff2 <func4+36>
End of assembler dump.
(gdb) p $ecx
$23 = 7
```

诶，搞定！很简单对吧。

接下来我们来解析一下这个 func4 到底在干嘛。

重新 run 一下，让我们 display 一下这几个寄存器 ：

```bash
(gdb) disp $rdx
2: $rdx = 14
(gdb) disp $rax
3: $rax = 2
(gdb) disp $rsi
4: $rsi = 0
(gdb) disp $rcx
5: $rcx = 0
(gdb) disp $rdi
6: $rdi = 6
```

接下来每一次 si 都会打印这几个寄存器的值，方便我们查阅。

我们可以直观的看到每一次递归这些寄存器的变化，记录下来，观察一下就可以发现规律。不过为了防止太过繁琐，我就直接分析这几个寄存器了。

```bash
# edx = 14, esi = 0, edi = 7
   0x0000000000400fd2 <+4>:     mov    %edx,%eax
   # eax = edx
   0x0000000000400fd4 <+6>:     sub    %esi,%eax
   # eax = eax - esi
   0x0000000000400fd6 <+8>:     mov    %eax,%ecx
   # ecx = eax - esi
   0x0000000000400fd8 <+10>:    shr    $0x1f,%ecx
   # 0x1f = 31, shr 是逻辑右移， ecx = (eax - esi) >> 31
   # 我不知道这里为什么会是逻辑右移哈，按照他的意图，这里应该要是算术右移才对
   # 不过鉴于 edx 和 esi 都是正整数，并不影响这个地方
   0x0000000000400fdb <+13>:    add    %ecx,%eax
   # eax = eax - esi + ((eax - esi) >> 31)
   0x0000000000400fdd <+15>:    sar    $1,%eax
   # eax = (eax - esi + ((eax - esi) >> 31)) / 2
   0x0000000000400fdf <+17>:    lea    (%rax,%rsi,1),%ecx
   # ecx = rsi + rax
   #     = rsi + (eax - esi + ((eax - esi) >> 31)) / 2
   # 理论上来说是这样 = rsi + (eax - esi + ((eax - esi) < 0 ? -1 : 0)) / 2
   # 不过实际上是这样 = rsi + ((eax - esi) >> 1)
   # 这是一个防止整数溢出的操作
   # 看到这里你应该明白了，这是在求中位数
```

汇总一下已知情报，我们把这个代码翻译一下 ：

```cpp
void solve () {
    int tar;
    auto dfs = [&tar](this auto dfs, int low, int high) -> int {
        int mid = (low + high) >> 1;
        if (tar < mid) {
            return 2 * dfs(low, mid - 1);
        } else if (tar > mid) {
            return 2 * dfs(mid + 1, high) + 1;
        } else {
            return 0;
        }
    };

    for (int i = 0; i <= 14; ++i) {
        tar = i;
        int res = dfs(0, 14);
        if (res == 0) {
            std::println("{} {}", res, i);
        }
    }
}
```

打表可以知道，下面几个都是答案 ：

```txt
0 0
0 1
0 3
0 7
```

### Phase 5

其实到目前为止，最复杂的还是对于 phase 2 里面的 read six numbers 函数的分析。不过接下来这个 phase 虽然不难，但是很有意思。

```bash
(gdb) disas
Dump of assembler code for function phase_5:
=> 0x0000000000401062 <+0>:     push   %rbx
   0x0000000000401063 <+1>:     sub    $0x20,%rsp
   0x0000000000401067 <+5>:     mov    %rdi,%rbx
   0x000000000040106a <+8>:     mov    %fs:0x28,%rax
   0x0000000000401073 <+17>:    mov    %rax,0x18(%rsp)
   0x0000000000401078 <+22>:    xor    %eax,%eax
   0x000000000040107a <+24>:    call   0x40131b <string_length>
   0x000000000040107f <+29>:    cmp    $0x6,%eax
   0x0000000000401082 <+32>:    je     0x4010d2 <phase_5+112>
   0x0000000000401084 <+34>:    call   0x40143a <explode_bomb>
   0x0000000000401089 <+39>:    jmp    0x4010d2 <phase_5+112>
   0x000000000040108b <+41>:    movzbl (%rbx,%rax,1),%ecx
   0x000000000040108f <+45>:    mov    %cl,(%rsp)
   0x0000000000401092 <+48>:    mov    (%rsp),%rdx
   0x0000000000401096 <+52>:    and    $0xf,%edx
   0x0000000000401099 <+55>:    movzbl 0x4024b0(%rdx),%edx
   0x00000000004010a0 <+62>:    mov    %dl,0x10(%rsp,%rax,1)
   0x00000000004010a4 <+66>:    add    $0x1,%rax
   0x00000000004010a8 <+70>:    cmp    $0x6,%rax
   0x00000000004010ac <+74>:    jne    0x40108b <phase_5+41>
   0x00000000004010ae <+76>:    movb   $0x0,0x16(%rsp)
   0x00000000004010b3 <+81>:    mov    $0x40245e,%esi
   0x00000000004010b8 <+86>:    lea    0x10(%rsp),%rdi
   0x00000000004010bd <+91>:    call   0x401338 <strings_not_equal>
   0x00000000004010c2 <+96>:    test   %eax,%eax
   0x00000000004010c4 <+98>:    je     0x4010d9 <phase_5+119>
   0x00000000004010c6 <+100>:   call   0x40143a <explode_bomb>
   0x00000000004010cb <+105>:   nopl   0x0(%rax,%rax,1)
   0x00000000004010d0 <+110>:   jmp    0x4010d9 <phase_5+119>
   0x00000000004010d2 <+112>:   mov    $0x0,%eax
   0x00000000004010d7 <+117>:   jmp    0x40108b <phase_5+41>
   0x00000000004010d9 <+119>:   mov    0x18(%rsp),%rax
   0x00000000004010de <+124>:   xor    %fs:0x28,%rax
   0x00000000004010e7 <+133>:   je     0x4010ee <phase_5+140>
   0x00000000004010e9 <+135>:   call   0x400b30 <__stack_chk_fail@plt>
   0x00000000004010ee <+140>:   add    $0x20,%rsp
   0x00000000004010f2 <+144>:   pop    %rbx
   0x00000000004010f3 <+145>:   ret
End of assembler dump.
```


看这个地方，有个我们没见过的东西 ：

```bash
   0x000000000040106a <+8>:     mov    %fs:0x28,%rax
   0x0000000000401073 <+17>:    mov    %rax,0x18(%rsp)
   # 与此对应的，还有下面的几行
   0x00000000004010d9 <+119>:   mov    0x18(%rsp),%rax
   0x00000000004010de <+124>:   xor    %fs:0x28,%rax
   0x00000000004010e7 <+133>:   je     0x4010ee <phase_5+140>
   0x00000000004010e9 <+135>:   call   0x400b30 <__stack_chk_fail@plt>
```

这是一个金丝雀 (Canary) 值，如果你感到好奇的话，可以查阅这个博客 ：

[Stack Canaries – Gingerly Sidestepping the Cage](https://www.sans.org/blog/stack-canaries-gingerly-sidestepping-the-cage) 

让我们继续，将这个从代码里面排除，一开始还是要我们输入一个长度为 6 的字符串，然后跳到 112 行又跳回来。

一眼扫过去，还有一个 string not equal 函数，按照经验，先把里面的内容打印出来 ：

```bash
(gdb) x/s $rdi
0x6038c0 <input_strings+320>:   "alice"
(gdb) i r $rbx
rbx            0x0                 0
(gdb) x/s 0x40245e
0x40245e:       "flyers"
```

经过这个 string not equal 函数后，就跳到 119 行再跳到 140 行直到函数结束。

看起来我们需要一个 "flyers" ，不过前面还有那么长一堆代码，且让我们细细分析。

```bash
(gdb) x/s $rbx 
0x6038c0 <input_strings+320>:   "flyers"
(gdb) x/s $rdi
0x6038c0 <input_strings+320>:   "flyers"
# 之前 rbx 被赋值了
   0x000000000040108b <+41>:    movzbl (%rbx,%rax,1),%ecx
   0x000000000040108f <+45>:    mov    %cl,(%rsp)
   0x0000000000401092 <+48>:    mov    (%rsp),%rdx
   0x0000000000401096 <+52>:    and    $0xf,%edx
   0x0000000000401099 <+55>:    movzbl 0x4024b0(%rdx),%edx
   0x00000000004010a0 <+62>:    mov    %dl,0x10(%rsp,%rax,1)
   0x00000000004010a4 <+66>:    add    $0x1,%rax
   0x00000000004010a8 <+70>:    cmp    $0x6,%rax
   0x00000000004010ac <+74>:    jne    0x40108b <phase_5+41>
```

在跳到 41 行前，eax 被置 0，可以观察出这是一个长度为 6 的循环。

![image](https://i.111666.best/image/1pIj8B1qJbpeRW7OWWBN61.png)

我们一步一步来，第一句 `movzbl (%rbx,%rax,1),%ecx` ，在 rax = 0 的时候，source 值是 M[rbx]，也就是我们输入的第一个 char 的 ASCII 码。movzbl 的全称是 move zero extend byte to long，也就是把 source 的 low-byte 给零拓展到 rcx 里面，用于 unsigned 类型，b 是一个字节，也就是说明这是一个对 char 类型的操作。在 c 语言里面，这个指令大概长这样子 `int target = (int)str` 。

```bash
(gdb) p/c $rcx
$4 = 102 'f'
(gdb) p/x $rcx
$5 = 0x66
(gdb) p/x 0x66 & 0xf
$6 = 0x6
```

接下来把 rcx 的低位复制到 rdx 里面，再和 0xf 进行 & 操作。

现在 edx 里面的值是 6 了，这一行 ：

```bash
   0x0000000000401099 <+55>:    movzbl 0x4024b0(%rdx),%edx
```

仍然是一个强制类型转化，我们打印这里的值看看 ：

```bash
(gdb) x/s 0x4024b0
0x4024b0 <array.3449>:  "maduiersnfotvbylSo you think you can stop the bomb with ctrl-c, do you?"
(gdb) x/c 0x4024b0 + $rdx
0x4024b6 <array.3449+6>:        114 'r'
```

接下来把 edx 的低位保存到栈上，可以预见，`mov    %dl,0x10(%rsp,%rax,1)` 会随着 rax 的增加，每次把一个 char 放到 rsp + 0x10 + rax 开头的地址处。六次循环后会构造出一个长度为 6 的字符串。

假设我们已经完成了这个循环，看看下面几个语句 ：

```bash
   0x00000000004010ae <+76>:    movb   $0x0,0x16(%rsp)
   0x00000000004010b3 <+81>:    mov    $0x40245e,%esi
   0x00000000004010b8 <+86>:    lea    0x10(%rsp),%rdi
   0x00000000004010bd <+91>:    call   0x401338 <strings_not_equal>
```

rsp + 0x10 到 rsp + 0x15 是我们构造的字符数组，现在在 rsp + 16 处补充了一个 "\0"。

重新把 rsp + 10 复制给 rdi ，然后进行比较。因为 rdi 是第一个参数寄存器，rsi 是第二个参数寄存器。

```bash
(gdb) adv *0x00000000004010bd
0x00000000004010bd in phase_5 ()
(gdb) x/s $rdi
0x7fffffffd9a0: "rvfedu"
(gdb) x/s $rsi
0x40245e:       "flyers"
```

看到这里，大抵你已经发现了这个阶段的做法了。我们输入一个字符串，又根据这个字符串里的每个 char 和 0xf 与，将结果映射成另一个字符串，再判断这个新的字符串和 "flyers" 是否相等。

我们只需要逆向构造就行了。

```bash
"maduiersnfotvbylSo you think you can stop the bomb with ctrl-c, do you?"
flyers 对应的偏移是 9,15,14,5,6,7
0xf 是 1111
所以要找的 ASCII 码就是 96 +9, +15, +14 ...
你可以查 ASCII 表，也可以像我这样偷个懒
(gdb) p/c 96 + 9
$11 = 105 'i'
(gdb) p/c 96 + 15
$12 = 111 'o'
(gdb) p/c 96 + 14
$14 = 110 'n'
(gdb) p/c 96 + 5
$15 = 101 'e'
(gdb) p/c 96 + 6
$16 = 102 'f'
(gdb) p/c 96 + 7
$17 = 103 'g' 
```

答案就是 "ionefg" 啦。

### Phase 6

phase 6 将是我们碰到的最复杂难度最高的一个phase 6，他很长，而且很复杂。anway, 做好心理准备，我们继续。

![image](https://i.111666.best/image/oOAwRtn89AHg5YwZTgvWOL.png)

这里 read six numbers 和 phase 2 是同一个函数，同样的 rsp 存放 num1 的地址。

我们看看这里发生了什么 ：

```bash
(gdb) adv *0x000000000040110b
0x000000000040110b in phase_6 ()
(gdb) i r
rax            0x6                 6
rbx            0x0                 0
rcx            0x0                 0
rdx            0x0                 0
rsi            0x6                 6
rdi            0x7fffffffd2c0      140737488343744
rbp            0x7fffffffda60      0x7fffffffda60
rsp            0x7fffffffd940      0x7fffffffd940
r8             0xb                 11
r9             0x7fffffffd2c0      140737488343744
r10            0x0                 0
r11            0xffffffff          4294967295
r12            0x7fffffffdae8      140737488345832
r13            0x7fffffffd940      140737488345408
r14            0x7ffff7ffd000      140737354125312
r15            0x0                 0
rip            0x40110b            0x40110b <phase_6+23>
(gdb) x/d $rsp
0x7fffffffd940: 1
(gdb) x/d $rsp + 0x4
0x7fffffffd944: 2
(gdb) x/d $rsp + 0x4 * 2
0x7fffffffd948: 3
(gdb) x/d $rsp + 0x4 * 3
0x7fffffffd94c: 4
(gdb) x/d $rsp + 0x4 * 4
0x7fffffffd950: 5
(gdb) x/d $rsp + 0x4 * 5
0x7fffffffd954: 6
```

因为这里用了很多个寄存器，分析起来太过麻烦。观察这个表，可以知道 r13 里面的内容和 rsp 是一样的。所以我们可以解析接下来这几个命令。

```bash
=> 0x000000000040110b <+23>:    mov    %rsp,%r14
   0x000000000040110e <+26>:    mov    $0x0,%r12d
   0x0000000000401114 <+32>:    mov    %r13,%rbp
   0x0000000000401117 <+35>:    mov    0x0(%r13),%eax
   # eax = num1
   0x000000000040111b <+39>:    sub    $0x1,%eax
   # eax -= 1
   0x000000000040111e <+42>:    cmp    $0x5,%eax
   # eax 和 5 比较, 要求 eax <= 5
   0x0000000000401121 <+45>:    jbe    0x401128 <phase_6+52>
   # jbe 对 unsigned ，所以这里 eax >= 0
   # 也就有 num1 \in [1, 6]
   0x0000000000401123 <+47>:    call   0x40143a <explode_bomb>
```

我们只需要记住 num1 的地址在 `0x7fffffffd940` 就行，其他的比如 r14, rbp 就不许用关心了。上面这一块要求 num1 要小于等于 6，接着看 ：

```bash
   0x0000000000401128 <+52>:    add    $0x1,%r12d
   0x000000000040112c <+56>:    cmp    $0x6,%r12d
   0x0000000000401130 <+60>:    je     0x401153 <phase_6+95>
   0x0000000000401132 <+62>:    mov    %r12d,%ebx
   0x0000000000401135 <+65>:    movslq %ebx,%rax
   0x0000000000401138 <+68>:    mov    (%rsp,%rax,4),%eax
   0x000000000040113b <+71>:    cmp    %eax,0x0(%rbp)
   0x000000000040113e <+74>:    jne    0x401145 <phase_6+81>
   0x0000000000401140 <+76>:    call   0x40143a <explode_bomb>
   0x0000000000401145 <+81>:    add    $0x1,%ebx
   0x0000000000401148 <+84>:    cmp    $0x5,%ebx
   0x000000000040114b <+87>:    jle    0x401135 <phase_6+65>
   0x000000000040114d <+89>:    add    $0x4,%r13
   0x0000000000401151 <+93>:    jmp    0x401114 <phase_6+32>
```

这里 r12 和 6 比较，还有执行到 93 就跳转回去，这些信息告诉我们这是一个循环。

这三个指令在计算 rsp 的偏移量 ：

```bash
   0x0000000000401132 <+62>:    mov    %r12d,%ebx
   0x0000000000401135 <+65>:    movslq %ebx,%rax
   0x0000000000401138 <+68>:    mov    (%rsp,%rax,4),%eax
   # eax = r12 * 4 + rsp
   # r12 <- 1 ... 6 
```

所以，eax 里面会一次保留 num2, num3, ... , num6 。接下来和 rbp 里面的值作比较，还记得 rbp 里面是什么吗，打印一下 ：

```bash
(gdb) adv *0x000000000040113b
0x000000000040113b in phase_6 ()
(gdb) p/x $rbp
$20 = 0x7fffffffd940
# 是我们 num1 的地址
```

所以这里比较 num1 和 num2 ，他们必须不同。r13 也是 num1 的地址，把它 +0x4，接着跳回 32 行，这里是重复的过程 ：

```cpp
eax = num2;
if (num2 - 1 > 5) {
	explode_bomb();
}
goto phase_6+52
```

接下来又是 ：

```bash
   0x0000000000401132 <+62>:    mov    %r12d,%ebx
   0x0000000000401135 <+65>:    movslq %ebx,%rax
   0x0000000000401138 <+68>:    mov    (%rsp,%rax,4),%eax
   # eax = r12 * 4 + rsp
   # r12 = 2
```

把 num2 和 num3 作比较。现在我们可以推断出来这是在干什么了 ：

```cpp
for (int i = 0; i < 6; ++i) {
	if (num[i] > 6 || num[i] < 0) {
		explode_bomb();
	}
	if (i >= 1 && num[i] == num[i - 1]) {
		explode_bomb();
	}
}
// 汇编代码的逻辑并不严格是这样，不过大概上是一样的
```

这是 part 1，要求我们输入一个 1 到 6 的排列。我们输入 `1 2 3 4 5 6`， 接下来到 95 行。不难发现，这里又有一个小循环 ：

```bash
   0x0000000000401153 <+95>:    lea    0x18(%rsp),%rsi
   # rsi = address(num6)
   0x0000000000401158 <+100>:   mov    %r14,%rax
   # rax = address(num1)
   0x000000000040115b <+103>:   mov    $0x7,%ecx
   0x0000000000401160 <+108>:   mov    %ecx,%edx
   0x0000000000401162 <+110>:   sub    (%rax),%edx
   0x0000000000401164 <+112>:   mov    %edx,(%rax)
   0x0000000000401166 <+114>:   add    $0x4,%rax
   # rax += 0x4
   0x000000000040116a <+118>:   cmp    %rsi,%rax
   # compare rsi and rax
   0x000000000040116d <+121>:   jne    0x401160 <phase_6+108>
```

这里 

```bash
(gdb) i r $r14 $rsp
r14            0x7fffffffd940      140737488345408
rsp            0x7fffffffd940      0x7fffffffd940
```

r14 和 rsp 仍然是 num1 所在的地址。显然这里是一个长度为 6 的循环。

```bash
   0x000000000040115b <+103>:   mov    $0x7,%ecx
   0x0000000000401160 <+108>:   mov    %ecx,%edx
   # edx = 7
   0x0000000000401162 <+110>:   sub    (%rax),%edx
   # edx = 7 - num[i]
   0x0000000000401164 <+112>:   mov    %edx,(%rax)
   # address(rax) = edx
```

写成代码大概长这样 ：

```cpp
std::ranges::transform(num, num.begin(), [](int x) { return 7 - x; });
// 如果我们输入 1 2 3 4 5 6
// 输出 6 5 4 3 2 1
```

马上就到难点了 ：

```bash
   0x000000000040116f <+123>:   mov    $0x0,%esi
   0x0000000000401174 <+128>:   jmp    0x401197 <phase_6+163>
   0x0000000000401176 <+130>:   mov    0x8(%rdx),%rdx
   0x000000000040117a <+134>:   add    $0x1,%eax
   0x000000000040117d <+137>:   cmp    %ecx,%eax
   0x000000000040117f <+139>:   jne    0x401176 <phase_6+130>
   0x0000000000401181 <+141>:   jmp    0x401188 <phase_6+148>
   0x0000000000401183 <+143>:   mov    $0x6032d0,%edx
   0x0000000000401188 <+148>:   mov    %rdx,0x20(%rsp,%rsi,2)
   0x000000000040118d <+153>:   add    $0x4,%rsi
   0x0000000000401191 <+157>:   cmp    $0x18,%rsi
   0x0000000000401195 <+161>:   je     0x4011ab <phase_6+183>
   0x0000000000401197 <+163>:   mov    (%rsp,%rsi,1),%ecx
   0x000000000040119a <+166>:   cmp    $0x1,%ecx
   0x000000000040119d <+169>:   jle    0x401183 <phase_6+143>
   0x000000000040119f <+171>:   mov    $0x1,%eax
   0x00000000004011a4 <+176>:   mov    $0x6032d0,%edx
   0x00000000004011a9 <+181>:   jmp    0x401176 <phase_6+130>
```

这里有一个小循环 ：

```bash
   0x000000000040118d <+153>:   add    $0x4,%rsi
   0x0000000000401191 <+157>:   cmp    $0x18,%rsi
   0x0000000000401195 <+161>:   je     0x4011ab <phase_6+183>
   0x0000000000401197 <+163>:   mov    (%rsp,%rsi,1),%ecx
   # ecx = rsi + rsp, rsi = 0x4 ... 0x18
   # ecx = rsi + 0x4 ... 0x18
   # 依次是 address(num1), address(num2) ...
```

rcx 里面就会依次保存 num1 到 num6 了。166 行到 169 行：

```bash
   0x000000000040119a <+166>:   cmp    $0x1,%ecx
   0x000000000040119d <+169>:   jle    0x401183 <phase_6+143>
```

说是小于等于，不过只有当 rcx 里面是 1 时才会跳。下面两行把一个地址给了 edx ，跳到 130 行，进入循环。

这个地址里面有什么呢？打印一下看看：

```bash
(gdb) x 0x6032d0
0x6032d0 <node1>:       0x4c
# rdx = 0x6032d0
```

是一个值，跳到 130 行 ：

```bash
# eax = 1, rdx = 0x6032d0
   0x0000000000401176 <+130>:   mov    0x8(%rdx),%rdx
   # rdx = M[rdx + 0x8] = M[0x6032d0 + 0x8]
   0x000000000040117a <+134>:   add    $0x1,%eax
   0x000000000040117d <+137>:   cmp    %ecx,%eax
   0x000000000040117f <+139>:   jne    0x401176 <phase_6+130>
   # 这是一个小循环，直到 eax = ecx 才会结束，期间一直会发生 rdx = M[rdx + 0x8]
   # 这像什么呢？
   # 这很像一个数据结构，链表，就比如 ： node = *node.next
   # 这是一个联想，如果没想到呢，先打印地址看看
```

我们跟着循环来 ：

```bash
# eax = 1
(gdb) x/x 0x6032d0 + 0x8
0x6032d8 <node1+8>:     0x006032e0
# rdx = 0x006032e0
# eax = 2
(gdb) x/x 0x006032e0 + 0x8
0x6032e8 <node2+8>:     0x006032f0
# rdx = 0x006032f0
# eax = 3
(gdb) x/x 0x006032f0 + 0x8
0x6032f8 <node3+8>:     0x00603300
# rdx = 0x00603300
# ...
```

是不是有点感觉了，一口气把这里的内容都打印出来 ：

![image](https://i.111666.best/image/yGPqsDBE7MUirmBT5VYrVY.png)

地址表示是小端法，如图 ：

![image](https://i.111666.best/image/Usmyl9dZqe7CRYOi6Nn6Ym.png)

也就是 ：

```bash
# eax = 1
node1 = *node1.next = node2
# eax = 2
node2 = *node2.next = node3
# ...
```

这在内存中确实是一个链表，经过六次循环后， rdx 里面就是 address(node6) 了。

```bash
=> 0x0000000000401188 <+148>:   mov    %rdx,0x20(%rsp,%rsi,2)
   0x000000000040118d <+153>:   add    $0x4,%rsi
   0x0000000000401191 <+157>:   cmp    $0x18,%rsi
   0x0000000000401195 <+161>:   je     0x4011ab <phase_6+183>
```

来到 148 行，它又把多余的变量存在栈上了，根据经验，rsi 会循环到 0x18 ，而在栈上这个 rsp + 0x20 开始，每隔 0x8 会存一个地址。

还记得之前在 ecx = 1 的时候有一个分岔吗 ：

```bash
   0x000000000040119a <+166>:   cmp    $0x1,%ecx
   0x000000000040119d <+169>:   jle    0x401183 <phase_6+143>
   0x0000000000401183 <+143>:   mov    $0x6032d0,%edx
=> 0x0000000000401188 <+148>:   mov    %rdx,0x20(%rsp,%rsi,2)
```

edx 被直接赋值了 node1，这是因为 eax 里的默认值是 1，而小循环比较时会先把 eax + 1，如果进入小循环的话，eax 永远不会等于 ecx ，陷入死循环了。

所以我们可以画出这个内存 。

![image](https://i.111666.best/image/ZtUiSgBO854ZUxag8UszoA.png)

跳出这个给链表分配内存的循环，来到 183 行：

```bash
   0x00000000004011ab <+183>:   mov    0x20(%rsp),%rbx
   0x00000000004011b0 <+188>:   lea    0x28(%rsp),%rax
   0x00000000004011b5 <+193>:   lea    0x50(%rsp),%rsi
   0x00000000004011ba <+198>:   mov    %rbx,%rcx
   0x00000000004011bd <+201>:   mov    (%rax),%rdx
   0x00000000004011c0 <+204>:   mov    %rdx,0x8(%rcx)
   0x00000000004011c4 <+208>:   add    $0x8,%rax
   0x00000000004011c8 <+212>:   cmp    %rsi,%rax
   0x00000000004011cb <+215>:   je     0x4011d2 <phase_6+222>
   0x00000000004011cd <+217>:   mov    %rdx,%rcx
   0x00000000004011d0 <+220>:   jmp    0x4011bd <phase_6+201>
   0x00000000004011d2 <+222>:   movq   $0x0,0x8(%rdx)
   0x00000000004011da <+230>:   mov    $0x5,%ebp
   0x00000000004011df <+235>:   mov    0x8(%rbx),%rax
   0x00000000004011e3 <+239>:   mov    (%rax),%eax
   0x00000000004011e5 <+241>:   cmp    %eax,(%rbx)
   0x00000000004011e7 <+243>:   jge    0x4011ee <phase_6+250>
   0x00000000004011e9 <+245>:   call   0x40143a <explode_bomb>
   0x00000000004011ee <+250>:   mov    0x8(%rbx),%rbx
   0x00000000004011f2 <+254>:   sub    $0x1,%ebp
   0x00000000004011f5 <+257>:   jne    0x4011df <phase_6+235>
```

这是最后一个循环了，胜利在望。

```bash
   0x00000000004011ab <+183>:   mov    0x20(%rsp),%rbx
   # rbx = address(node6)
   0x00000000004011b0 <+188>:   lea    0x28(%rsp),%rax
   # rax = rsp + 0x28
   0x00000000004011b5 <+193>:   lea    0x50(%rsp),%rsi
   # (gdb) p/x 0x20 + 0x8 * 6
   # $24 = 0x50
```

模拟一下 ：

```bash
   0x00000000004011ba <+198>:   mov    %rbx,%rcx
   # rcx = address(node6) = 0x603320
   0x00000000004011bd <+201>:   mov    (%rax),%rdx
   # rdx = address(node5) = 0x603310
   0x00000000004011c0 <+204>:   mov    %rdx,0x8(%rcx)
   # M[rcx + 0x8] = address(node5)
   # *node6.next = address(node5)
   0x00000000004011c4 <+208>:   add    $0x8,%rax
   # rax = rsp + 0x20 + 0x8 * 2
   0x00000000004011c8 <+212>:   cmp    %rsi,%rax
   # cmp rsp + 0x50 , rsp + 0x20 + 0x8 * 2
   0x00000000004011cb <+215>:   je     0x4011d2 <phase_6+222>
   # 等于就 goto phase_6 + 222
   0x00000000004011cd <+217>:   mov    %rdx,%rcx
   # rcx = address(node5)
   0x00000000004011d0 <+220>:   jmp    0x4011bd <phase_6+201>

# rax = rsp + 0x20 + 0x8 * 2
# mov    (%rax),%rdx
# rdx = address(node4)
# mov    %rdx,0x8(%rcx)
# *node5.next = address(node4)
# add    $0x8,%rax
# rax = rsp + 0x20 + 0x8 * 3
# mov    %rdx,%rcx
# rcx = address(node4)
# (rax) = address(node3)
```

发现规律了吗，这是在建立一个链表，让 node6 -> node5 -> node4 -> node3 ...

来到 222 行 ：

```bash
   0x00000000004011d2 <+222>:   movq   $0x0,0x8(%rdx)
   0x00000000004011da <+230>:   mov    $0x5,%ebp
   0x00000000004011df <+235>:   mov    0x8(%rbx),%rax
   0x00000000004011e3 <+239>:   mov    (%rax),%eax
   0x00000000004011e5 <+241>:   cmp    %eax,(%rbx)
   0x00000000004011e7 <+243>:   jge    0x4011ee <phase_6+250>
```

此时 rdx 里面是 address(node1) ：

```bash
(gdb) p/x $rdx
$4 = 0x6032d0
```

让 node1 的 next 指向 null ， rbx 一开始保存了address(node6) ，接着模拟一下 ：

```bash
(gdb) p/x $rbx
$9 = 0x603320
(gdb) x/x $rbx + 0x8
0x603328 <node6+8>:     0x00603310
(gdb) x/x 0x00603310
0x603310 <node5>:       0x000001dd
(gdb) x/x $rbx
0x603320 <node6>:       0x000001bb
   0x00000000004011da <+230>:   mov    $0x5,%ebp
   0x00000000004011df <+235>:   mov    0x8(%rbx),%rax
   # M[rbx + 0x8] = 0x603310 = address(node5)
   # rax = address(node5)
   0x00000000004011e3 <+239>:   mov    (%rax),%eax
   # node5 = 0x1dd , eax = 0x1dd
   0x00000000004011e5 <+241>:   cmp    %eax,(%rbx)
   # compare 0x1dd , 0x1bb
   # 477, 443
   0x00000000004011e7 <+243>:   jge    0x4011ee <phase_6+250>
   # if (*rbx > eax) {
   #   jump
   # }
   # 这里 443 < 447，很遗憾，下一步就 BOOM!!! 了
```

这里要求我们第一个节点的值要大于第二个节点，现在的第一个节点之所以是 node6 ，是因为这个过程 ：

```bash
input : 1 2 3 4 5 6
transform to : 6 5 4 3 2 1
cycle i times , i = 6 ... 1
Therefore, we have a correspondence ： 1 -> 6 -> node6
4 -> 3 -> node3
```

在这里如果满足递减关系，跳到 250 行，rbx 变成 address(node5) ， ebp -- ，再跳到 235 行。

之前是循环里面只涉及 rbx ，所以下一个比较的是 node5 和 node4 。

至此，我们窥见了这最后一个循环的全貌 ： 判断整个链表是不是单调递减的。

还记得之前的那个表吗，里面记录了节点对应的值，按照值排序后是 `3 4 5 6 1 2` 。

所以我们要输入 `4 3 2 1 6 5`。

### Secret Phase

还记得我们的 bomb.asm 吗，我们在里面看到了一个 phase，就在 phase_6 下面。

![image](blob:https://111666.best/85b417b9-4040-4106-8027-75a02497b2b1)

这就是我们的隐藏奖励，我们看到他在 phase_defused 里面被调用 ：

![image](https://i.111666.best/image/6RmeT1X3mS0fBA7wOQlPfF.png)

4015d8 行告诉我们，这里必须要输入六个字符串后才被调用。看看输入格式 ：

```bash
(gdb) x/s 0x402619
0x402619:       "%d %d %s"
(gdb) x/s 0x402622
0x402622:       "DrEvil"
(gdb) x/s 0x603870
0x603870 <input_strings+240>:   "7 0"
```

我们看到这里打印的是 input_stings+240，那我们看看 ：

```bash
(gdb) x/s 0x603870 - 240
0x603780 <input_strings>:       "Border relations with Canada have never been better."
```

接下来我们暴力一点 ：

```
(gdb) x/171s 0x603780
```

输出太长了，就不贴上来了，我们看到，这是 phase_4 的输入。所以呢，我们要在 phase_4 的输入里加上一个 "DrEvil"。

重新 run 一下，我们成功进入了 secret phase ：

```bash
Breakpoint 2, 0x0000000000401242 in secret_phase ()
(gdb) disas
Dump of assembler code for function secret_phase:
=> 0x0000000000401242 <+0>:     push   %rbx
   0x0000000000401243 <+1>:     call   0x40149e <read_line>
   0x0000000000401248 <+6>:     mov    $0xa,%edx
   0x000000000040124d <+11>:    mov    $0x0,%esi
   0x0000000000401252 <+16>:    mov    %rax,%rdi
   0x0000000000401255 <+19>:    call   0x400bd0 <strtol@plt>
   0x000000000040125a <+24>:    mov    %rax,%rbx
   0x000000000040125d <+27>:    lea    -0x1(%rax),%eax
   0x0000000000401260 <+30>:    cmp    $0x3e8,%eax
   0x0000000000401265 <+35>:    jbe    0x40126c <secret_phase+42>
   0x0000000000401267 <+37>:    call   0x40143a <explode_bomb>
   0x000000000040126c <+42>:    mov    %ebx,%esi
   0x000000000040126e <+44>:    mov    $0x6030f0,%edi
   0x0000000000401273 <+49>:    call   0x401204 <fun7>
   0x0000000000401278 <+54>:    cmp    $0x2,%eax
   0x000000000040127b <+57>:    je     0x401282 <secret_phase+64>
   0x000000000040127d <+59>:    call   0x40143a <explode_bomb>
   0x0000000000401282 <+64>:    mov    $0x402438,%edi
   0x0000000000401287 <+69>:    call   0x400b10 <puts@plt>
   0x000000000040128c <+74>:    call   0x4015c4 <phase_defused>
   0x0000000000401291 <+79>:    pop    %rbx
   0x0000000000401292 <+80>:    ret
End of assembler dump.
```

这里告诉我们要输入一个数字，然后会调用 fun7，要求返回值是 2。输入的数字要小于等于 0x3e8 + 1。那就看看 fun7 吧。

```bash
(gdb) adv fun7
123
0x0000000000401204 in fun7 ()
(gdb) disas
Dump of assembler code for function fun7:
=> 0x0000000000401204 <+0>:     sub    $0x8,%rsp
   0x0000000000401208 <+4>:     test   %rdi,%rdi
   0x000000000040120b <+7>:     je     0x401238 <fun7+52>
   0x000000000040120d <+9>:     mov    (%rdi),%edx
   0x000000000040120f <+11>:    cmp    %esi,%edx
   0x0000000000401211 <+13>:    jle    0x401220 <fun7+28>
   0x0000000000401213 <+15>:    mov    0x8(%rdi),%rdi
   0x0000000000401217 <+19>:    call   0x401204 <fun7>
   0x000000000040121c <+24>:    add    %eax,%eax
   0x000000000040121e <+26>:    jmp    0x40123d <fun7+57>
   0x0000000000401220 <+28>:    mov    $0x0,%eax
   0x0000000000401225 <+33>:    cmp    %esi,%edx
   0x0000000000401227 <+35>:    je     0x40123d <fun7+57>
   0x0000000000401229 <+37>:    mov    0x10(%rdi),%rdi
   0x000000000040122d <+41>:    call   0x401204 <fun7>
   0x0000000000401232 <+46>:    lea    0x1(%rax,%rax,1),%eax
   0x0000000000401236 <+50>:    jmp    0x40123d <fun7+57>
   0x0000000000401238 <+52>:    mov    $0xffffffff,%eax
   0x000000000040123d <+57>:    add    $0x8,%rsp
   0x0000000000401241 <+61>:    ret
End of assembler dump.
```

这看起来又是一个递归，输入之前把 edi 赋值为了 0x6030f0，我们看看这里面有什么 ：

```bash
(gdb) x 0x6030f0
0x6030f0 <n1>:  0x00000024
```

再看回 fun7，首先 rdi 是第一个参数，rsi 是第二个参数，eax 是返回值，fun7 里面所有 source 操作都没有用到除了这三个以外的寄存器。

首先有 ：

```cpp
if (rdi == 0) {
	return -1;
}
```

然后 ：

```cpp
if (*rdi <= rsi) {
	goto fun7+28;
} else {
	rdi = *(rdi + 0x8);
	fun7(rdi, rsi);
	eax += eax;
	goto fun7+57;
}

fun7+28 :
eax = 0;
if (rsi == *rdi) {
	goto fun7+57;	
} else {
	rdi = *(rdi + 0x10);
	fun7(rdi, rsi);
	eax = 2 * eax + 1;
	goto fun7+57;
}

fun7+57:
eax = -1;
```

我们知道 rdi 的初始值是这个地址 `0x6030f0`，看他左跳右跳的，我们打印一下从这个地址开始的内容 ：

![image](https://i.111666.best/image/pCJ9ghRvfEmVFLZ99m0jmE.png)

和看起来和链表差不多，从一个地址指向另一个地址。

```bash
(gdb) x/x 0x6030f0 + 0x8
0x6030f8 <n1+8>:        0x00603110
(gdb) x/x 0x6030f0 + 0x10
0x603100 <n1+16>:       0x00603130
```

这说明，偏移 0x8 指向一个地址， 偏移 0x10 指向另一个地址，我们把这个图完全画出来：

![image](https://i.111666.best/image/vIOjO1TZiM18lhJhIwmONE.png)

这是一个完全二叉树，这样，我们就可以写出大概的代码了。

```cpp
struct Node {
    int val;
    Node* left;
    Node* right;
};

int fun7 (Node* root, int input_num) {
    if (root == nullptr) {
        return -1;
    }
    int value = root->val;
    if (value == input_num) {
        return 0;
    } else if (value < input_num) {
        int res = fun7(root->right, input_num);
        return 1 + 2 * res;
    } else {
        int res = fun7(root->left, input_num);
        return 2 * res;
    }
}
```

现在我们要求返回值是 2，那么这个 2 肯定是由 2 * 1 得来的，而 1 又是由 1 + 2 * 0 得来的。

而只有 input num 和 root->val 相等的时候，会返回 0。根据这个推断，我们要递归三次，顶层返回 2，第二层返回 1，第三层返回 0。

也就是说，我们的输入，第一次要小于 0x24，进入左分支，第二次要大于 0x8，进入右分支，第三次和 0x16 相等，返回。

所以，secret phase 的答案就是 0x16 也就是 22 啦。

至此，我们拆解了所有的 phase。

![image](https://i.111666.best/image/nWfv1lYzKyB69IgQVWbIx4.png)

## Conclusion

在做 Bomb Lab 时唯一一次爆炸是因为 answer 里面没有换行。。。

总的来说，这十几个小时我很满足，虽然他很难，但啃过去的感觉真的很不错，这也是自学的一大魅力吧 (其实是 M)。

gdb 还有很多特性和命令没有提到，比如其内置的 TUI 和插件等等。Bomb Lab 的整体设计很好，可惜还是有点缺乏引导性。汇编本身也没有这么简单，在实际工业上也会复杂很多。

也没有很多的想法可说，主要还是嘴巴笨，写不好。那本文到这里就正式结束了。

## Experimental materials and references


 - [x86 汇编表](https://cs.brown.edu/courses/cs033/docs/guides/x64_cheatsheet.pdf)
 - [x86-64 寄存器简介](https://wiki.osdev.org/CPU_Registers_x86-64)
 - [x86-64 ABI](https://gitlab.com/x86-psABIs/x86-64-ABI)
 - [CSAPP 汉化版](https://hansimov.gitbook.io/csapp/labs/bomb-lab)
 - [Graph Editor](https://csacademy.com/app/graph_editor/)
 - [更适合北大宝宝体质的 Bomb Lab 踩坑记](https://arthals.ink/blog/bomb-lab#%E9%98%85%E8%AF%BB%E6%BA%90%E7%A0%81)
 - [Guide to X86-64](https://web.stanford.edu/class/archive/cs/cs107/cs107.1196/guide/x86-64.html)
 - [godbolt](https://godbolt.org/)
 - [自学材料](http://csapp.cs.cmu.edu/3e/bomb.tar)
 - [README](https://csapp.cs.cmu.edu/3e/README-bomblab)
 - [课程 ppt](https://www.cs.cmu.edu/afs/cs/academic/class/15213-f15/www/schedule.html)
 - [教材原文](https://www.cs.sfu.ca/~ashriram/Courses/CS295/assets/books/CSAPP_2016.pdf)

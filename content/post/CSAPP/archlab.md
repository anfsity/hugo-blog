+++
title = "Archlab"
date = 2025-11-22T13:24:15+08:00
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

CMU 对外开放的 self-handout 有些问题，比如在 `isa.h` 里面声明了函数 `void free_reg();` 却在实现的时候 `void free_reg(mem_t);` 。

这会导致链接错误，还有由于当初使用的 `gcc` 版本太过古老，用现在的 `gcc` 会有 `ODR` 问题，需要修改 `Makefile` 里面的 `CFLAGS` 和 `LCFLAGS` 为 ：

```make
CFLAGS=-Wall -O1 -g -fcommon
LCFLAGS=-O1 -fcommon
```

如果没有 `Tcl/Tk` 的话要把下面这行注释掉 ：

```make
# Comment this out if you don't have Tcl/Tk on your system

# GUIMODE=-DHAS_GUI
```

详细的环境配置教程详见这篇文章--[Lab4 CSAPP: Archlab 高分(56.9/60.0)通过并配好Ubuntu20.04环境](https://zhuanlan.zhihu.com/p/454779772) 。
 
由于 cmu 的实验实在太过古老，而近几年 pku 对 Arch Lab 进行了大幅加强，我便用了 pku 今年的 Arch Lab 作为替代。

 > 感谢[elainafan](https://github.com/elainafan)提供的实验原材料。

pku 的 Arch Lab 在三个部分都有所改动，在 Part-a 部分，将最后的 `copy_block` 改成一个冒泡排序。对 Part-b 和 Part-c 进行了大幅加强，整个流水线使用 rust 进行了重构，增加了流水线的演进过程和部分 `lsp` 支持 (虽说使用体感很舒适， 但 rs 报错红一大片还是很使人畏惧的)，同时提供了一系列 CLI 工具，使得 coding 过程更加舒适。

Arch Lab 主要对应书的第四章 (处理器体系结构) 和第五章 (优化程序性能) 的内容。第四章内容繁杂，抛却知识本身的复杂度，我觉得书上的内容安排和叙述并不十分的详尽易懂这一点也很影响我在学习时的心情。不过虽然难熬，但也就是多看几遍多想一会的事，网上还有许多资料方便理解，也有 AI 供你提问。

整个实验分为三个 part，part-a 需要你亲自用 Y86-64 汇编写三个 C 语言函数对应的代码；在 part-b 你需要逐步完善出一个成熟的流水线；而在 part-c ，你需要对 ncopy.ys 的性能进行优化，使得其达到 Lab 需要的要求。

实验需要配置 rust [环境](https://rust-lang.org/tools/install/)，如果你使用的是 \*unix ，也可以使用包管理器来下载。建议同时下载 rs 的 lsp [rust-analyzer](https://rust-analyzer.github.io/) 以提供语法高亮和代码补全。

实验提供了 5 个二进制程序，首先使用 `cargo build` 来编译出二进制可执行文件。他们都位于 `archlab-project/target/debugger` 目录下，提供如下功能 ：

```txt
┌────────┬───────────────────────────┐
│ grader │ auto grader tool          │
├────────┼───────────────────────────┤
│ yas    │ y86-64 assembly           │
├────────┼───────────────────────────┤
│ yis    │ y86-64 simulator          │
├────────┼───────────────────────────┤
│ ydb    │ y86-64 debugger           │
├────────┼───────────────────────────┤
│ ysim   │ y86-64 pipeline simulator │
└────────┴───────────────────────────┘
```

每次重新编写程序后，运行以下指令来评分 ：

```bash
cargo build && ./target/debug/grader part-*
```

## Resources

 - [utexas 的 cs429 PPT](https://www.cs.utexas.edu/~byoung/cs429/syllabus429.html)

内容基本和 Arch Lab 重合，讲的很好。

 - [Arthals ICS Slide](https://slide.huh.moe/1)

Arthals 在 pku 小班的 PPT，同样讲的很好。

 - [我自己的实现和 handout](https://github.com/anfsity/CSAPP-LABs)

 - [B 站 up 主九曲阑干的视频讲解](https://www.bilibili.com/video/BV1e64y147vf/?spm_id_from=333.788.player.switch&vd_source=0c450959875cfbbddb557c006da7d8e4&trackid=web_related_0.router-related-2206146-pkt2c.1763005293448.793)

## Part-a

part-a 不算很难，在 Bomb Lab 里面看了那么多 x86-64 assembly，而这里要求你手写几个简单的 Y86-64 assembly。

我们对照书上的 4.15 节的代码照葫芦画瓢就行。

![](/post/CSAPP/images/Pasted%20image%2020251121083726.png)

编写 `sum.ys` 和 `rsum.ys`：

```asm
# Execution begins at address 0 
	.pos 0 
	irmovq stack, %rsp  	# Set up stack pointer  
	call main		# Execute main program
	halt			# Terminate program 

# Sample linked list
.align 8
ele1:
    .quad 0x00d
    .quad ele2
ele2:
    .quad 0x0e0
    .quad ele3
ele3:
    .quad 0xf00
    .quad 0

main:	
    irmovq ele1, %rdi	
    call sum_list # call sum_list(list_ptr ls) 
    ret 

# /* sum_list - Sum the elements of a linked list */
# long sum_list(list_ptr ls) {
#   long val = 0;
#   while (ls) {
#     val += ls->val;
#     ls = ls->next;
#   }
#   return val;
# }

sum_list:
    xorq %rax, %rax # val = 0
    andq %rdi, %rdi # set CC
    jmp test # goto test
loop:
    mrmovq (%rdi), %rsi # get ls->val
    addq %rsi, %rax # val += ls->val
    mrmovq 8(%rdi), %rdi # ls = ls->next
    andq %rdi, %rdi # set CC
test:
    jne loop
    ret

    .pos 0x200
stack:
```

```asm
# /* rsum_list - Recursive version of sum_list */
# long rsum_list(list_ptr ls) {
#   if (!ls)
#     return 0;
#   else {
#     long val = ls->val;
#     long rest = rsum_list(ls->next);
#     return val + rest;
#   }
# }

rsum_list:
    andq %rdi, %rdi
    je kill
    mrmovq (%rdi), %rsi
    pushq %rsi
    mrmovq (%rdi), %rax
    mrmovq 8(%rdi), %rdi
    call rsum_list
    popq %rsi
    addq %rsi, %rax
    ret
kill:
    xorq %rax, %rax
    ret

    .pos 0x200
stack:
```

`bubble.ys` 稍微复杂一点，有两个循环，按照先写大循环再写小循环，然后填充细节的思路，可以成功做出。虽然阅读这种多重循环的汇编没什么困难，但是实际自己动手写的时候还是很烧脑的。

注意一下里面的数据都是 64 位的，指针的增加一次是 0x8 而不是 0x1。忘记了这一点让我 debug 好久。

完整的 `bubble.ys`。

```asm
	.pos 0
	irmovq	stack,%rsp
	call main
	halt

	.align 8
array:
	.quad 0xbca
	.quad 0xcba
	.quad 0xacb
	.quad 0xcab
	.quad 0xabc
	.quad 0xbac
	
################################################################################
# You may want to modify this portion

bubble_a:
	rrmovq %rdi, %rdx
	addq %rsi, %rdx # last = data + count - 1
loop1:
# rcx <- i, rdx <- last	
	rrmovq %rdi, %rcx
loop2:
	# if a[i] > a[i + 1]
	mrmovq 8(%rcx), %r8 # *(i + 1)
	mrmovq (%rcx), %r9 # *i
	subq %r8, %r9 # *i <= *(i + 1)
	jle continue 

swap:
	mrmovq 8(%rcx), %r8 # t = *(i + 1)
	mrmovq (%rcx), %r9 
	rmmovq %r9, 8(%rcx) # *(i + 1) = *i
	rmmovq %r8, (%rcx) # *i = t
continue:
	# i++
	irmovq $8, %r8
	addq %r8, %rcx
	# compare i, last
	rrmovq %rdx, %r8
	subq %rcx, %r8 # last - i > 0
	jg loop2

	irmovq $8, %r8
	subq %r8, %rdx # last --
	rrmovq %rdx, %rcx 
	subq %rdi, %rcx # last - data > 0
	jg loop1 # if last > data jump
	ret

main:
	irmovq array, %rdi
	irmovq $40, %rsi
	call bubble_a
	ret

	.pos 0x200
stack:
```

写完这三个 Y86 汇编，你应该对他有了一定的了解，这为我们优化 `ncopy.ys` 打下了足够的基础。

## Part-b

prat-b 需要修改以下文件 ：

![](/post/CSAPP/images/Pasted%20image%2020251121090126.png)

hcl-rs 的语法在 `archlab/archlab-project/assets/hcl-rs.pdf` 里面有详细叙述。

 > 顺便安利一下 [typst](https://typst.app/docs/)，因为我看到他的 pdf 也是用 typst 写的。

Lab 里面有一个十分 nice 的功能，你可以使用 `ysim` 生成架构内部的详细依赖。

![](/post/CSAPP/images/Pasted%20image%2020251121174422.png)
在浏览器里面打开：

![](/post/CSAPP/images/Pasted%20image%2020251121174511.png)
当你的鼠标移到某个节点时，就像一个聚光灯让所有包含这个节点的链路高亮，依赖关系一目了然，真的很好用。

### IOPQ

首先我们需要在 `seq_full.rs` 里面添加 $IOPQ$ 功能，模仿书上的格式，可以总结出 $IOPQ$ 的行为：

![](/post/CSAPP/images/Pasted%20image%2020251121090438.png)

在 `fetch` 阶段，需要 `valC`，做出改动如下 ：

```rust
bool instr_valid = icode in // CMOVX is the same as RRMOVQ
    { NOP, HALT, CMOVX, IRMOVQ, RMMOVQ, MRMOVQ,
    OPQ, IOPQ, JX, CALL, RET, PUSHQ, POPQ };

// Does fetched instruction require a regid byte?
bool need_regids =
    icode in { CMOVX, OPQ, IOPQ, PUSHQ, POPQ, IRMOVQ, RMMOVQ, MRMOVQ };

// Does fetched instruction require a constant word?
bool need_valC = icode in { IOPQ, IRMOVQ, RMMOVQ, MRMOVQ, JX, CALL };
```

在 `decode` 阶段需要计算 `valB` 和 `dstE` ，修改如下 ：

```rust
// What register should be used as the B source?
u8 srcB = [
    icode in { OPQ, IOPQ, RMMOVQ, MRMOVQ } : ialign.rB;
    icode in { PUSHQ, POPQ, CALL, RET } : RSP;
    true : RNONE; // Don't need register
];

@set_input(reg_read, {
    srcA: srcA,
    srcB: srcB,
});

// What register should be used as the E destination?
u8 dstE = [
    icode in { CMOVX } && cnd : ialign.rB;
    icode in { IRMOVQ, OPQ, IOPQ} : ialign.rB;
    icode in { PUSHQ, POPQ, CALL, RET } : RSP;
    true : RNONE; // Don't write any register
];
```

同理对 `execute` 修改 ：

```rust
// Select input A to ALU
u64 aluA = [
    icode in { CMOVX, OPQ } : reg_read.valA;
    icode in { IRMOVQ, RMMOVQ, MRMOVQ, IOPQ } : ialign.valC;
    icode in { CALL, PUSHQ } : NEG_8;
    icode in { RET, POPQ } : 8;
    // Other instructions don't need ALU
];

// Select input B to ALU
u64 aluB = [
    icode in { RMMOVQ, MRMOVQ, OPQ, IOPQ, CALL,
              PUSHQ, RET, POPQ } : reg_read.valB;
    icode in { CMOVX, IRMOVQ } : 0;
    // Other instructions don't need ALU
];

// Should the condition codes be updated?
bool set_cc = icode in { OPQ, IOPQ };
```

这样我们就完成了这小节的任务。

### pipes3*

接下来我们需要完善流水线，首先 Lab 提供了一个正确的二阶段流水线，它有很多缺点，但是没有冒险发生。

但是二阶段流水线的关键路径实在是太长了，我们需要对他做出优化。

根据 pipes3a 的注释，我们把 `D` 阶段拆分出 `E` 阶段，但是这就会导致数据冒险的发生，也需要修改 `f_pc` 的逻辑。

```rust
//! 1. `reg_read` and `reg_write` are now in different pipeline stages, which 
//!    can lead to data hazards.
//! 2. The operands used in the calculation of `f_pc` are also split across
//!    different pipeline stages, which is actually incorrect because values in 
//!    different pipeline stages at a specific time belong to different
//!    instructions.
```

首先我们修改 `f_pc` 的选择逻辑 ：

```rust
// What address should instruction be fetched at?
// We use D.icode because we use the icode in the last cycle to determine the
// next PC.
u64 f_pc = [
    // Call.  Use instruction constant
    // If the previous instruction is CALL, the constant value should be the next PC
    // valC is from Fetch Stage, thus the last cycle
    D.icode == CALL : D.valC;
    // Taken branch.  Use instruction constant
    E.icode == JX && e_cnd : E.valC;
    // Completion of RET instruction.  Use value from stack
    // valM is from DEMW stage, thus the current cycle
    E.icode == RET : e_valM;
    // Default: Use incremented PC
    1 : F.valP;
];
```

此时还没有实现 PC 预测的逻辑，我们对着 SEQ+ 的逻辑进行修改就行了。

如果 `E` 阶段的 `icode` 是 `JX` 并且 `cc` 是 `true` ，那么就使用 `valC` ，否则使用 `valP` 。
如果 `E` 阶段的 `icode` 是 `RET` ，此时 PC 需要被设置为栈里面储存的值也就是 `e_valM`。

将 `e_dstE` 的选择逻辑填充如下：

```rust
u8 e_dstE = [
    E.icode == CMOVX && !e_cnd : RNONE;
    1 : E.dstE;
];
```

然后将数据冒险的逻辑填充如下：

```rust
bool data_harzard = d_srcA != RNONE && d_srcA in { e_dstE, e_dstM }
    || d_srcB != RNONE && d_srcB in {e_dstE, e_dstM};

bool f_stall = D.icode in { JX, RET } || data_harzard;

@set_stage(f, {
    stall: f_stall,
});

bool d_stall = data_harzard;
```

```
instruction1
instruction2
```

当发生写后读 (RAW) 数据冒险时，此时指令一处于 `E` 阶段， 指令 2 处于 `D` 阶段，指令 2 需要读取的寄存器正在被指令 1 写入，此时需要将指令 1 的计算结果直接转发给指令 2 ，让指令 2 的 `E` 阶段结果保持正确。

但是此时并没有实现旁路转发的逻辑，所以流水线不得不对 `F` 和 `D` 进行暂停同时对 `E` 插入 bubble 以等待正确的结果被写入目的寄存器。

 > P.S. 写到这里的时候我还在想这里为什么要暂停，原来是我忘记了还可以等待。

`JX` 和 `RET` 指令也是同样的逻辑，等待正确结果计算出来。

pipes3b 就对 pipes3a 总是暂停流水线这一行为进行了优化，实现了旁路转发。

```rust
// forward data in RAW hazards
u64 d_valA = [
    d_srcA == e_dstE : e_valE;
    d_srcA == e_dstM : e_valM;
    1: reg_read.valA;
];
u64 d_valB = [
    d_srcB == e_dstE : e_valE;
    d_srcB == e_dstM : e_valM;
    1: reg_read.valB;
];
```

由于解决了数据冒险，对于流水线寄存器控制阶段的代码就可以去除掉数据冒险了：

```rust
bool f_stall = D.icode in { JX, RET };

@set_stage(f, {
    stall: f_stall,
});


bool d_stall = false;

bool d_bubble = D.icode in { JX, RET };
```

pipes3b 仍然不够好，因为 `JX` 指令总是暂停流水线，而我们可以让其"抢跑"，实现分支预测逻辑，直到发生错误后再纠正它。

这就是我们要在 pipes3c 里面需要实现的任务。

我们添加总是跳转的分支预测。

由于添加了分支预测功能，为了保证流水线的正确性，同时还需要实现当分支预测错误时的纠正逻辑。

修改如下：

```rust
// What address should instruction be fetched at?
// We use D.icode because we use the icode in the last cycle to determine the
// next PC.
u64 f_pc = [
    // Call.  Use instruction constant
    // If the previous instruction is CALL, the constant value should be the next PC
    // valC is from Fetch Stage, thus the last cycle
    D.icode == CALL : D.valC;
    // Branch misprediction.  Use incremental PC
    E.icode == JX && !e_cnd : E.valP;
    // Completion of RET instruction.  Use value from stack
    // valM is from DEMW stage, thus the current cycle
    E.icode == RET : e_valM;
    // Default: Use predicted PC
    1 : F.pred_pc;
];
```

```rust
// If a branch misprediction is detected during the Execute stage, it means that
// the instruction currently in the Decode stage is invalid. Therefore, the next
// cycle’s Execute stage needs to insert a bubble.
bool branch_mispred = E.icode in {JX} && !e_cnd;

// If the current instruction in the Decode stage is a RET, then the instruction
// in the current Fetch stage is invalid. Therefore, the next cycle’s Fetch stage 
// needs to insert a bubble.
bool ret_harzard = D.icode == RET;

// If both a branch misprediction and a RET hazard occur at the same time, since 
// the jump instruction is executed before the RET, the RET should not have been 
// executed, so a stall is not needed.
bool f_stall = ret_harzard && !branch_mispred;

@set_stage(f, {
    stall: f_stall,
});


bool d_stall = false;

// If both a branch misprediction and a ret hazard occur at the same time,
// since the jump instruction is executed before the RET, the RET should not
// have been executed. Therefore, a bubble is not needed.
bool d_bubble = ret_harzard && !branch_mispred;

@set_stage(d, {
    stall: d_stall,
    bubble: d_bubble,
});

bool e_bubble = branch_mispred;
```

```
instruction1 jmp
instruction2 false
instruction3 true
```

当发生分支预测错误时，`e_cnd` 在 `E` 阶段产生，此时 `E.icode` 等于 `JX` 同时 `e_cnd = false` 。

指令 2 处于译码阶段，为了避免错误修改寄存器状态，需要将指令 2 的 `D` 阶段的产生数据冲刷掉，对指令 2 `E` 阶段插入 `bubble`。

因为 `D` 阶段不会改变寄存器状态，所以不需要对 `D` 进行暂停或插入 `bubble`。

指令 3 处于取指阶段，指令 1 将正确的 PC 设置给指令 3，指令 3 执行正确的指令。

由于只有三个流水线寄存器，如果发生 load/use hazard ，它仅仅被视为数据冒险进行旁路转发即可。

pipes3d 介绍了一个没有在书上出现的概念 --- structural hazard。

![](/post/CSAPP/images/Pasted%20image%2020251121113716.png)

结构冒险发生在同时对寄存器进行读取，比如上图， `M` 和 `F` 同时对 `rA` 或 `rB` 访问，这就导致了结构冒险。

可以通过增加硬件的方式来解决结构冒险，或者在逻辑上调控 `M` 和 `F` 对寄存器访问的先后顺序，避免对寄存器同时访问。

 > [Structural Hazards](https://medium.com/@s.ruban2000/structural-hazards-f75da24190ec)

可能是起到一个介绍作用，pipes3d 不需要做任何额外修改即可通过。

### pipes4*

 > pipes4b/c 的 `f_pc` 里的 `e_cnd` 需要修改为 `M.cnd` 。

pipes4* 将 `E` 阶段进一步拆分出 `M` 阶段，优化了依赖路径的同时也引入了一些新的冲突。

在 `f_pc` 中，由于引入了 `M` 阶段，需要做出修改 ：

```rust
// What address should instruction be fetched at?
// We use D.icode because we use the icode in the last cycle to determine the
// next PC.
u64 f_pc = [
    // Call.  Use instruction constant
    // If the previous instruction is CALL, the constant value should be the next PC
    // valC is from Fetch Stage, thus the last cycle
    D.icode == CALL : D.valC;
    // Branch misprediction.  Use incremental PC
    E.icode == JX && !e_cnd : E.valP;
    // Completion of RET instruction.  Use value from stack
    // valM is from DEMW stage, thus the current cycle
    M.icode == RET : m_valM;
    // Default: Use predicted PC
    1 : F.pred_pc;
];
```

在 `D` 阶段的旁路转发也需要做出修改：

```rust
u64 d_valA = [
    d_srcA == e_dstE : e_valE;
    d_srcA == m_dstM : m_valM;
    1: reg_file.valA;
];
u64 d_valB = [
    d_srcB == e_dstE : e_valE;
    d_srcB == m_dstM : m_valM;
    1: reg_file.valB;
];
```

由于新增了 `M` 阶段， `ret hazard` 需要做出修改，具体行为如下图所示：

![](/post/CSAPP/images/Pasted%20image%2020251121165600.png)

对比一下 CSAPP ：

![](/post/CSAPP/images/Pasted%20image%2020251121163346.png)

你会发现 Lab 实现了$M \rightarrow F$ 转发，注意到这一点花了我不少功夫🙂。而书上等待了一个周期。

其余的逻辑也是这样的，直接在同周期转发而不是等待到下一个周期。

分支预测的判断逻辑保持不变，新增 `load/use hazard`。

其具体行为如下：

![](/post/CSAPP/images/Pasted%20image%2020251121165125.png)

当发生 `load/use hazard` 时，暂停下一个指令的 `D` 和下下个指令的 `F`，向下一个指令的 `E` 插入 `bubble`。强制暂停整个流水线一个周期后，将 `m_valM` 转发给 `d_valA/B` 。

为了性能，我们是不会去暂停不必要的寄存器的。

![](/post/CSAPP/images/Pasted%20image%2020251121165313.png)


```rust
// If a branch misprediction is detected during the Execute stage, it means that
// the instruction currently in the Decode stage is invalid. Therefore, the next
// cycle’s Execute stage needs to insert a bubble.
bool branch_mispred = E.icode in {JX} && !e_cnd;

// If a RET instruction is detected in either the Decode or Execute stage, then
// the instruction in the current Fetch stage is invalid. Therefore, a bubble
// needs to be inserted in the Fetch stage for the next cycle.
//
// In fact, when E.icode == RET, the instruction in the current Decode stage is 
// also invalid, but because the D.icode in the previous cycle was RET, at this
// point D.icode == NOP, so there's no need to add a condition for e_bubble.
bool ret_harzard = RET in { D.icode, E.icode };

// This instruction needs to read from a register whose data was loaded from
// memory by the previous instruction, but the previous instruction is still in
// the Execute stage, causing a data hazard.
bool load_use_harzard = E.icode in { MRMOVQ, POPQ } && E.dstM in { d_srcA, d_srcB };
// an equivalent expression:
// bool load_use_harzard = E.dstM != RNONE && E.dstM in { d_srcA, d_srcB };

// If both a branch misprediction and a RET hazard occur at the same time, 
// since the jump instruction is executed before the RET, the RET should not be 
// executed, so no stall is required.
bool f_stall = ret_harzard && !branch_mispred || load_use_harzard;

@set_stage(f, {
    stall: f_stall,
});


bool d_stall = load_use_harzard;

// If both a branch misprediction and a RET hazard occur at the same time,
// since the jump instruction is executed before the RET, the RET should not
// have been executed, so a bubble is not needed.
// 
// Actually, ret_harzard and d_stall cannot be true at the same time.
bool d_bubble = ret_harzard && !branch_mispred && !d_stall;

@set_stage(d, {
    stall: d_stall,
    bubble: d_bubble,
});

bool e_bubble = branch_mispred || load_use_harzard;
```

pipe4b 开始的版本没有修改 `e_cnd` ，硬控我不少时间😇。虽然依据注释也可以猜到这里应该修改成 `M.cnd`，但彼时的我对流水线还是一知半解，远没有现在理解的透彻。

由于 `e_cnd` 转发到 `f_pc` 的依赖路径太长，我们把 `e_cnd` 储存到 `M` 阶段，再转发到 `f_pc` 。这样能缩减不少路径，不过也会由此产生流水线暂停。这也是一种 trade-off 。

由于我们仅仅是将 `e_cnd` 延长至 `M.cnd` ，并不要对其他的逻辑修改。

```rust
    // Branch misprediction.  Use incremental PC
    M.icode == JX && !M.cnd : M.valP;
```

我们来对比一下修改前后的分支预测逻辑。

修改前：

![](/post/CSAPP/images/Pasted%20image%2020251121170832.png)

不需要考虑 `instructionI` 是不是 `ret` ，因为根本不影响。流水线只会浪费掉一个周期。

而修改后：

![](/post/CSAPP/images/Pasted%20image%2020251121170945.png)

要等到 `M` 阶段才会进行转发，此时流水线会浪费两个周期，加载两个无效指令。

同时引入了一个新的问题，如果 `instructionI` 是 `ret` ，那么 `ret hazard` 也必须要被触发。

![](/post/CSAPP/images/Pasted%20image%2020251121171656.png)

由图逻辑可以写出代码：

```rust
// If a branch misprediction is detected during the Execute stage, it means that
// the instruction currently in the Decode stage is invalid. Therefore, the next
// cycle’s Execute stage needs to insert a bubble.
// bool branch_mispred = E.icode in {JX} && !e_cnd;
bool branch_mispred = E.icode in {JX} && !e_cnd;

// If a RET instruction is detected in either the Decode or Execute stage, then
// the instruction in the current Fetch stage is invalid. Therefore, a bubble
// needs to be inserted in the Fetch stage for the next cycle.
//
// In fact, when E.icode == RET, the instruction in the current Decode stage is 
// also invalid, but because the D.icode in the previous cycle was RET, at this
// point D.icode == NOP, so there's no need to add a condition for e_bubble.
bool ret_harzard = RET in { D.icode, E.icode };

// This instruction needs to read from a register whose data was loaded from
// memory by the previous instruction, but the previous instruction is still in
// the Execute stage, causing a data hazard.
bool load_use_harzard = E.icode in { MRMOVQ, POPQ } && E.dstM in { d_srcA, d_srcB };
// an equivalent expression:
// bool load_use_harzard = E.dstM != RNONE && E.dstM in { d_srcA, d_srcB };

// Unlike in `pipe_s4a`, here we do not need to consider the case of branch 
// misprediction (since in the next cycle, Fetch will always get the `f_pc`
// from `M.valP`).
bool f_stall = ret_harzard || load_use_harzard;

@set_stage(f, {
    stall: f_stall,
});


bool d_stall = load_use_harzard;

// Unlike in `pipe_s4a`, when a branch misprediction occurs, we directly insert
// a bubble, because the instruction in the Fetch stage at that point is invalid.
// Actually, ret_harzard and d_stall cannot be true at the same time.
bool d_bubble = branch_mispred || ret_harzard && !d_stall;

@set_stage(d, {
    stall: d_stall,
    bubble: d_bubble,
});

bool e_bubble = branch_mispred || load_use_harzard;
```

你可能会疑惑，这个 `D` 里面的 `bubble` 能不能去掉呢，它看起来很没必要，事实上是可以的。

![](/post/CSAPP/images/Pasted%20image%2020251121173211.png)

不过在如上特殊情况，流水线又要多暂停一个周期，多少有点得不偿失。

去掉 `D` 里面的 `bubble` 也是正确的，可以通过测试。

pipes4c 告诉我们需要整合 `D.vaP` 到 `d_valA` 里面，这个要求很简单。

![](/post/CSAPP/images/Pasted%20image%2020251121173914.png)

```rust
// What address should instruction be fetched at?
// We use D.icode because we use the icode in the last cycle to determine the
// next PC.
u64 f_pc = [
    // Call.  Use instruction constant
    // If the previous instruction is CALL, the constant value should be the next PC
    // valC is from Fetch Stage, thus the last cycle
    D.icode == CALL : D.valC;
    // Branch misprediction.  Use incremental PC
    M.icode == JX && !M.cnd : M.valA;
    // Completion of RET instruction.  Use value from stack
    // valM is from DEMW stage, thus the current cycle
    M.icode == RET : m_valM;
    // Default: Use predicted PC
    1 : F.pred_pc;
];
```

和 

```rust
// We've feed D.valP into d_valA. Thus M.valP is not needed.
u64 mem_data = M.valA;
```

彻底搞定。

```bash
cargo build && ./target/debug/grader part-b
```

## Part-c

part-c 需要你优化 `ncopy.ys` 的性能，这里引入两个概念：流水线 $CPE$ 和 $Arch\ cos t$。

*   CPE (Cycles Per Element)
    即每元素周期数。用于衡量代码的执行效率。
    若模拟代码复制 $N$ 个元素总共需要 $C$ 个时钟周期，则 CPE 计算公式为：
    $$ \text{CPE} = \frac{C}{N} $$

*   Arch Cost (Architecture Cost)
    即架构关键路径长度。
    在本实验中，关键路径长度被简化定义为：
    $$ \text{Arch Cost} = 1 + \text{路径上串联的硬件设备（单元）的最大数量} $$

为了综合衡量代码效率与硬件设计复杂度，定义综合性能指标 $c$ 如下：

$$ c = \text{CPE} + 2 \times \text{Arch Cost} $$

根据计算出的综合指标 $c$，最终得分 $S$ 的计算规则如下：

$$
S =
\begin{cases}
0, & c > 19.0 \\
19.0 \times (19.0 - c), & 16.0 < c \leq 19.0 \\
57, & 15.0 < c \leq 16.0 \\
60, & c \leq 15.0
\end{cases}
$$

首先我们把 `ncopy.ys` 抽象成高级语言：

```cpp
// src -> %rdi
// dst -> %rsi
// len -> %rdx
// count -> %rax

long long ncopy(long long *src, long long *dst, long long len) {
    long long count = 0;      // xorq %rax,%rax

    // andq %rdx,%rdx; jle Done
    if (len <= 0) {
        return count;
    }

    // Loop:
    while (len > 0) {
        // mrmovq (%rdi), %r10
        long long val = *src;

        // rmmovq %r10, (%rsi)
        *dst = val;

        // andq %r10, %r10; jle Npos
        if (val > 0) {
            // irmovq $1, %r10; addq %r10, %rax
            count++;
        }

    // Npos:
        // irmovq $1, %r10; subq %r10, %rdx
        len--;

        // irmovq $8, %r10; addq %r10, %rdi
        // addq %r10, %rsi
        src++;
        dst++;

        // andq %rdx,%rdx; jg Loop
    }

// Done:
    return count; // ret
}
```

先跑一跑：

```bash
Part C: all tests passed, cpe: 12.816715740854239, arch cost: 8, sc
ore: 0.0000
```

默认的性能无论是在 $Ac$ 还是 $cpe$ 上都惨不忍睹，我们把 `builtin/pipe_std.rs` 复制到 `ncopy.rs` 以替换掉这个 `seq_std.rs` 来优化 $Ac$。

```bash
Part C: all tests passed, cpe: 15.707554777078881, arch cost: 4, sc
ore: 0.0000
```

还是零鸭蛋，但是 $Ac$ 确实有上升。

`ncopy.ys` 里面有很多类似这样的指令 `irmovq $8, %r10; addq %r10, %rdi` ，还记得我们的 `IOPQ` 吗，可以把这种分步指令合二为一。

我们给 `ncopy.rs` 添加 `IOPQ`，过程和 `seq_std` 几乎一样。就不再重复叙述了。

我们还是对 $Ac$ 开刀，因为 $Ac$ 前面的系数是 $2$，占比大。

```bash
 cargo run --bin ysim -- -A ncopy -I
   Compiling y86-sim v0.1.0 (/home/anfsity/Downloads/Introduction-t
o-Computer-Systems-2025Fall-PKU/04 Arch Lab/archlab-handout_1/archl
ab-project/sim)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1
.91s
     Running `target/debug/ysim -A ncopy -I`
propagate order:
lv.1: d_srcB d_valC w_valE f_pc d_dstM e_dstM e_icode mem_addr mem_
data d_icode aluB w_bubble w_stall mem_read m_dstM m_dstE w_dstE w_
valM m_icode d_stat f_bubble d_ifun e_stat m_stall prog_stat e_valA
 e_stall d_dstE mem_write d_srcA aluA w_dstM e_ifun alufun m_valE p
rog_term d_stall f_stall
lv.2: imem dmem reg_file alu f_align f_icode f_ifun m_valM m_stat d
_rvalA d_rvalB e_valE instr_valid need_regids need_valC m_bubble se
t_cc f_stat
lv.3: ialign pc_inc reg_cc f_rA f_rB f_valC f_valP cc f_pred_pc
lv.4: cond e_cnd d_bubble e_bubble e_dstE d_valA d_valB
dependency graph visualization is generated at: ncopy_dependency_gr
aph.html
```

可以看到 `lv.4` 里面有 `cond e_cnd d_bubble e_bubble e_dstE d_valA d_valB`。

![](/post/CSAPP/images/Pasted%20image%2020251121210522.png)

`d_valA d_valB` 依赖 `e_dstE`，`d_bubble e_bubble` 依赖  `e_cnd` ，`e_dstE` 依赖 `e_cnd`。

可以观察到这些都依赖于 `e_cnd` ，而 `e_cnd` 又依赖于 `cc`。

`cc` 位于 `lv.3`。

这说明所有的 `lv.4` 节点全都依赖于一个位于 `lv.3` 的节点 `cc`。

更加精确的描述是，这条 $cc \to cond.cc \to cond \to cond.cnd \to e\_cnd$ 依赖链是罪魁祸首。

我们要是想进一步优化 $Ac$ ，只能想办法砍断这条依赖链，让 `e_cnd` 不再依赖 `cc`。

 > 如果目的不是优化 $Ac$ 的话，这里还有别的思路，比如优化 `e_dstE` 到 `lv.1`。这里可以借鉴分支预测的思想，让每次 `CMOVX` 都默认赋值，错了再纠正。不过这样优化会导致一些额外的冒险，且由于 `ncopy` 里面没有 `CMOVX` 指令，等于优化为 0。
 
使用和修改 `cc` 的指令有限，`IOPQ OPQ` 设置 `cc`，`JX COMVX` 依赖 `cc`。更加关键的是，这两类指令从来不会同时发生。

我们借鉴 `predict pc` 的思路，设置一个 `pred_cc` 。这样的话，我们就不需要每次都从 `cc` 计算 `e_cnd` 了。相当于 `e_cnd` 不再依赖 `cc` 而是 `pred_cc`。`pred_cc` 是在 `lv.1` 的。这就砍断了整个依赖链。

在执行指令 `JX COMVX` 时，直接使用 `pred_cc`，减少一次依赖。在执行 `IOPQ OPQ` 时，更新 `cc` 。

为了保证流水线的正确，每次还是需要成功设置 `cc`。所以 `cc` 仍然在 `lv.3`。

具体修改如下：

```rust
// pub struct ConditionCode {
//     pub sf: bool,
//     pub of: bool,
//     pub zf: bool,
// }
/// Default value of the condition code.
// pub const CC_INIT: ConditionCode = ConditionCode {
//     sf: false,
//     of: false,
//     zf: false,
// };
ExecuteStage e {
        stat: Stat = Bub, icode: u8 = NOP, ifun: u8 = 0,
        valC: u64 = 0,
        valA: u64 = 0, valB: u64 = 0,
        dstE: u8 = RNONE, dstM: u8 = RNONE,
        srcA: u8 = RNONE, srcB: u8 = RNONE,
        pre_cc: ConditionCode = CC_INIT // name the pre_cc 
    }
    
@set_stage(e, {
    icode: d_icode,
    ifun: d_ifun,
    stat: d_stat,
    valC: d_valC,
    srcA: d_srcA,
    srcB: d_srcB,
    valA: d_valA,
    valB: d_valB,
    dstE: d_dstE,
    dstM: d_dstM,
    pre_cc: cc, // promote the pre_cc in Execute stage
});
ConditionCode pre_cc = E.pre_cc;
ConditionCode cc = reg_cc.cc; 

@set_input(cond, {
    cc: pre_cc,
    condfun: e_ifun,
});
```

经过这个优化后，$Ac$ 可以被成功优化到 3。虽然目前还是 0 分。

对流水线的优化就到此为止了，接下来我们对 `ncopy.ys` 开刀。

`ncopy.ys` 首先就对长度进行检查，我们激进一点，谁数组的长度会小于 0 ？直接给他干没。

接下来用到第五章的知识，对循环进行展开。我这里使用的是 $8 \times 8$ 路循环展开，没别的原因就是方便。据说 $9 \times 9$ 和 $10 \times 10$ 都可以得到相近的性能，我没有测过就不做评价了。

在尝试 $8 \times 8$ 之前，我先实现了一个 $2 \times 2$ 循环展开。效果惊人，直接让分数从零到 $53$。

写出 $8 \times 8$ 循环展开的高级代码：

```cpp
long long ncopy(long long *src, long long *dst, long long len) {
  long long count = 0;

  while (len >= 8) {
    long long val1 = src[0];
    long long val2 = src[1];
    long long val3 = src[2];
    long long val4 = src[3];
    long long val5 = src[4];
    long long val6 = src[5];
    long long val7 = src[6];
    long long val8 = src[7];

    dst[0] = val1;
    dst[1] = val2;
    dst[2] = val3;
    dst[3] = val4;
    dst[4] = val5;
    dst[5] = val6;
    dst[6] = val7;
    dst[7] = val8;

    count += val1 > 0;
    count += val2 > 0;
    count += val3 > 0;
    count += val4 > 0;
    count += val5 > 0;
    count += val6 > 0;
    count += val7 > 0;
    count += val8 > 0;

    len -= 8;

    src += 8;
    dst += 8;
  }

  switch (len) {
      case 7:
          { long long val = src[6]; dst[6] = val; if (val > 0) count++; }
      case 6:
          { long long val = src[5]; dst[5] = val; if (val > 0) count++; }
      case 5:
          { long long val = src[4]; dst[4] = val; if (val > 0) count++; }
      case 4:
          { long long val = src[3]; dst[3] = val; if (val > 0) count++; }
      case 3:
          { long long val = src[2]; dst[2] = val; if (val > 0) count++; }
      case 2:
          { long long val = src[1]; dst[1] = val; if (val > 0) count++; }
      case 1:
          { long long val = src[0]; dst[0] = val; if (val > 0) count++; }
      case 0:
          break;
  }

  return count;
}
```

对照着翻译成汇编：

```asm
################################################################################
# ncopy.ys - Copy a src block of len words to dst.
# Return the number of positive words (>0) contained in src.
#
# Include your name and ID here.
#
# Describe how and why you modified the baseline code.
#
################################################################################
# Do not modify this portion
# Function prologue.
# %rdi = src, %rsi = dst, %rdx = len
ncopy:
################################################################################
# You can modify this portion
	# Loop header
	xorq %rax,%rax		# count = 0;
	irmovq $1, %rbp 	# rbp = 1

copy_block:
	isubq $8, %rdx 		# len >= 8 ? len -= 8
	jge Loop1

	iaddq $8, %rdx
	jmp Remain

Loop1:	
# %rdi = src, %rsi = dst, %rdx = len
	mrmovq (%rdi), %r8
	mrmovq 8(%rdi), %r9
	mrmovq 16(%rdi), %r10
	mrmovq 24(%rdi), %r11
	mrmovq 32(%rdi), %r12
	mrmovq 40(%rdi), %r13
	mrmovq 48(%rdi), %r14
	mrmovq 56(%rdi), %rcx

	rmmovq %r8, (%rsi)
	rmmovq %r9, 8(%rsi)
	rmmovq %r10, 16(%rsi)
	rmmovq %r11, 24(%rsi)
	rmmovq %r12, 32(%rsi)
	rmmovq %r13, 40(%rsi)
	rmmovq %r14, 48(%rsi)
	rmmovq %rcx, 56(%rsi)


	andq %r8, %r8
	jle Nops1
	iaddq $1, %rax
Nops1:
	andq %r9, %r9
	jle Nops2
	iaddq $1, %rax
Nops2:
	andq %r10, %r10
	jle Nops3
	iaddq $1, %rax
Nops3:
	andq %r11, %r11
	jle Nops4
	iaddq $1, %rax
Nops4:
	andq %r12, %r12
	jle Nops5
	iaddq $1, %rax
Nops5:
	andq %r13, %r13
	jle Nops6
	iaddq $1, %rax
Nops6:
	andq %r14, %r14
	jle Nops7
	iaddq $1, %rax
Nops7:
	andq %rcx, %rcx
	jle Nops8
	iaddq $1, %rax
Nops8:
	iaddq $64, %rdi
	iaddq $64, %rsi
	jmp copy_block

Remain:
	addq %rdx, %rdx
	addq %rdx, %rdx
	addq %rdx, %rdx

	irmovq JmpTable, %r8
	addq %r8, %rdx
	mrmovq (%rdx), %rdx
	pushq %rdx
	ret

Remainder7:
	mrmovq 48(%rdi), %r8
	rmmovq %r8, 48(%rsi)
	xorq %r9, %r9       # temp = 0
	andq %r8, %r8       # check val
	cmovg %rbp, %r9     # temp = 1 if > 0
    addq %r9, %rax      # count += temp
Remainder6:
	mrmovq 40(%rdi), %r8
	rmmovq %r8, 40(%rsi)
	xorq %r9, %r9
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder5:
	mrmovq 32(%rdi), %r8
	rmmovq %r8, 32(%rsi)
	xorq %r9, %r9
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder4:
	mrmovq 24(%rdi), %r8
	rmmovq %r8, 24(%rsi)
	xorq %r9, %r9
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder3:
	mrmovq 16(%rdi), %r8
	rmmovq %r8, 16(%rsi)
	xorq %r9, %r9
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder2:
	mrmovq 8(%rdi), %r8
	rmmovq %r8, 8(%rsi)
	xorq %r9, %r9
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder1:
	mrmovq (%rdi), %r8
	rmmovq %r8, (%rsi)
	xorq %r9, %r9
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax

Done:
	ret

# In grader, we will add a "trap: jmp trap" here, which traps your program in an
# infinite loop. Thus your function should always return instead of falling
# through till the end of the source code :)

.align 8
JmpTable:
	.quad Done
	.quad Remainder1
	.quad Remainder2
	.quad Remainder3
	.quad Remainder4
	.quad Remainder5
	.quad Remainder6
	.quad Remainder7
```

此时我们可以拿到 `Part C: all tests passed, cpe: 8.79433020157048, arch cost: 3, score: 60.0000` 这样的好成绩。

 > 我尝试过优化掉循环内部的 if 语句为 comvx，但结果出我意料，并没有比现有的 $8.8$ 快反而要慢 $0.1$。
 
循环展开的余数部分利用 `switch` 语句的 `fall through` 特性来实现。

还能不能更快一点呢，有过算法的经验很容易就可以想到优化 `switch` 语句，类似于线段树，我们把 `switch` 改成分治形式，让平均跳转次数小于等于 $3$。

额，由于我没有保存这个版本，就不放这个版本的代码了。接下来的实现会保留这个优化。

在添加这个优化后，$cpe$ 大概在 $8.5$ 左右。

还能不能优化呢？

我们引入一个小技巧，事实上我们在实现的时候已经用上了。

在出发加载使用冒险时，流水线不得不暂停一个周期，而利用上这个周期，在这个周期里面插入有效代码，在不影响代码逻辑的同时避免触发加载使用冒险，这就是 “戳泡泡”。

 > 我在实现初始 $8 \times 8$ 循环展开将 `mrmovq` 和 `rmmovq` 分开了，不仅是为了避免加载使用冒险，也有这样更容易写的优势。
 
在我们的跳转表里面，`mrmovq` 和 `rmmovq` 居然是连在一起的！

我们把 `xorq` 和 `rmmovq` 换个位置。

这个优化居然达到了惊人的 $0.2$。

最后，我发现我那个 `copy_block` 有点多余，不仅多进行判断，还有可能出发控制冒险。遂删去。

这是最终版本：

```asm
################################################################################
# ncopy.ys - Copy a src block of len words to dst.
# Return the number of positive words (>0) contained in src.
#
# Include your name and ID here.
#
# Describe how and why you modified the baseline code.
#
################################################################################
# Do not modify this portion
# Function prologue.
# %rdi = src, %rsi = dst, %rdx = len
ncopy:
################################################################################
# You can modify this portion
	# Loop header
	xorq %rax,%rax		# count = 0;
	irmovq $1, %rbp 	# rbp = 1

	isubq $8, %rdx 		# if len < 8 jmp to remain
	jl Remain

Loop1:	
# %rdi = src, %rsi = dst, %rdx = len
	mrmovq (%rdi), %r8
	mrmovq 8(%rdi), %r9
	mrmovq 16(%rdi), %r10
	mrmovq 24(%rdi), %r11
	mrmovq 32(%rdi), %r12
	mrmovq 40(%rdi), %r13
	mrmovq 48(%rdi), %r14
	mrmovq 56(%rdi), %rcx

	rmmovq %r8, (%rsi)
	rmmovq %r9, 8(%rsi)
	rmmovq %r10, 16(%rsi)
	rmmovq %r11, 24(%rsi)
	rmmovq %r12, 32(%rsi)
	rmmovq %r13, 40(%rsi)
	rmmovq %r14, 48(%rsi)
	rmmovq %rcx, 56(%rsi)

	andq %r8, %r8
	jle Nops1
	iaddq $1, %rax
Nops1:
	andq %r9, %r9
	jle Nops2
	iaddq $1, %rax
Nops2:
	andq %r10, %r10
	jle Nops3
	iaddq $1, %rax
Nops3:
	andq %r11, %r11
	jle Nops4
	iaddq $1, %rax
Nops4:
	andq %r12, %r12
	jle Nops5
	iaddq $1, %rax
Nops5:
	andq %r13, %r13
	jle Nops6
	iaddq $1, %rax
Nops6:
	andq %r14, %r14
	jle Nops7
	iaddq $1, %rax
Nops7:
	andq %rcx, %rcx
	jle Nops8
	iaddq $1, %rax
Nops8:
	iaddq $64, %rdi
	iaddq $64, %rsi
	
	isubq $8, %rdx
	jge Loop1 			# rdx(len) >= 8

Remain:
    
    iaddq $4, %rdx
    jge RootRight       # len >= 4 right (4,5,6,7)
                        # len < 4  left (0,1,2,3)

RootLeft:
    # rdx : -4(0), -3(1), -2(2), -1(3)
    iaddq $2, %rdx      
    jge LeftRight

LeftLeft:
    # rdx : -2(0), -1(1)
    iaddq $1, %rdx
    je Remainder1
    ret

LeftRight:
    # rdx : 0(2), 1(3)
    isubq $1, %rdx
    je Remainder3
    jmp Remainder2

RootRight:
    # rdx : 0(4), 1(5), 2(6), 3(7)
    isubq $2, %rdx
    jge RightRight

RightLeft:
    # rdx : -2(4), -1(5)
    iaddq $1, %rdx
    je Remainder5
    jmp Remainder4

RightRight:
    # rdx : 0(6), 1(7)
    isubq $1, %rdx
    je Remainder7
    jmp Remainder6

Remainder7:
	mrmovq 48(%rdi), %r8
	xorq %r9, %r9       # temp = 0
	rmmovq %r8, 48(%rsi)
	andq %r8, %r8       # check val
	cmovg %rbp, %r9     # temp = 1 if > 0
    addq %r9, %rax      # count += temp
Remainder6:
	mrmovq 40(%rdi), %r8
	xorq %r9, %r9
	rmmovq %r8, 40(%rsi)
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder5:
	mrmovq 32(%rdi), %r8
	xorq %r9, %r9
	rmmovq %r8, 32(%rsi)
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder4:
	mrmovq 24(%rdi), %r8
	xorq %r9, %r9
	rmmovq %r8, 24(%rsi)
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder3:
	mrmovq 16(%rdi), %r8
	xorq %r9, %r9
	rmmovq %r8, 16(%rsi)
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder2:
	mrmovq 8(%rdi), %r8
	xorq %r9, %r9
	rmmovq %r8, 8(%rsi)
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax
Remainder1:
	mrmovq (%rdi), %r8
	xorq %r9, %r9
	rmmovq %r8, (%rsi)
	andq %r8, %r8
	cmovg %rbp, %r9
    addq %r9, %rax

Done:
	ret

# In grader, we will add a "trap: jmp trap" here, which traps your program in an
# infinite loop. Thus your function should always return instead of falling
# through till the end of the source code :)
```

 > 还有一个优化是将戳气泡再利用，举个例子，如果在 `fall through` 过程中，当前在 `Remainder7` ，此时预加载 `Remainder6` 里面的数据来进行优化。这个思路很不错，但是先起来我发现不仅仅要修改 `switch` 语句，为了保证正确性，需要对二分的过程添加指令。结果优化过后的 $cpe$ 不降反升，属于是反向优化了。

```bash
Part C: all tests passed, cpe: 8.138233982888806, arch cost: 3, score: 60.0000
```

效果拔群。

虽然没有优化到 $7.9$ 这样的极限 $cpe$，但我觉得这也是一个不错的分数了。

## Reference

 - [更适合北大宝宝体质的 Arch Lab 踩坑记](https://arthals.ink/blog/arch-lab)
 - [从零开始的Arch Lab](https://www.elainafan.one/p/%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84arch-lab/)
 - [Arthals ICS Slide](https://slide.huh.moe/1)
 - [B 站 up 主九曲阑干的视频讲解](https://www.bilibili.com/video/BV1e64y147vf/?spm_id_from=333.788.player.switch&vd_source=0c450959875cfbbddb557c006da7d8e4&trackid=web_related_0.router-related-2206146-pkt2c.1763005293448.793)
 - [cs429 PPT](https://www.cs.utexas.edu/~byoung/cs429/syllabus429.html)
 - [Diagon](https://diagon.arthursonzogni.com/#Table)
 - [我自己的实现和 handout](https://github.com/anfsity/CSAPP-LABs)
 - [CSAPP-第-4-章重點提示和練習](https://hackmd.io/@sysprog/CSAPP-ch4#%E8%A8%88%E7%AE%97%E6%A9%9F%E7%B5%84%E7%B9%94%E8%88%87%E7%B5%90%E6%A7%8B)

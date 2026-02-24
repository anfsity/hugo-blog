+++
title = "Compiler Principle Part1: Quickly Skip The First Half"
date = 2026-02-24T13:12:21+08:00
draft = false
author = "Anfsity"
tags = [
    "Compile Principle",
]
categories = [
    "Compile Principle",
]
description = ""
image = ""
+++

由于直到 lv8 之前都比较轻松（个人认为，相对于 lv8 lv9）。

在这之前，让我们看看图，有一个直观演示：

- 由 bison 生成的状态机图（窝觉得有点变态）

> 不行了，分享网址太长了（x hhh

anyway，在线渲染网址：https://dreampuf.github.io/GraphvizOnline/

![[graphviz.svg]]

> 你可以使用 `bison --graph sysy.y` 生成 gv 文件，然后用 graphviz 渲染它。

- 比较抽象的树状图演示：

![[new.svg]]

- 很舒服的[铁路图](https://www.bottlecaps.de/rr/ui)演示：

```
CompUnit ::= (Decl | FuncDef)+

Decl ::= ConstDecl | VarDecl

ConstDecl ::= 'const' Btype ConstDef (',' ConstDef)* ';'

ConstDef ::= IDENT '=' Expr
           | IDENT ArraySuffix '=' InitVal

ArraySuffix ::= ('[' Expr ']')+

InitVal ::= Expr
          | '{' (InitVal (',' InitVal)*)? '}'

VarDecl ::= Btype VarDef (',' VarDef)* ';'

VarDef ::= IDENT ('=' Expr)?
         | IDENT ArraySuffix ('=' InitVal)?

Btype ::= 'int' | 'void'

FuncDef ::= Btype IDENT '(' FuncFParams? ')' Block

FuncFParams ::= FuncFParam (',' FuncFParam)*

FuncFParam ::= 'const'? Btype IDENT ParamArraySuffix?

ParamArraySuffix ::= '[' ']' ArraySuffix?

Block ::= '{' BlockItem* '}'

BlockItem ::= Decl | Stmt

Stmt ::= LVal '=' Expr ';'
       | Block
       | Expr? ';'
       | 'return' Expr? ';'
       | 'break' ';'
       | 'continue' ';'
       | 'while' '(' Expr ')' Stmt
       | 'if' '(' Expr ')' Stmt ('else' Stmt)?

Expr ::= Number
       | '(' Expr ')'
       | LVal
       | IDENT '(' FuncRParams? ')'
       | ('!' | '+' | '-') Expr
       | Expr ('+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=' | '==' | '!=' | '&&' | '||') Expr

Number ::= INT_CONST

LVal ::= IDENT ArraySuffix?

FuncRParams ::= Expr (',' Expr)*
```

复制上面的这段代码并用上方的网址打开渲染就可以看到了~

- [抽象语法树设计结构](https://mermaid.live/edit#pako:eNqtVk1rE0EY_ivLgKA1DZuPpslSCk2qIIiKtQoSCJPNJBm6O7vOzJbG2tBDRTzoTQ8eSm_1UrH0ohTxz9gt_gtnPzuT7qbGuqfJ-8zzfsz7lW1gOj0EDGBakLFVDAcU2m2iiS-UaE3I0MraE207Egbf0hLsMk6hyZeXI-mOzLiz5dLZGGvc5rMxVlH_bwjR4cYN7fz00H_78-z1yfnJaSRM4lp6NT-fuJyBxK5lIJELGUDLsd11gnNodz1i5lID8BEUGcgzaVohEmHJs4VY03LMjZSmQCuM4QFRIlHwIPp89DHiHp3CblIEN_LhlkM4Jh7Kv_FsiK0p8L3-FEw881NopReiK3FxRPkzoQWp_OAyukIpHCVgBCfVm-ajBS0rJSvoOoF0pJSOAjfxdPyBZ3dRDnZfRCU5FVTw8en5p72z431_91C76R9899990diIjYoj7de3I4H5-3u_dw_O3vzwP3z133_2Px7dkltGKku5b25vIpM7dOwR_MJDHZfTcVxz47GGObLZRDdF2i7KWFEmOhCTgdblIxddFuMeInyqabkBhH03ODKJEbs2p3WDcs_1LFFxDd-6jmNpmHVMh7AsOQxKZ2oscUJFGOHdDvP6fbyV6XPSvP8hMfGMUDTlxZLzIpcNR5kWdnuon21W7rNZbE8-e_xocxoWpdrZhFamNalvr2NstpyFFHXiXOGmelnxNI0TicNUl1QlQe4DkxZOApx8GnnYKybjmTKnWam_ea5M6JQWxFVBTDCV5TEjV14sCXXiysRyybklL5hsH0S99LKmDBOk7Mz2_0kfHyLSuVCqgshiqJNrUVpFWVNtttIeZDexvNAUIyHw0NUcd7YM4jyFEZKr0RqyLDEdZvudblLFBiZcy-vMuBeu_5KXBjsogAHFPWBw6qECsBG1YfAThKbaQJSAjdrAEEcxTKFn8TZok4DmQvLcceyESR1vMARGH4qyKADP7UGO4v_nqZQi0kO05XiEA6Na1kMlwNgGW8Co1GrFSqNe1yuLJb1RWVwogBEw5kv1arHcqOqNxYauVxp6rbxTAC9Du7ViaaFe0mt1vVYq66VqfWHnDxBmzy4)

> 之后我找个时间优化一下图片显示，现在可能只能 f12 或者去我的 github repo 看比较舒服 :)
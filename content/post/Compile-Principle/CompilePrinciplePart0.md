+++
title = "Compile Principle Part 0 - Environment Configuration"
date = 2025-12-17T13:57:23+08:00
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

## Docker

[maxXing](https://github.com/MaxXSoft) 提供为实验提供了 `docker` 镜像，所以我们只需要将 `docker` 下载下来拉取镜像即可。

使用 `pacman` 下载 `docker`：

```bash
sudo pacman -S docker
```

关于如何使用基本的 `docker` 文档里面有足够的[讲解](https://pku-minic.github.io/online-doc/#/lv0-env-config/docker)，在此不再赘述。

主要来讲解一下引入 `docker` 导致宿主机的环境问题。

首先 `docker` 默认会以 `sudo` 运行，这涉及到一些历史遗留问题。但客观事实是，这不合常理。所幸，`docker` 可以通过配置来解决这个问题：

```bash
# 可以将 `docker` 添加进用户组避免 `sudo`。
sudo usermod -aG docker $USER
```

其次，`docker` 会改变修改默认的 IP 转发：

```bash
sudo iptables -nvL FORWARD
[sudo] password for anfsity: 
Chain FORWARD (policy DROP 1735 packets, 177K bytes)
 pkts bytes target     prot opt in     out     source               destination         
 1735  177K DOCKER-USER  all  --  *      *       0.0.0.0/0            0.0.0.0/0           
 1735  177K DOCKER-FORWARD  all  --  *      *       0.0.0.0/0            0.0.0.0/0  
```

可以看到，`docker` 将策略改成了 `DROP` ...

如果你之前有跑在宿主机上的类似容器应用，就需要将对应的端口开放给 `iptables`。

 > [Article]({{< relref "post/Linux/PlayArknightsInArchLinux.zh-cn.md/#docker-禁用-ip-转发">}})

关于 `docker` 的流量转发我没有做过多的了解，可以看官方文档自行了解。

 > [Networking overview](https://docs.docker.com/engine/network/)
 >
 > [Packet filtering and firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/)

如果你使用 `c++` 进行 Lab 的话，可能你像我一样使用 `clangd` 。

但是由于每次运行都是在 `docker` 里面进行的，这就造成一个问题--如果你使用 `cmake` 来自动生成 `cdb` 文件的话，它的路径是 `docker` 里面的路径而不是宿主机里的路径。

这就导致了 `clangd` 找不到对应的 `cdb` ，然后就框框爆红 `**file not found` 。

这让我很是头疼，网上搜寻了一番，大致有两种思路：

- 在 `docker` 里面也装一个 `clangd` ，然后把 `docker` 里面的 `clangd` 通信转发到 `vscode` 里面来。

这个策略有很多不足，一是折腾起来麻烦；二是就算弄好了 `clangd` 也没有办法享受我宿主机上的 `zsh` 环境；三是这只适用于 `vscode` ，如果我用其他的 `IDE` 那又要折腾一番了。

- 把宿主机的目录挂载到 `docker` 上来，让 `docker` 的路径和宿主机相同。

这个思路我是在一篇 reddit 的讨论帖上看到的，感觉不错，遂剽窃使用。

为了发扬懒人精神，我把这些命令整合到了 `Makefile` 中。

 > 我只会 `Makefile` QAQ，而且它也足够简单(?)，只要不写太多东西。犹记得初见 `Makefile` 时的语法，神似鬼画符🤔

```make
IMAGE = maxxing/compiler-dev
BUILD_DIR = cmake-build

UID := $(shell id -u)
GID := $(shell id -g)
PWD := $(shell pwd)

all: build

configure:
	cmake -S . -B $(BUILD_DIR)

build: configure
	cmake --build $(BUILD_DIR) -j12

clean:
	rm -rf $(BUILD_DIR)

shell:
	docker run -it --rm \
			-u $(UID):$(GID) \
			-v "$(PWD):$(PWD)" \
			-w "$(PWD)" \
			$(IMAGE) bash

docker-build:
	docker run --rm \
		-u $(UID):$(GID) \
		-v "$(PWD):$(PWD)" \
		-w "$(PWD)" \
		$(IMAGE) \
		sh -c "cmake -S . -B $(BUILD_DIR) && cmake --build $(BUILD_DIR) -j12"
```

## CMake

谈到 `CMake` ，只能说又爱又恨。众所周知，C++ 没有好用的包管理器，目前流行的包管理器各有各的缺陷。

不过包管理器相关的知识太过庞杂，就不在这里展开叙述了。

我们来魔改一下 maxXing 的 `CMakelists` 👍

按照现代 CMake 的思想，一切皆为 target 和模块化，我们来调整一下 `CMakelists`。

```bash
~ anfsity  main  zsh                                     
 tree -d
.
├── debug
├── include
│   ├── backend
│   └── ir
├── scripts
├── src
│   ├── backend
│   ├── frontend
│   └── ir
└── tests

11 directories
```

我们在顶层目录和 `src/include` 目录都放一个 `CMakelists` 来管理。

 > 这是我学习 Cmake 的[入门视频](https://www.bilibili.com/video/BV1nu411u7rb/?spm_id_from=333.1387.favlist.content.click)。

```cmake
# root CMakelists.txt
cmake_minimum_required(VERSION 3.20)

project(
    compiler
    LANGUAGES CXX
    DESCRIPTION "PKU Compile Principle LABs."
    VERSION 0.1.0
)

# c++ settings
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# binary_dir : the output dir like build/cmake-build
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

# library fmt
include(FetchContent)
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG         12.1.0
)
FetchContent_MakeAvailable(fmt)

# Flex & Bsion
find_package(FLEX REQUIRED)
find_package(BISON REQUIRED)

add_subdirectory(include)
add_subdirectory(src)

enable_testing()

file(GLOB_RECURSE test_cases "tests/*.c")

foreach(test_file ${test_cases})
    get_filename_component(test_name ${test_file} NAME_WE)
    get_filename_component(parent_dir ${test_file} DIRECTORY)
    get_filename_component(group_name ${parent_dir} NAME)
    add_test(
        NAME ${group_name}/${test_name}
        COMMAND python3 ${CMAKE_SOURCE_DIR}/scripts/test_runner.py
                $<TARGET_FILE:compiler>
                ${test_file}
    )
endforeach()
```

看了一下 `docker` 里面的环境配置：

| Tool                       | Version | Status/Notes                              |
| :------------------------- | :------ | :---------------------------------------- |
| **CMake**                  | 3.28.3  | 现代版本，但离目前的 head 还是稍旧。                     |
| **Python3**                | 3.12.3  | 最新的稳定版本之一。                                |
| **Rust Toolchain (Cargo)** | 1.91.1  | 版本非常新 (构建日期 2025-10-10)，处于前沿。             |
| **flex**                   | 2.6.4   | 标准版本。                                     |
| **bison**                  | 3.8.2   | 标准版本 (GNU Bison)。                         |
| **GCC**                    | 13.3.0  | 构建于 Ubuntu 24.04。支持 C++20 标准。             |
| **Clang**                  | 21.1.6  | 版本极新。但是可能由于 libc++ 限制，可能无法使用 std::print 。 |
| **LLVM**                   | 21.1.6  | Clang 的底层框架，版本与 Clang 一致。                 |

环境可以说是非常现代了，但是它的 `clang` 居然不能让我用 `std::println` ?

我早受够用 `cout` 的 `<</>>` 来拼接字符串了，不让我用我也要弄过来。便把 `print` 的原型库 `fmt` 拉过来使用。

不过这么做有一个缺陷，因为一些个人喜好原因，我是拉取的 `fmt` 仓库。这导致每次测试的时候都要进行一次拉取。有时候我在想是不是应该直接下载下来。

如果网络好的时候还好，但是校园网不好(哭哭)，偶尔要等待半天。

```cmake
# src/CMakelists.txt
# generate lexer/parser
set(LEXER_SRC frontend/sysy.lx)
set(YACC_SRC frontend/sysy.y)

# generate the lexer and parser files
flex_target(Lexer ${LEXER_SRC} ${CMAKE_CURRENT_BINARY_DIR}/sysy.lex.cpp)
bison_target(Parser ${YACC_SRC} ${CMAKE_CURRENT_BINARY_DIR}/sysy.tab.cpp)
add_flex_bison_dependency(Lexer Parser)
message(STATUS "[INFO]  Generated lexer: ${CMAKE_CURRENT_BINARY_DIR}/sysy.lex.cpp")
message(STATUS "[INFO]  Generated parser: ${CMAKE_CURRENT_BINARY_DIR}/sysy.tab.cpp")
message(STATUS "[INFO]  Generated lexer outpus ${FLEX_Lexer_OUTPUTS}")
message(STATUS "[INFO]  Generated parser outpus ${BISON_Parser_OUTPUT_SOURCE}")

set(CORE_SOURCES
    ir/ast.cpp
    backend/backend.cpp
    ${FLEX_Lexer_OUTPUTS}
    ${BISON_Parser_OUTPUT_SOURCE}
)

add_library(compiler_core STATIC ${CORE_SOURCES})

target_include_directories(compiler_core PRIVATE
    ${CMAKE_CURRENT_BINARY_DIR}  # cmake-build/src/* for generated lexer/parser
)

# compiler core link libraries
target_link_libraries(compiler_core PUBLIC
    koopa
    pthread
    dl
    fmt::fmt
    headers
)

# complie options
target_compile_options(compiler_core PRIVATE -O2 -Wall -Wno-register -Wextra)

# executable
add_executable(compiler main.cpp)
target_compile_options(compiler PRIVATE -O2 -Wall -Wno-register -Wextra)
target_include_directories(compiler PRIVATE $ENV{CDE_INCLUDE_PATH})

# compiler link libraries
target_link_libraries(compiler PRIVATE compiler_core)
target_link_directories(compiler PRIVATE $ENV{CDE_LIBRARY_PATH}/native)
```

```cmake
# include/CMakeLists.txt
add_library(headers INTERFACE)

target_include_directories(headers INTERFACE
    # include/
    ${CMAKE_CURRENT_SOURCE_DIR} 
)

message(STATUS "[INFO]  Compiler Headers Target created: headers")
```

这是我目前做了一阵子的目录结构，测试还没写完。

```bash
 tree
.
├── CMakeLists.txt
├── debug
│   ├── binary.koopa
│   ├── hello.asm
│   ├── hello.koopa
│   ├── logic.asm
│   ├── logic.koopa
│   └── unary.koopa
├── include
│   ├── backend
│   │   └── backend.hpp
│   ├── CMakeLists.txt
│   ├── ir
│   │   ├── ast.hpp
│   │   ├── ir_builder.hpp
│   │   ├── symbol_table.hpp
│   │   └── type.hpp
│   └── koopa.h
├── Makefile
├── scripts
│   └── test_runner.py
├── src
│   ├── backend
│   │   └── backend.cpp
│   ├── CMakeLists.txt
│   ├── frontend
│   │   ├── sysy.lx
│   │   └── sysy.y
│   ├── ir
│   │   └── ast.cpp
│   └── main.cpp
└── tests
    ├── binary.c
    ├── hello.c
    ├── logic.c
    └── unary.c

11 directories, 26 files
```
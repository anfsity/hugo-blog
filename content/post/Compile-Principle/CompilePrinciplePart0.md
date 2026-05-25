+++
title = "编译原理准备篇"
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
last_mod = 2026-01-16T15:57:23+08:00
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

### 配置 `clangd`

如果你使用 `c++` 进行 Lab 的话，可能你像我一样使用 `clangd` 。

但是由于每次运行都是在 `docker` 里面进行的，这就造成一个问题--如果你使用 `cmake` 来自动生成 `cdb` 文件的话，它的路径是 `docker` 里面的路径而不是宿主机里的路径。

这就导致了 `clangd` 找不到对应的 `cdb` ，然后就框框爆红 `**file not found` 。

这让我很是头疼，网上搜寻了一番，大致有两种思路：

- 在 `docker` 里面也装一个 `clangd` ，然后把 `docker` 里面的 `clangd` 通信转发到 `vscode` 里面来。

这个策略有很多不足，一是折腾起来麻烦；二是就算弄好了 `clangd` 也没有办法享受我宿主机上的 `zsh` 环境；三是这只适用于 `vscode` ，如果我用其他的 `IDE` 那又要折腾一番了。

- 把宿主机的目录挂载到 `docker` 上来，让 `docker` 的路径和宿主机相同。

这个思路我是在一篇 reddit 的讨论帖上看到的，感觉不错，遂剽窃使用。

为了发扬懒人精神，我把这些命令整合到了 `Makefile` 中。

> 我只会 `Makefile` QAQ，而且它也足够简单(简单吗...?)，只要不写太多东西。犹记得初见 `Makefile` 时的语法，神似鬼画符🤔

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

你可以在根目录下 `make shell` 直接进入 `docker`，`make` 进行编译。

> 由于是在 user 模式进入的 docker, 你无法使用 sudo, 这意味着， 你没有办法使用此类需要 root 权限的指令 `sudo apt update && sudo apt install ***`。
>
> 同时需要注意的是，我个人习惯的构建目录是 `cmake-build` 而不是 `build`。
>
> 在我对编译器进行了模块化改造后，就是使用的第一种方法，这种方法可以使用 devconatiner 插件简单的实现。这是我的 [json](https://github.com/anfsity/Compile-Principle/blob/main/.devcontainer/devcontainer.json) 配置，你可以参考它。
>
> 好消息是我为上游推送了 clangd 支持，到时候 docker 应该内置 clangd，不过上面的内容依然适用。

## CMake

谈到 `CMake` ，只能说又爱又恨。众所周知，C++ 没有像 rs，py 那样好用的包管理器，目前流行的包管理器各有各的缺陷。

不过包管理器相关的知识太过庞杂，而且我也并不熟悉，就不在这里展开叙述了。

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

| Tool                       | Version | Status/Notes                                                   |
| :------------------------- | :------ | :------------------------------------------------------------- |
| **CMake**                  | 3.28.3  | 现代版本，但离目前的 head 还是稍旧。                           |
| **Python3**                | 3.12.3  | 最新的稳定版本之一。                                           |
| **Rust Toolchain (Cargo)** | 1.91.1  | 版本非常新 (构建日期 2025-10-10)，处于前沿。                   |
| **flex**                   | 2.6.4   | 标准版本。                                                     |
| **bison**                  | 3.8.2   | 标准版本 (GNU Bison)。                                         |
| **GCC**                    | 13.3.0  | 构建于 Ubuntu 24.04。支持 C++20 标准。                         |
| **Clang**                  | 21.1.6  | 版本极新。但是可能由于 libc++ 限制，可能无法使用 std::print 。 |
| **LLVM**                   | 21.1.6  | Clang 的底层框架，版本与 Clang 一致。                          |

环境可以说是非常现代，但是很遗憾无法使用 `print` 库。

我早受够用 `cout` 的 `<</>>` 来输出字符串了，真的很难用，便把 `print` 的原型库 `fmt` 拉过来使用。

没想到 `fmt` 比 `print` 还好用。

我的实现有一个缺陷，为了避免引入依赖，我直接使用 `cmake` 拉取 `fmt` 仓库。这导致每次测试的时候都要进行一次拉取。如果网络好的时候还算顺畅，但是校园网时常抽风，偶尔要等待半天。

不过也可以指定输出目录进行增量编译，这也不算是什么大问题了。

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

这是我最终的目录结构，~~测试还没写完~~，从别处剽窃了一些测试过来。

```bash
 tree
.
├── CMakeLists.txt
├── debug
│   ├── hello.asm
│   ├── hello.koopa
│   └── test_temp
│       └── **
├── include
│   ├── backend
│   │   ├── backend.hpp
│   │   └── koopawrapper.hpp
│   ├── CMakeLists.txt
│   ├── ir
│   │   ├── ast.hpp
│   │   ├── ir_builder.hpp
│   │   ├── symbol_table.hpp
│   │   └── type.hpp
│   ├── koopa.h
│   └── Log
│       └── log.hpp
├── Makefile
├── scripts
│   └── test_runner.py
├── src
│   ├── backend
│   │   └── backend.cpp
│   ├── CMakeLists.txt
│   ├── frontend
│   │   ├── sysy.lx
│   │   └── sysy.y
│   ├── ir
│   │   ├── ast.cpp
│   │   └── codegen.cpp
│   └── main.cpp
└── tests
    ├── hello.c
    └── resources
        ├── functional
        │   └── **
        └── hidden_functional
            └── **

16 directories, 620 files
```

> 如果你想使用这个 CMake 文件，你必须严格遵循我的目录结构，并且把对应的 CMake 文件放到正确的位置，如果你对 CMake 不了解的话，还是使用课程提供的模板文件比较好。权当我为你提供了一种 CMake 参考配置。
>
> 这个配置是使用了 module 之前的配置，当前仓库的配置是适配了 module 之后的配置。

## 模块

什么？都 2026 了，我们还在使用传统 cpp 的 pch Σ(ﾟ∀ﾟﾉ)ﾉ

`modules` 现在处于一个很尴尬的处境，大家都夸他，但是没人用。

模块的好处及用法可以参见这篇文章 [C++20 Modules 用户视角下的最佳实践](https://chuanqixu9.github.io/c++/2025/12/30/C++20-Modules-Best-Practices.html)。

经过亲身体验后，我建议这个还是不要碰的好，因为弄好环境其实挺麻烦的。如果一定要引入的话，最好从一开始就原生支持，并且需要修改 CMake 文件。

CMake 进行模块构建目前好像只能使用 ninja （还有谁我忘了），所以你还需要配置 ninja。

你可以使用我的 devcontainer 配置，相关环境都已经弄好了 [devcontainer.json](https://github.com/anfsity/Compile-Principle/blob/main/.devcontainer/devcontainer.json)。

怎么用就自行询问 AI 吧。

## 简单的日志打印

一个小巧且漂亮的日志打印可以很好的帮助你进行 debug，在 cpp 20 （还是 23 ？我忘了）引进了 `source_location`，它可以很好的取代部分宏调试的功能，使用起来更加方便和舒适。

`fmt` 库的强大功能中包含了颜色调节，这是标准库还没有实现的功能。`fmt` 看起来比较麻烦，但用起来意外的舒服，很符合“人体工学”。

```cpp
/**
 * @file log.hpp
 * @brief Logging and error handling utilities for the compiler.
 */
#pragma once

#include <fmt/color.h>
#include <fmt/core.h>
#include <source_location>
#include <string>

namespace detail {

/**
 * @brief Formats a message with source location information.
 * @param loc The source location.
 * @param fmt_str Format string.
 * @param args Format arguments.
 * @return Formatted string including location info.
 */
template <typename... Args>
static auto format_msg(const std::source_location &loc,
                       std::string_view fmt_str, Args &&...args)
    -> std::string {
  std::string user_msg =
      fmt::format(fmt::runtime(fmt_str), std::forward<Args>(args)...);

  return fmt::format(fmt::fg(fmt::color::alice_blue), "{} (at {}:{} in {})", user_msg, loc.file_name(),
                     loc.line(), loc.function_name());
}

/**
 * @brief Custom exception for compilation errors.
 */
class CompileError : public std::runtime_error {
public:
  explicit CompileError(const std::string &message)
      : std::runtime_error(message) {}
};

} // namespace detail

/**
 * @brief Static logging utility.
 */
class Log {
public:
  /**
   * @brief Reports a fatal error, prints debug info, and throws a CompileError.
   *
   * @param fmt_str Format string for the error message.
   * @param args Arguments for the format string.
   * @param loc Source location (defaults to caller site).
   */
  template <typename... Args>
  static auto
  panic(std::string_view fmt_str, Args &&...args,
        const std::source_location &loc = std::source_location::current())
      -> void {
    fmt::print(stderr, fmt::emphasis::bold | fmt::fg(fmt::color::red),
               "[PANIC] ");
    std::string msg =
        fmt::format(fmt::runtime(fmt_str), std::forward<Args>(args)...);
    fmt::println(stderr, "{}", msg);
    fmt::print(stderr, fmt::fg(fmt::color::slate_gray), " --> {}:{}:{}\n",
               loc.file_name(), loc.line(), loc.function_name());

    throw detail::CompileError(
        detail::format_msg(loc, fmt_str, std::forward<Args>(args)...));
  }

  /**
   * @brief Prints a trace message for debugging.
   *
   * @param fmt_str Format string for the trace message.
   * @param args Arguments for the format string.
   * @param loc Source location (defaults to caller site).
   */
  template <typename... Args>
  static auto
  trace(std::string_view fmt_str, Args &&...args,
        const std::source_location &loc = std::source_location::current())
      -> void {
    fmt::print(stdout, fmt::fg(fmt::color::cyan), "[TRACE] ");
    fmt::print(stdout, "{} ",
               fmt::format(fmt::runtime(fmt_str), std::forward<Args>(args)...));
    fmt::print(stdout, fmt::fg(fmt::color::dark_violet), "[{}]\n",
               loc.function_name());
  }
};
```

## 代码风格

代码风格可以参考 llvm 和 google 的 style 手册，应该在网上一搜就有。

或者可以使用 clang-format 一键格式化，clangd 会包含它。

对于某某特性应不应该使用的问题，我觉得只要你在项目保持前后一致性，就没什么问题。由于是 toy project，~~我会把语言特性拉的尽可能的新~~。

### 代码注释

尽可能的写注释......且要写明白.....否则你就会像我一样，一个星期不看就看不懂要重新把所有源码再看一遍...

为什么会一两个星期没看呢，因为要期末考试...

Anyway，就算不是因为这个原因，良好风格的注释在项目中也是非常重要的，

我目前的观点是，好的代码应该做到：代码即注释。但是对于复杂的逻辑，以及一些危险的操作，需要用注释来补全。

## 内存管理

为了支持 RAII，我个人的做法是把所有的函数和过程都用类包装起来了，为了兼容 bison 还写了一套构造函数用于从裸指针构造。

简单举个例子：

```bison
/**
 * @brief Left-value expression (variable / array access).
 */
LVal
  : IDENT {
    $$ = new LValAST(std::move(*$1), {});
    delete $1;
  }
  | IDENT ArraySuffix {
    $$ = new LValAST(std::move(*$1), std::move(*$2));
    delete $1;
    delete $2;
  };
```

```cpp
class LValAST : public ExprAST {
public:
  std::string ident;
  std::vector<std::unique_ptr<ExprAST>> indices;
  /**
   * @brief Constructs an LVal node.
   * @param _ident The variable name.
   */
  LValAST(std::string _ident, std::vector<std::unique_ptr<ExprAST>> _indices)
      : ident(std::move(_ident)), indices(std::move(_indices)) {};
  auto dump(int depth) const -> void override;
  auto codeGen(ir::KoopaBuilder &builder) const -> std::string override;
  auto CalcValue(ir::KoopaBuilder &builder) const -> int override;
};
```

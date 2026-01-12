+++
title = "Play Arknights In ArchLinux"
translationKey = "play-arknights-archlinux"
date = 2025-12-02T17:54:36+08:00
draft = false
author = "Anfsity"
tags = [
    "Linux",
    "Game",
]
categories = [
    "Linux",
    "Game",
]
description = ""
image = ""
+++


## Install binder

We need install binder, because Arknights depended on it , who transform app's message to linux system.

`Linux-zen` is one alternative kernel available in official Arch repos.

$$
\text{Arknights} \xrightarrow{\text{needs}} \text{Android OS} \xrightarrow{\text{needs}} \text{Binder IPC} \xrightarrow{\text{needs}} \text{Host Kernel Support}
$$

we can use pacman to install it :

```bash
sudo pacman -S linux-zen linux-zen-headers
```

If you use NVIDIA GPU, you may need extra effort to make it work. since I use AMD GPU, I do not very care it.

After install `linux-zen`, if you use GRUB , you should use instructions below to reboot.

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

 If you use systemd-boot, it will updates automatically , but you might need to check your loader entries in `/boot/loader/entries` to  make sure `linux-zen` is selected.

you can use such instruction to check it :

```
uname -r
```

## Waydroid

我们使用 [Waydroid](https://github.com/waydroid/waydroid)作为模拟器来玩 Arknights。

使用 `pacman` 下载 `Waydroid`。

使用 `waydroid init` 下载镜像，如果因为网络问题无法安装，可以使用 `archlinuxcn` 源安装 `waydroid-image` 。

然后再 `waydroid init`。

下载脚本[waydroid srcipt](https://github.com/casualsnek/waydroid_script) ，安装 `Arm` 翻译层。

为提高翻译性能，推荐在 AMD CPU 上使用 libndk，在英特尔 CPU 上使用 libhoudini。然而部分应用仅支持一种翻译层，因此当某个游戏不工作或性能极差时，您可能需要把两个翻译层都试一遍。

 > 需要使用 py 虚拟环境。

_安装 libndk arm 翻译层_

```
sudo python3 main.py install libndk 
```

_安装 libhoudini arm 翻译层_

```
sudo python3 main.py install libhoudini
```

 > 我的电脑上仅能使用 libhoudini，libndk 会导致应用黑屏。
 
如果无法安装，可能是因为网络问题：

导入端口：

```bash
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897
export all_proxy=socks5://127.0.0.1:7897
```

通过端口安装：

```bash
sudo -E venv/bin/python main.py
```

查看安卓版本：

```bash
waydroid prop get ro.build.version.release
```

## 设置 Waydroid 像素

我使用的是 `hyprland`，没有找到好用的方法让界面自使用平铺窗口大小。只能给这个窗口添加浮动属性。

为 `waydroid` 自定义规则：

```
windowrulev2 = size 1600 900, float, class:^(Waydroid)$
```

可以调整宽高和 dpi：

```bash
sudo waydroid prop set persist.waydroid.width 576
sudo waydroid prop set persist.waydroid.height 1024
sudo waydroid shell wm density 250
# 250 时显示比较好
```

我的评价是别设置这个长宽让 `hyprland` 来调整它。

## Google play

本来想弄一个 google play 的，但是 google 那边似乎除了点问题，只能等待修复了。

 > 讨论帖[Unable to register device in Google uncertified registration page](https://www.reddit.com/r/waydroid/comments/1p6ooie/unable_to_register_device_in_google_uncertified/)。
 
## BUG

### 未知 BUG

This is likely due to the audio server dying ... see [Issue 576](https://github.com/waydroid/waydroid/issues/576) and [Issue 829](https://github.com/waydroid/waydroid/issues/829) for details.

A workaround is to run:

```
# sysctl -w kernel.pid_max=65535 
```

You can make it permanent by creating a `.conf` file in `/etc/sysctl.d/` and adding `kernel.pid_max=65535` to it.

```
/etc/sysctl.d/99-sysctl.conf
kernel.pid_max=65535
```

难评，难修。

暂时未定位出原因，未修复，猜测是音频问题。

### Docker 禁用 ip 转发

`waydroid` 无法联网(ping 丢包)，初始我猜测是 `TUN` 模式的问题，但是排查了一遍后，还是无法联网。

```bash
 sysctl net.ipv4.ip_forward
net.ipv4.ip_forward = 1
```

询问哈基米关于 `IP` 问题时，哈基米告诉我有可能是因为 `Docker` 与 `waydroid` 冲突导致的。

Docker 默认把 `iptables` 的转发策略改成 `DROP` ：

```bash
 sudo iptables -nvL FORWARD
[sudo] password for anfsity: 
Chain FORWARD (policy DROP 1735 packets, 177K bytes)
 pkts bytes target     prot opt in     out     source               destination         
 1735  177K DOCKER-USER  all  --  *      *       0.0.0.0/0            0.0.0.0/0           
 1735  177K DOCKER-FORWARD  all  --  *      *       0.0.0.0/0            0.0.0.0/0  
```

对转发策略进行修改：

```bash
 sudo iptables -I FORWARD 1 -i waydroid0 -j ACCEPT
 sudo iptables -I FORWARD 1 -o waydroid0 -j ACCEPT
 sudo iptables -t nat -A POSTROUTING -s 192.168.240.0/24 -o wlan0 -j MASQUERADE
# 开启 NAT
 sudo iptables -nvL FORWARD
Chain FORWARD (policy DROP 1973 packets, 212K bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 ACCEPT     all  --  *      waydroid0  0.0.0.0/0            0.0.0.0/0           
   28  1680 ACCEPT     all  --  waydroid0 *       0.0.0.0/0            0.0.0.0/0           
 1973  212K DOCKER-USER  all  --  *      *       0.0.0.0/0            0.0.0.0/0           
 1973  212K DOCKER-FORWARD  all  --  *      *       0.0.0.0/0            0.0.0.0/0  
```

修复成功：

```bash
 sudo waydroid shell
[sudo] password for anfsity: 
:/ # ping bing.com
PING bing.com (150.171.28.10) 56(84) bytes of data.
64 bytes from 150.171.28.10: icmp_seq=1 ttl=114 time=71.9 ms
64 bytes from 150.171.28.10: icmp_seq=2 ttl=114 time=89.8 ms
^C
--- bing.com ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 71.993/80.922/89.851/8.929 ms
```

成功后保存规则：

```bash
sudo iptables-save | sudo tee /etc/iptables/iptables.rules
sudo systemctl enable --now iptables
```

## 快捷键

使用 `ydotool` 

```bash
sudo pacman -S ydotool bc
```

由于我是双屏，`hyprland` 像素和 `ydotool` 像素坐标不一样，测的我要🤮了。暂时搁置。

## 其他知识

`waydroid shell` 和 `adb shell` 类似，但因其是容器，所以比 ADB 更快，权限更高。

`waydroid` 的文件路径保存在 `.local/share/waydroid/data/media/0`

访问需要 `root` 权限：

```bash
 ls .local/share/waydroid/data/media/0
".local/share/waydroid/data/media/0": Permission denied (os error 13)
 sudo ls .local/share/waydroid/data/media/0
[sudo] password for anfsity: 
Alarms	Audiobooks  Documents	Movies	Notifications  Podcasts    Ringtones
Android  DCIM	    Download	Music	Pictures       Recordings
 sudo ls .local/share/waydroid/data/media/0/Download
app-release.apk		clash-for-android.apk	NeteaseCloudMusic_Music_official_9.4.15.251120174454_32614.apk
clash-for-android-1.apk  netease		TapTap_2.89.0-rel.100100_rep.apk
```

安装 APK 可以在终端安装：

```bash
waydroid app install /path/to/your-app.apk
```

列出已安装应用：

```bash
waydroid app list
```

调试日志信息：

```bash
waydroid logcat
# 只看报错
waydroid logcat *:E
# 使用 grep 过滤信息
waydroid logcat | grep "com.bilibili"
```

除了使用 `logcat` ，由于共用内核，还可以使用 `dmesg` 来抓取日志。

```bash
sudo dmesg -w | grep -iE "waydroid|binder|lxc"
```

`/var/lib/waydroid/waydroid_base.prop` 里是 Android 的配置文件。

```bash
cat /var/lib/waydroid/waydroid_base.prop
sys.use_memfd=true
ro.adb.secure=1
ro.debuggable=0
gralloc.gbm.device=/dev/dri/renderD128
debug.stagefright.ccodec=0
ro.hardware.gralloc=gbm
ro.hardware.egl=mesa
ro.hardware.vulkan=radeon
ro.hardware.camera=v4l2
ro.opengles.version=196610
waydroid.updater.disabled=true
waydroid.tools_version=1.6.0
ro.vndk.lite=true
ro.product.cpu.abilist=x86_64,x86,arm64-v8a,armeabi-v7a,armeabi
ro.product.cpu.abilist32=x86,armeabi-v7a,armeabi
ro.product.cpu.abilist64=x86_64,arm64-v8a
ro.dalvik.vm.native.bridge=libhoudini.so
ro.enable.native.bridge.exec=1
ro.dalvik.vm.isa.arm=x86
ro.dalvik.vm.isa.arm64=x86_64
```

`waydroid` 有两种 UI 模式，`Multi-Window` 和  `Full-UI`。

`Multi-window` 可以让应用成为独立的 `wayland` 窗口。

`Full-UI` 会渲染出完整的 Android 桌面。

## 参考连接

 - [waydroid docs](https://docs.waydro.id/)
 - [archwiki waydroid](https://wiki.archlinux.org/title/Waydroid)

 ---

 $upd:$
 
 这个 bug 实在太多，我也不强求一定要在 linux 上玩游戏，遂以抛弃 `waydroid`，特此纪念。
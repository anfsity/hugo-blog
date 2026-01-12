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

We need to install binder because Arknights depends on it to translate app messages to the Linux system.

`Linux-zen` is an alternative kernel available in the official Arch repos.

$$
\text{Arknights} \xrightarrow{\text{needs}} \text{Android OS} \xrightarrow{\text{needs}} \text{Binder IPC} \xrightarrow{\text{needs}} \text{Host Kernel Support}
$$

We can use pacman to install it:

```bash
sudo pacman -S linux-zen linux-zen-headers
```

If you use an NVIDIA GPU, you may need extra effort to make it work. Since I use an AMD GPU, I don't really care about that.

After installing `linux-zen`, if you use GRUB, you should use the instructions below to update your config before rebooting.

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

If you use systemd-boot, it will update automatically, but you might need to check your loader entries in `/boot/loader/entries` to make sure `linux-zen` is selected.

You can use this command to check it:

```bash
uname -r
```

## Waydroid

We use [Waydroid](https://github.com/waydroid/waydroid) as the Android emulator for playing Arknights.

Use `pacman` to download `Waydroid`.

Run `waydroid init` to download the image. If installation fails due to network issues, you can use the `archlinuxcn` repo to install `waydroid-image`.

Then run `waydroid init` again.

Download the [waydroid script](https://github.com/casualsnek/waydroid_script) to install the `Arm` translation layer.

To improve translation performance, it is recommended to use `libndk` on AMD CPUs and `libhoudini` on Intel CPUs. However, some apps only support one specific translation layer, so if a game doesn't work or has terrible performance, you might need to try both layers.

> Requires a Python virtual environment.

_Install libndk arm translation layer_

```bash
sudo python3 main.py install libndk 
```

_Install libhoudini arm translation layer_

```bash
sudo python3 main.py install libhoudini
```

> Only `libhoudini` works on my computer; `libndk` causes a black screen.
 
If installation fails, it might be due to network issues. Export the ports:

```bash
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897
export all_proxy=socks5://127.0.0.1:7897
```

Install via proxy:

```bash
sudo -E venv/bin/python main.py
```

Check Android version:

```bash
waydroid prop get ro.build.version.release
```

## Setting Waydroid Resolution

I use `hyprland` and haven't found a good way to make the interface adapt to tiled window sizes automatically. I can only add a floating property to this window.

Define custom rules for `waydroid`:

```ini
windowrulev2 = size 1600 900, float, class:^(Waydroid)$
```

You can adjust the width, height, and DPI:

```bash
sudo waydroid prop set persist.waydroid.width 576
sudo waydroid prop set persist.waydroid.height 1024
sudo waydroid shell wm density 250
# Display looks good at 250
```

My advice is not to set these manually; let `hyprland` handle it.

## Google Play

I originally wanted to set up Google Play, but there seems to be an issue on Google's end, so I have to wait for a fix.

 > Discussion thread: [Unable to register device in Google uncertified registration page](https://www.reddit.com/r/waydroid/comments/1p6ooie/unable_to_register_device_in_google_uncertified/).
 
## BUG

### Unknown Bug

This is likely due to the audio server dying ... see [Issue 576](https://github.com/waydroid/waydroid/issues/576) and [Issue 829](https://github.com/waydroid/waydroid/issues/829) for details.

A workaround is to run:

```bash
# sysctl -w kernel.pid_max=65535 
```

You can make it permanent by creating a `.conf` file in `/etc/sysctl.d/` and adding `kernel.pid_max=65535` to it.

```ini
/etc/sysctl.d/99-sysctl.conf
kernel.pid_max=65535
```

Hard to comment, hard to fix.

The cause hasn't been located yet, and it's not fixed. My guess is it's an audio issue.

### Docker Disables IP Forwarding

`waydroid` couldn't connect to the internet (ping packet loss). Initially, I suspected it was a `TUN` mode issue, but after troubleshooting, it still couldn't connect.

```bash
 sysctl net.ipv4.ip_forward
net.ipv4.ip_forward = 1
```

When investigating the IP issue, I was told it might be caused by a conflict between `Docker` and `waydroid`.

Docker changes the `iptables` forwarding policy to `DROP` by default:

```bash
 sudo iptables -nvL FORWARD
[sudo] password for anfsity: 
Chain FORWARD (policy DROP 1735 packets, 177K bytes)
 pkts bytes target     prot opt in     out     source               destination         
 1735  177K DOCKER-USER  all  --  *      *       0.0.0.0/0            0.0.0.0/0           
 1735  177K DOCKER-FORWARD  all  --  *      *       0.0.0.0/0            0.0.0.0/0  
```

Modify the forwarding policy:

```bash
 sudo iptables -I FORWARD 1 -i waydroid0 -j ACCEPT
 sudo iptables -I FORWARD 1 -o waydroid0 -j ACCEPT
 sudo iptables -t nat -A POSTROUTING -s 192.168.240.0/24 -o wlan0 -j MASQUERADE
# Enable NAT
 sudo iptables -nvL FORWARD
Chain FORWARD (policy DROP 1973 packets, 212K bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 ACCEPT     all  --  *      waydroid0  0.0.0.0/0            0.0.0.0/0           
   28  1680 ACCEPT     all  --  waydroid0 *       0.0.0.0/0            0.0.0.0/0           
 1973  212K DOCKER-USER  all  --  *      *       0.0.0.0/0            0.0.0.0/0           
 1973  212K DOCKER-FORWARD  all  --  *      *       0.0.0.0/0            0.0.0.0/0  
```

Fix successful:

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

Save the rules after success:

```bash
sudo iptables-save | sudo tee /etc/iptables/iptables.rules
sudo systemctl enable --now iptables
```

## Shortcuts

Use `ydotool`

```bash
sudo pacman -S ydotool bc
```

Since I have dual monitors, the `hyprland` pixel coordinates and `ydotool` pixel coordinates are different. Testing this makes me want to puke 🤮. Put on hold for now.

## Other Knowledge

`waydroid shell` is similar to `adb shell`, but since it's a container, it's faster than ADB and has higher privileges.

`waydroid` file paths are stored in `.local/share/waydroid/data/media/0`

Access requires `root` privileges:

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

You can install APKs via the terminal:

```bash
waydroid app install /path/to/your-app.apk
```

List installed apps:

```bash
waydroid app list
```

Debug log information:

```bash
waydroid logcat
# Only show errors
waydroid logcat *:E
# Use grep to filter info
waydroid logcat | grep "com.bilibili"
```

Besides using `logcat`, since the kernel is shared, you can also use `dmesg` to capture logs.

```bash
sudo dmesg -w | grep -iE "waydroid|binder|lxc"
```

The Android configuration file is located at `/var/lib/waydroid/waydroid_base.prop`.

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

`waydroid` has two UI modes: `Multi-Window` and `Full-UI`.

`Multi-window` allows apps to become independent `wayland` windows.

`Full-UI` renders a complete Android desktop.

## Reference Links

 - [waydroid docs](https://docs.waydro.id/)
 - [archwiki waydroid](https://wiki.archlinux.org/title/Waydroid)

---

$upd:$

There are just too many bugs. I don't strictly need to game on Linux anyway, so I'm ditching waydroid. R.I.P.
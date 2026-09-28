### AUTOMATE FIELD
Topic=My 10,000 Yen Homelab: It Is Not a Raspberry Pi
ID=homelab-10k-yen-server
CREATED_DATE=2026-09-28T00:00:00Z
EDITED_DATE=2026-09-28T00:00:00Z
TAG=homelab,NEC Mate,Debian,Docker,Frigate
CATEGORY=Homelab
CATEGORY_CAPTION=Homelab
AI_SUMMARY=Alan introduces his homelab server in Japan, a used NEC Mate business mini PC that cost about 10,000 yen. Although its user account is named "pi", it is not a Raspberry Pi but an x86 machine with an Intel Core i3-9100T, 12 GB of mismatched DDR4 and a 500 GB 7200 rpm laptop hard drive, running Debian 13. The post lists what it runs: an ArozOS web desktop, Frigate NVR with object detection on the integrated GPU through OpenVINO, a Munin monitoring stack, an OnlyOffice document server, a Virtual DSM instance for API testing, a Samba file share and a Go-based Keio Line train board, reached through Cloudflare Tunnel and Tailscale. He reviews its health, including temperatures around 40°C, about one watt of CPU package power at idle and a high head-parking count on the drive, and closes with planned upgrades such as an SSD and matched RAM.
### AUTOMATE FIELD END

# My 10,000 Yen Homelab: It Is Not a Raspberry Pi

If you ever SSH into my homelab, the prompt says `pi@debian-server-jp`. Everyone assumes it is a Raspberry Pi. It is not. The username is just an old habit from my Raspberry Pi days that I never bothered to change.

The real machine is a second-hand **NEC Mate** office mini PC that cost me about **10,000 yen**. Japan is full of these: companies lease business PCs for a few years, then the used market sells them off cheaply. For the price of a Raspberry Pi 5 kit, I got a quad-core x86 box with a real SATA drive, 12 GB of RAM and Intel graphics.

## The Hardware

Here is what is inside:

| Part | Detail |
|---|---|
| Model | NEC Mate type ML (PC-MKL31CZG6), mini PC chassis |
| CPU | Intel Core i3-9100T, 4 cores / 4 threads, 3.1–3.7 GHz, 35 W TDP |
| Graphics | Intel UHD Graphics 630 |
| Chipset | Intel B360 |
| RAM | 12 GB DDR4 SO-DIMM (8 GB SK Hynix + 4 GB Samsung) |
| Storage | 500 GB WD Black 2.5" laptop HDD, 7200 rpm |
| Network | Intel I219-V gigabit Ethernet, Intel Wireless 8265 Wi-Fi |
| Firmware | NEC BIOS from June 2019, UEFI |
| OS | Debian 13 (trixie), kernel 6.12 |

A few honest notes about this spec sheet:

- **The RAM does not match.** One stick is 8 GB rated at 2133 MT/s, the other is 4 GB rated at 2666 MT/s, so the pair runs at 2133. It works fine, and it was free, so I am not complaining.
- **The system disk is a spinning laptop drive.** It is a 7200 rpm WD Black, which is about as good as a 2.5" hard drive gets, but it is still a hard drive. More on that below.
- **The "T" in i3-9100T matters.** It is the low-power version of the chip, which is exactly what you want in a machine that never turns off.

## Why Not a Raspberry Pi?

I like Raspberry Pis, but for a machine that runs a pile of containers all day, a used office PC wins on almost every point:

- **x86 compatibility.** Every Docker image just works. No hunting for ARM builds.
- **Real storage.** A SATA port instead of an SD card that will eventually wear out.
- **A usable GPU.** The UHD 630 handles video decoding and runs AI object detection for my camera (see below).
- **Price.** Around 10,000 yen for the whole box, power supply included.

The trade-off is power draw and size, and even there it does better than I expected. When the machine is mostly idle, the processor itself draws only about **1 W**. That is not the whole box at the wall plug, but it tells me the chip spends most of its day asleep.

## What It Runs

Here is what I run on it today:

- **ArozOS**, a web desktop and file manager. I also use this machine as my development box for ArozOS work.
- **Frigate NVR** for my security camera. Object detection runs on the integrated GPU through **OpenVINO**, so there is no need for a Coral TPU.
- **Munin** for monitoring: CPU, memory, temperature, bandwidth, disk I/O and time drift, all graphed.
- **OnlyOffice Document Server** for editing documents in the browser.
- **Virtual DSM**, a Synology DSM running in a container, which I use to test and reverse engineer Synology APIs.
- **Samba** for a network file share, with WS-Discovery so Windows can find it.
- **A Keio Line live board**, a small Go service that turns the Keio train-position feed into a wide dashboard for my desk.

For access, **Cloudflare Tunnel** publishes the web services without opening any ports on my router, and **Tailscale** gives me a private way in when I am outside.

## A Quick Health Check

Since I bought it used, with a used drive, I keep an eye on how it is holding up:

- **Temperatures:** the CPU sits around **40°C** and the drive around **36°C**. The little NEC case handles a 35 W chip without any trouble.
- **Drive health:** The drive passes its health check, with no bad sectors so far. It has about **13,900 hours** of use on it, most of them probably from its previous life in an office.
- **One thing to watch:** the drive has already parked its heads about **139,000** times. Laptop drives park their heads aggressively to save power, and on a server that never sleeps, those parks add up. It is not an emergency, but it is a good reason for the upgrade below.
- **Memory:** everything above fits in about 4 GB, so there is still plenty of room in the 12 GB.

## What I Would Upgrade Next

1. **Move the OS to an SSD.** It would make everything faster and remove the head-parking worry. The hard drive can stay as bulk storage for camera recordings.
2. **Matched RAM.** Two identical 8 GB or 16 GB sticks would give more room for containers and virtual machines.
3. **Backups.** Last year's [homelab report](/posts/sla_2025) taught me that drives die without warning. This machine deserves a proper off-site backup too.

## Conclusion

For about 10,000 yen, this little NEC box runs my camera system, monitoring, file sharing, office suite, test environments and a train board, all at the same time and quietly. It is not a Raspberry Pi, whatever the prompt says, and I think it is a better homelab for it. If you are in Japan and want to start a homelab, check the used business PC shelves before you buy a Pi.

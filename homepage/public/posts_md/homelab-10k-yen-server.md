### AUTOMATE FIELD
Topic=一萬日圓的 Homelab：它不是 Raspberry Pi
ID=homelab-10k-yen-server
CREATED_DATE=2026-09-28T00:00:00Z
EDITED_DATE=2026-09-28T00:00:00Z
TAG=homelab,NEC Mate,Debian,Docker,Frigate
CATEGORY=Homelab
CATEGORY_CAPTION=Homelab
AI_SUMMARY=作者介紹他在日本的 Homelab 伺服器：一台花了約一萬日圓買來的二手 NEC Mate 商用迷你電腦。雖然使用者帳號叫「pi」，但它並不是 Raspberry Pi，而是一台 x86 電腦，搭載 Intel Core i3-9100T、12 GB 不成對的 DDR4 記憶體和一顆 500 GB 7200 轉筆電硬碟，執行 Debian 13。文章列出它執行的服務：ArozOS 網頁桌面、以 OpenVINO 在內顯上做物件偵測的 Frigate NVR、Munin 監控、OnlyOffice 文件伺服器、用於 API 測試的 Virtual DSM、Samba 檔案分享，以及用 Go 寫的京王線列車看板，並透過 Cloudflare Tunnel 和 Tailscale 對外連線。作者也檢查了機器的健康狀況，包括約 40°C 的溫度、閒置時處理器封裝功耗約一瓦，以及硬碟偏高的磁頭停放次數，最後列出換 SSD 和成對記憶體等升級計畫。
### AUTOMATE FIELD END

# 一萬日圓的 Homelab：它不是 Raspberry Pi

如果你 SSH 進我的 Homelab，會看到提示字元寫著 `pi@debian-server-jp`。每個人都以為這是一台 Raspberry Pi。其實不是。使用者名稱叫 pi，只是我從玩 Raspberry Pi 那時候留下的老習慣，一直懶得改。

真正的機器是一台二手的 **NEC Mate** 商用迷你電腦，大約花了 **一萬日圓**。日本的二手市場到處都是這種機器：公司租用商用電腦幾年，到期後就流到二手市場便宜賣掉。用一套 Raspberry Pi 5 的價錢，我換到一台有真正 SATA 硬碟、12 GB 記憶體和 Intel 內顯的四核心 x86 電腦。

## 硬體規格

與其靠記憶，我直接問機器本身。以下是 `dmidecode`、`lscpu` 等工具回報的內容：

| 項目 | 規格 |
|---|---|
| 型號 | NEC Mate type ML (PC-MKL31CZG6)，迷你電腦機殼 |
| 處理器 | Intel Core i3-9100T，4 核心 / 4 執行緒，3.1–3.7 GHz，TDP 35 W |
| 顯示 | Intel UHD Graphics 630 |
| 晶片組 | Intel B360 |
| 記憶體 | 12 GB DDR4 SO-DIMM（8 GB SK Hynix + 4 GB Samsung） |
| 儲存 | 500 GB WD Black 2.5 吋筆電硬碟，7200 轉 |
| 網路 | Intel I219-V Gigabit 乙太網路、Intel Wireless 8265 Wi-Fi |
| 韌體 | NEC BIOS，2019 年 6 月版，支援 UEFI |
| 作業系統 | Debian 13 (trixie)，核心 6.12 |

關於這張規格表，有幾點要老實說：

- **記憶體不成對。** 一條是 8 GB、額定 2133 MT/s，另一條是 4 GB、額定 2666 MT/s，所以兩條一起只能跑在 2133。用起來沒問題，而且是免費的，所以我沒什麼好抱怨。
- **系統碟是會轉的筆電硬碟。** 它是 7200 轉的 WD Black，在 2.5 吋硬碟裡已經算頂級，但終究還是機械硬碟。後面會再談。
- **i3-9100T 的「T」很重要。** 它是這顆處理器的低功耗版本，正適合一台永遠不關機的機器。

## 為什麼不用 Raspberry Pi？

我很喜歡 Raspberry Pi，但如果是一台整天跑一堆容器的機器，二手商用電腦幾乎每一項都贏：

- **x86 相容性。** 每個 Docker 映像檔都能直接用，不用到處找 ARM 版本。
- **真正的儲存裝置。** 有 SATA 連接埠，不用擔心遲早會寫壞的 SD 卡。
- **能用的 GPU。** UHD 630 可以處理影片解碼，還能幫我的攝影機跑 AI 物件偵測（後面會提到）。
- **價格。** 整台大約一萬日圓，連電源都包含在內。

代價是耗電和體積，但連這兩點都比我預期的好。處理器內建的功耗計數器（Intel RAPL）顯示，機器大致閒置時，處理器封裝只用了大約 **1 W**。這不是插座端的實際耗電，但可以看出這顆晶片一天大部分時間都在休眠。

## 它在跑什麼

目前它是一台小而忙碌的伺服器：

- **ArozOS**：網頁桌面兼檔案管理器。我也用這台機器做 ArozOS 的開發。
- **Frigate NVR**：負責我的監視攝影機。物件偵測透過 **OpenVINO** 在內顯上執行，所以不需要 Coral TPU。
- **Munin**：監控 CPU、記憶體、溫度、頻寬、磁碟 I/O 和時間偏移，全部畫成圖表。
- **OnlyOffice Document Server**：在瀏覽器裡編輯文件。
- **Virtual DSM**：在容器裡跑的 Synology DSM，我用它來測試和逆向分析 Synology 的 API。
- **Samba**：網路檔案分享，搭配 WS-Discovery 讓 Windows 能自動找到它。
- **京王線即時看板**：一個用 Go 寫的小服務，把京王線的列車位置資料變成適合放在桌上的寬版看板。

對外連線方面，**Cloudflare Tunnel** 讓網頁服務可以對外公開，不用在路由器上開任何連接埠；**Tailscale** 則讓我在外面時也能用私人通道連回家。

## 簡單健康檢查

既然是二手機器配二手硬碟，我檢查了一下它的狀況：

- **溫度：** CPU 大約 **40°C**，硬碟大約 **36°C**。NEC 這個小機殼應付 35 W 的處理器毫無壓力。
- **硬碟健康：** SMART 檢查結果為 **PASSED**，重新配置和待處理磁區都是零。通電時數大約 **13,900 小時**，大部分應該是它上一份辦公室工作時累積的。
- **需要留意的一點：** 硬碟的磁頭停放次數（Load_Cycle_Count）已經大約 **139,000 次**。筆電硬碟為了省電會很積極地停放磁頭，在一台從不休眠的伺服器上，這個次數會一直累積。還不到緊急的程度，但這正是下面第一項升級的理由。
- **記憶體：** 12 GB 中大約 4 GB 被程式使用，剩下大部分是快取，可用記憶體還有大約 7 GB。

## 下一步升級

1. **把系統搬到 SSD。** 整體會更快，也不用再擔心磁頭停放次數。原本的硬碟可以留著當攝影機錄影的大容量儲存。
2. **換成成對的記憶體。** 兩條相同的 8 GB 或 16 GB，可以給容器和虛擬機更多空間。
3. **備份。** 去年的 [Homelab 運維年度報告](/posts/sla_2025) 讓我學到，硬碟會在毫無預警的情況下壞掉。這台機器也應該要有完善的異地備份。

## 結語

花大約一萬日圓，這台小小的 NEC 同時安靜地跑著我的監視系統、監控、檔案分享、線上辦公室、測試環境和列車看板。不管提示字元怎麼寫，它都不是 Raspberry Pi，而我覺得正因如此，它才是更好的 Homelab。如果你在日本也想開始玩 Homelab，買 Pi 之前，不妨先去看看二手商用電腦的貨架。

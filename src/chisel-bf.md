title: (Chiselを使って)FPGAで動く何かを作った話
subtitle: ゆるい話をします
class: animation-fade
layout: true

<!-- This slide will serve as the base layout for all your slides -->
.bottom-bar[
  {{title}}
]

---

class: impact

## {{title}}
### {{subtitle}}

---

# Scope

Chiselの紹介と、使ってみた所感についてお話します。

* **FPGAに興味があるかもしれない人**
  * 何ができるか多めにしました
* Verilog HDLやVHDLを使ったことがある人
* Chiselを使ってなにか作ってみたい人

---

# Agenda

* FPGAとは
* Chiselについて
* 作ったもの
* 開発反省
* まとめ

---

# What is an FPGA?

Field Programmable Gate Arrayの略。
**論理回路を書き換え可能なLSI**

--

.col-7[

## 何がすごい

* 書き換え可能
    * ASICだとMask変更💰
* 回路を作れる 
  * CPUではできない並列/高速処理😊
* **個人で使える**(最高😍)
  * 安いものなら秋月電子でも600円から

]
.col-5[
<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-akizuki.png?raw=true" style="width: 100%"/>
]

---

# どんな物が作れる

.col-4[
### 計算アクセラレータ
<img src="https://pbs.twimg.com/media/C1jiVYQUsAA9KtK?format=jpg&name=large" style="width: 95%"/>
* Mandelbrot計算専用HW
* HDMI出力も自作
]
--
.col-4[
### コントローラ(はやい)
<img src="https://pbs.twimg.com/media/ChddWBIUkAU9knO?format=jpg&name=large" style="width: 95%"/>
* SDRAM->LCD描画HW
* DMACみたいな
]
--
.col-4[
### 汎用ペリフェラル
<img src="https://pbs.twimg.com/media/CstQoJBVYAAZ60s?format=jpg&name=large" style="width: 95%"/>
* Stepper Moter HW×4基
* LEが許す限り増やせる
]

---

# 開発環境

HDL, Simulationの話


---

# つらみどころ

---

# Chiselとは

TPU, RISC-V

---

# Scala


---

# 構文比較

---

# つくったもの

Brainf**k Processor

---

# bfをc言語で書くと

---

# 全体設計

---

# いい感じコード紹介

---

# できた

---

# まとめ

---

class: impact

## Fin.

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

* .primary[FPGAに興味があるかもしれない人]
  * 何ができるか多めにしました
* Verilog HDLやVHDLを使ったことがある人
* Chiselを使ってなにか作ってみたい人

---

# Agenda

* 前置き
  * FPGAとは
  * 開発について
* Chiselについて
* 作った話
* まとめ

---

# What is an FPGA?

Field Programmable Gate Arrayの略。
.primary[論理回路を書き換え可能なLSI]

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

# 作り方

- 方式検討
  - アイデアとかこねこねする
--

- 実装
  - RTL(レジスタ転送レベル)で設計。.primary[HDLで記述]
    - 流行ってるCとかC++などから変換するのは高位合成と呼ばれている
--
- 論理テスト
  - 正しく動くか試す。.primary[HDLで記述]するかC++に変換してからやったりとか
--

- 実機テスト
  - 動けば神

---

## HDL(ハードウェア記述言語)


.col-8[
```verilog
module divider(
    input clk, input rstn, output sig
);
reg [7:0] counter;
assign sig = counter[7];
always @ (posedge clk) begin
    if (rstn != 1'b1) begin
        counter <= 8'x0;
    end else begin
        counter <= counter + 8'x1;
    end
end
endmodule
```
]

.col-4[
### 分周器

* 周波数を1/nして出力する
* Verilog HDLで書いた例
]
---

# 記述のつらみ

VHDL, Verilog HDL, SystemVerilogが主流

- プログラミング言語ではない
  - 透けて見えるのはアセンブラではなくフリップフロップ
  - .primary[テストを書くのが大変になりがち]
- 記述の規格が曖昧
  - VHDLは厳格で冗長すぎるし、Verilogはガバガバ(型チェックとか)
  - .primary[オブジェクト指向とは]🤔

.small[※個人の感想です]
---

# Chiselとは

[Chisel](https://chisel.eecs.berkeley.edu/)はScalaでHDLが書ける(組み込みDSL)

.col-6[
### Edge TPU
[Google](https://cloud.google.com/edge-tpu/?hl=ja): 推論を行うための専用ASIC
]
.col-6[
### RISC-V実装
[berkeley.edu](https://bar.eecs.berkeley.edu/): CPU実装
]

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


<script src="mermaid/mermaid.min.js">
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

* 周波数を1/(2^n)して出力
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

[Chisel](https://chisel.eecs.berkeley.edu/)はScalaでHDLが書ける(組み込みDSL)。Verilog HDLにTranslateできる。

.col-6[
### Edge TPU
<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-tpu.png?raw=true" style="width: 95%"/>
]
.col-6[
### RISC-V実装
<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-ucb.png?raw=true" style="width: 95%"/>
]

---

# Chiselの構文

.col-8[
```scala
class Counter(width: UInt) {
    val io = IO(new Bundle {
        val dout = Output(Bool())
    })
    val counter = RegInit(UInt(width.U), 0.U)
    io.dout <> counter(7).B
    counter := counter + 1.U
}
```
]

.col-4[
### 分周器

* scalaの値がマクロになる
  * widthとかifとか
* 値の集合をBundleで定義
  * 共通化できる
* 同期回路前提
* Scalaのままテスト可
]

---

class: impact

## つくったもの
Brainf**k言語処理系 on FPGA

---

# BF処理系

- `>`, `<` データのポインタをincrement/decrement
- `+`, `-` データをincrement/decrement
- `,` 入力値をデータに上書き
- `.` データを出力(putchar相当)
- `[`, `]` branch(while文相当) 
--

- "Hello World!"
  - .small[`">+++++++++[<++++++++>-]<.>+++++++[<++++>-]<+.+++++++..+++.[-]>++++++++[<++++>-]<.>+++++++++++[<+++++>-]<.>++++++++[<+++>-]<.+++.------.--------.[-]>++++++++[<++++>-]<+.[-]++++++++++."`]

---

# 全体設計

- PCとはUARTで通信してプログラムの書き換えができるようにする
- プロセッサの動作を止めないようにFIFOを入れる

<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-arch.png?raw=true" style="width: 95%"/>

---

# コード例: Processor

.col-8[
<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-code.png?raw=true" style="width: 120%"/>
]
.col-4[
## 命令デコーダ
* BFのコードを読んで実行

### いいところ

* 同期回路前提
  * 見通しがいい
* 型がはっきりしている
  * 曖昧だとエラー
]

---

# コード例: Unit Test

.col-8[
<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-test-1.png?raw=true" style="width: 120%"/>
]
.col-4[
## UART送受信
* タイミング生成
* データ送受

### いいところ

* Scalaでテストが書ける
  * コード補完が効く
* デバッグ可
]


---

# コード例: 結合テスト(1/2)

<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-test-3.png?raw=true" style="width: 120%"/>

---

# コード例: 結合テスト(2/2)

.col-8[
<img src="https://github.com/kamiyaowl/presentation/blob/master/src/assets/chisel-bf-test-2.png?raw=true" style="width: 95%"/>
]
.col-4[

## run()

* 文字列をMEMにロード
* haltするまでクロック供給
* 期待値検査

### いいところ

* テストの関数/クラス化
  * 見通しがいい
]

---

# できた

Verilog HDLで出力できるので、FPGAに書き込んで動かしてみる

.col-6[
<img src="https://reference.digilentinc.com/_media/reference/programmable-logic/arty/arty-0.png" style="width: 90%"/>
]
.col-6[
## ボード

* Digilent Arty A7
* Xilinx XC7A35Tが乗ってる
* 贅沢なのでLE(リソース) 死ぬほど余った
]

---

## 開発環境(Vivado)でちょちょいとすると

.col-12[
<img src="https://pbs.twimg.com/media/D2f9vlBUgAE3grK.jpg" style="width: 90%"/>
]

---
class: impact
background-image: url(https://user-images.githubusercontent.com/4300987/55052799-7c7a7b00-509d-11e9-995d-fb8071305202.gif)

## .primary[うごいた！]

---

# まとめ

- .primary[Chisel楽しい]
  - FPGA楽しい、処理系自作楽しい
--

- 同期回路前提の記述なので迂闊なバグを作り込みにくい
  - もちろんInter-Clock Path用の構文もある
--

- ScalaとHDL設計、両方のスキルセットを持った人ってあまりいないんじゃ...
  - .primary[どちらかを知っていれば大丈夫そう]
---

class: impact

## Fin.


<script src="mermaid/mermaid.min.js">
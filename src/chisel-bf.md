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
--

* **FPGAに興味があるかもしれない人**
  * 導入談つけました
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

# FPGAとは

Field Programmable Gate Arrayの略。
--
**論理回路を書き換え可能なLSI**

.col-6[

何がすごい

* 書き換え可能
    * (ASICだとMask変更💰)
* 回路を作れる 
  * CPUではできない並列/高速処理😊
* **個人で使える**(最高😍)

]
--
.col-6[
.right[![Right-aligned image](https://images-na.ssl-images-amazon.com/images/G/01/img15/pet-products/small-tiles/23695_pets_vertical_store_dogs_small_tile_8._CB312176604_.jpg)]
秋月電子より。なんと600円
]
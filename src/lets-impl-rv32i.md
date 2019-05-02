title: RISC-Vを実装してみる
class: animation-fade
layout: true

<!-- This slide will serve as the base layout for all your slides -->
.bottom-bar[
  {{title}}
]

---

class: impact

## {{title}}
### 最小限の命令セットでCPUエミュレータを作ってみた

---

# RISC-V の特徴

## オープンな命令セット(ISA)

* x86-32みたいにベンダーIP(特許怖い)ではなく、公開されている → ***だれでも使える***
* だけど出資企業は多数あり安心(Google, Huawei, IBM, MS, Sumsung, ...)

--

## モジュラーISA

* 基本命令セット+機能ごとの命令セット で構成されている
* 世代を重ねるごとに命令がモリモリにならずに済みそう
    * インクリメンタルISAと呼ばれている

---

# 実装目標: *"Hello RISC-V!"*を出力できる
### Cで書いたコードのコンパイル生成物を実行する

* 命令セット: ***rv32i***
    * ***i***: 基本整数命令のみを実装 (M, F, D, A, C, V, ...などいろいろあるが)

--

* メモリ、キャッシュ、周辺ペリフェラル: ***適当にエミュレート***
    * vaddrだけしっかりマップしてあげれば行けそう
    * UART TXバッファを`0x10000000`に配置

--

* プログラムのロード: ***最低限実装する***
    * ELFローダを作って、該当するvaddrにロードする

--  

---

class: impact

## レジスタの実装

---

# レジスタ>構成

* 32本の32bitのレジスタ: `x[0] ~ x[31]` 
  * `x[0]`: Zeroレジスタ(読み出すと常に`0x0`/書き込みデータは破棄)
  * `x[1]~x[31]`: 特に区別なし(アセンブラレベルでは番号ごと推奨される用途あり)

* 32bitプログラムカウンタ
  * 加算命令などで直接参照することはできない
  * `auipc`, `jal`, `jalr`などで操作

---

# レジスタ>実装

### std::vectorで管理

```c
class Reg {
  protected:
    vector<T> x;
    T pc;
  public:
    const size_t XLEN = 32;
    void reset() {
        x = vector<T>(XLEN, 0x0);
        pc = 0;
    }
```

---

# レジスタ>実装

### レジスタとPCへの読み書きと、PCのインクリメントを実装

```c
T    read(uint8_t addr);
void write(uint8_t addr, T data);
T    read_pc();
void write_pc(T data);
T    get_pc_offset();
void incr_pc();
```

*※ T - テンプレートにしているが、uint32_tに固定などで良さそう*

---

class: impact

## 命令の実装

---

# 命令の形式

### 基本整数命令には6種類に分けられる

![base_inst](assets/スクリーンショット 2019-05-02 16.24.59.png)

*※ 画像はriscv-spec-v2.2.pdfより引用*


---

# 引用

* [riscv.org](https://riscv.org/)
* [riscv/riscv-isa-manual - Github](https://github.com/riscv/riscv-isa-manual)
* [RISC-V原典 日経BP社 オープンアーキテクチャのススメ](https://www.nikkeibp.co.jp/atclpubmkt/book/18/269170/)
  * 著: デイビッド・パターソン
  * 著: アンドリュー・ウォーターマン
  * 訳: 成田 光影
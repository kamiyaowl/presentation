title: RISC-Vを実装してみる
subtitle: 最小限の命令セット(rv32i)でCPUエミュレータを作ってみた
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
    * UART TXバッファを`0x10000000`に配置(putcharしてあげる)

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

## 命令デコーダの実装

---

# 命令デコーダ>命令の形式

### 基本整数命令には6種類に分けられる

![base_inst](https://raw.githubusercontent.com/kamiyaowl/presentation/master/src/assets/riscv-base-inst.png)

---

# 命令デコーダ>命令分岐順序

## 命令の決定

* opcode(レジスタ演算、即値演算、Load、Store、分岐、他などで分かれる)
  * funct3(だいたいここで決まる)
    * funct7(add/sub, srl/sraなど似た命令はここで決まる)

--

### 例(funct3, funct7フィールドがある場合)

* opcode(0b0110011): [`add,sub,sll,slt,sltu,xor,srl,sra,or,and`]
* funct3(0b000): [`add,sub`] → funct7(0b0100000): `sub`

---

# 命令デコーダ>実装

### opでの検索例。opcodeで単純に検索している

`inst`: pcの指している命令の生の値, `instructions`: 定義した命令リスト

```c
uint8_t opcode = (inst >> 0) & 0x7f;
vector<Inst<DATA, ADDR>> filter_op;
std::copy_if(
  instructions.begin(), instructions.end(),
  std::back_inserter(filter_op),
  [&opcode](const Inst<DATA, ADDR>& i) {
    return opcode == i.opcode;
  }
);
```

---

# 命令デコーダ>実装

### フィールドの分解は命令が決まれば、読み方が確定する

```c
case ImmType::S:
    args.imm_raw = 
        (((inst >> 25) & 0x7f) << 5) | 
        ((inst >> 7) & 0x1f);
    args.funct3  = (inst >> 12) & 0x7;
    args.rs1     = (inst >> 15) & 0x1f;
    args.rs2     = (inst >> 20) & 0x1f;

    args.rd      = 0x0;
    args.funct7  = 0x0; 
    args.imm_signed = convert_signed(args.imm_raw, 12);
```

---

# 命令デコーダ>実装(符号拡張)

### 即値(imm)はsignedとして演算に使う必要があるので、計算しておく

`imm`: 即値の値, `bit_width`: `imm`のデータ幅

```c
int32_t convert_signed(uint32_t imm, size_t bit_width) 
  size_t shift = (32 - bit_width);
  uint32_t shifted = imm << shift;
  int32_t  shifted_sign = static_cast<int32_t>(shifted);
  int32_t dst = shifted_sign >> shift;
  return dst;
}
```

---



# 引用

* [riscv.org](https://riscv.org/)
* [riscv/riscv-isa-manual - Github](https://github.com/riscv/riscv-isa-manual)
* [RISC-V原典 日経BP社 オープンアーキテクチャのススメ](https://www.nikkeibp.co.jp/atclpubmkt/book/18/269170/)
  * 著: デイビッド・パターソン
  * 著: アンドリュー・ウォーターマン
  * 訳: 成田 光影
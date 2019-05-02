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

# 作ったもの

* rv32iのエミュレータをc++で書きました
  * https://github.com/kamiyaowl/rv32i-sim

![preview](https://camo.githubusercontent.com/d5c09b95671b83d619b1bcde82b4384dc38557b3/68747470733a2f2f7062732e7477696d672e636f6d2f6d656469612f44356834516d755773414d484f486a2e6a70673a6c61726765)

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

Cで書いたコードのコンパイル生成物を実行する

* 命令セット: ***rv32i***
    * ***i***: 基本整数命令のみを実装 (他色々は一切無視)

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

std::vectorで管理

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

レジスタとPCへの読み書きと、PCのインクリメントを実装

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

# 命令デコーダ>形式

基本整数命令には6種類に分けられる

![base_inst](https://raw.githubusercontent.com/kamiyaowl/presentation/master/src/assets/riscv-base-inst.png)

---

# 命令デコーダ>形式

* `opcode`, `funct3`, `funct7`
  * 命令の種類判別に使う


--

* `rs1`, `rs2`: Register Source
  * 計算の元データを読み込むレジスタを指定(`x[0]` ~ `x[31]`)


--

* `imm`: Immediate
  * 計算に使用する即値
  * 命令によってビット幅が異なったり、符号拡張が必要だったりする


--

* `rd`: Register Destination
  * 計算結果(など)を格納するレジスタを指定
  * `pc`は参照できない、`x[0]`を指定したら結果は捨てる

---

# 命令デコーダ>分岐順序

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

フィールドの分解は命令が決まれば、読み方が確定する

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

### 即値(imm)はsignedとして演算に使う場合があるので、計算しておく

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

class: impact

## 命令の実装

---

# 命令>種類と概要

* (R-Type) レジスタ-レジスタ間演算: `0b0110011` 
  * [`rs1`, `rs2`]で計算をして、`rd`に結果を書き込み


--

* (I-Type) レジスタ-即値間演算: `0b0010011` 
  * [`rs1`, `imm`]で計算をして、`rd`に結果を書き込み


--

* (S-Type) Store: `0b0100011` 
  * Memのアドレス(`rs1`+`signed(imm)`)に`rs2`を加工(byte mask等)して書き込み


--

* (I-Type) Load: `0b0000011` 
  * Memのアドレス(`rs1`+`signed(imm)`)から読み出し、加工して`rd`に書き込み


---

# 命令>種類と概要

* (B-Type) Branch: `0b1100011` 
  * [`rs1`, `rs2`]が特定の条件を満たしたら、`pc`に`pc`+`signed(imm)`を設定


--

* (I-Type) jalr: `0b1100111` 
  * `rd`に`pc + 4`を書き込み, `pc`に`rs1`+`signed(imm)`を設定


--

* (J-Type) jal: `0b1101111` 
  * `rd`に`pc + 4`を書き込み, `pc`に`pc`+`signed(imm)`を設定


--

* (U-Type) auipc: `0b0010111` 
  * `rd`に`pc`+`signed(imm)`を設定

---

# 命令>種類と概要


* (U-Type) lui: `0b0110111` 
  * `rd`に`imm`を設定


---

# 命令>実装

Instクラスを定義, 実際の処理はprocessに委譲

```cpp
template<typename DATA, typename ADDR>
class Inst {
    public:
        string name;
        uint8_t opcode;
        uint8_t funct3;
        uint8_t funct7;
        ImmType immType;
        function<Process<DATA, ADDR>> process;

```

---

# 命令>実装

Instクラスの実行は、命令のパース→`this->process`に丸投げ

* `parse_args`: 先程実装した命令デコードする関数
* `args`に`rs1,rs2,rd,imm, ...`情報が入っている

```cpp
    void run(Reg<DATA>& reg, Mem<DATA, ADDR>& mem, DATA inst) {
        Args args;
        parse_args(inst, this->immType, args);
        this->process(reg, mem, args);
    }
}
```

---

# 命令>実装

命令種類ごとに共通処理をラップ。`p: func<DATA(DATA)>`などを外から指定する

```cpp
inline Inst<DATA, ADDR> alu_32i_s_inst(string name, /* 中略 */ ...) {
return Inst<DATA, ADDR>(
    name,0b0100011,funct3,0x0,ImmType::S,
    [&](Reg<DATA>& reg, Mem<DATA, ADDR>& mem, const Args args) {
        ADDR addr = reg.read(args.rs1) + args.imm_signed;
        DATA data = p(reg.read(args.rs2));

        mem.write(addr, data);
        reg.incr_pc();
    }
);
```
---

# 命令>実装

先程のラップした関数で、同一`opcode`の命令を実装。`instructions`として定義

```cpp
using S    = int32_t;
using ADDR = uint32_t;
alu_32i_r_inst<S, ADDR>(
  "add",
  0b000,
  0b0000000,
  [](S a, S b) { return a + b; }
),
```

ラムダ式は最高だ

---

# 命令>実装

そして`funct3/7`で量産します。(uintの明示が必要なところは`static_cast<U>`で)

```cpp
"add"   , 0b000, 0b0000000, [](S a, S b) { return a + b; }),
"sub"   , 0b000, 0b0100000, [](S a, S b) { return a - b; }),
"sll"   , 0b001, 0b0000000, [](S a, S b) { assert(b > -1); return static_cast<U>(a) << b; }),
"slt"   , 0b010, 0b0000000, [](S a, S b) { return a < b ? 0x1 : 0x0; }),
"sltu"  , 0b011, 0b0000000, [](S a, S b) { return static_cast<U>(a) < static_cast<U>(b) ? 0x1 : 0x0; }),
"xor"   , 0b100, 0b0000000, [](S a, S b) { return static_cast<U>(a) ^ static_cast<U>(b); }),
"srl"   , 0b101, 0b0000000, [](S a, S b) { assert(b > -1); return static_cast<U>(a) >> b; }),
"sra"   , 0b101, 0b0100000, [](S a, S b) { assert(b > -1); return a >> b; }),
"or"    , 0b110, 0b0000000, [](S a, S b) { return static_cast<U>(a) | static_cast<U>(b); }),
"and"   , 0b111, 0b0000000, [](S a, S b) { return static_cast<U>(a) & static_cast<U>(b); }),

```


---

# 命令>実装

`jalr`などは、`imm`を符号拡張する必要があるので次のようにしてある。

`imm_signed`は符号拡張済なので、`int32_t`同士の演算になっている。

```cpp
"jalr", 0b1100111, 0x0, 0x0, ImmType::I,
[](Reg<S>& reg, Mem<S, ADDR>& mem, const Args args) {
    reg.write(args.rd, reg.read_pc() + reg.get_pc_offset());

    S rs1 = reg.read(args.rs1);
    S dst = rs1 + args.imm_signed;
    reg.write_pc(dst);
}
```
---

class: impact

## 他
### Mem, ELF Loader, バイナリ生成など

---


---

# 引用

* [riscv.org](https://riscv.org/)
* [riscv/riscv-isa-manual - Github](https://github.com/riscv/riscv-isa-manual)
* [RISC-V原典 日経BP社 オープンアーキテクチャのススメ](https://www.nikkeibp.co.jp/atclpubmkt/book/18/269170/)
  * 著: デイビッド・パターソン
  * 著: アンドリュー・ウォーターマン
  * 訳: 成田 光影
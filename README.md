<!-- start_presentation_list -->
* [(Chiselを使って)FPGAで動く何かを作った話](https://kamiyaowl.github.io/presentation/dist/chisel-bf.html)
* [RISC-Vを実装してみる](https://kamiyaowl.github.io/presentation/dist/lets-impl-rv32i.html)
* [Backslide Sample Presentation](https://kamiyaowl.github.io/presentation/dist/presentation.html)
<!-- end_presentation_list -->

# 内容の誤りについて

お手数おかけ致しますが、[Issue](https://github.com/kamiyaowl/presentation/issues/new)にあげていただけると幸いです。

# Fork me

もし本リポジトリをforkして使用したい場合、スライドの内容を除いて利用することができます。Licenseを以下に示します。

* スライドの内容 [`/src`, `/dist`, `/pdf`]
    * [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/deed.ja)
    * その他付随する資料や関連リポジトリについてはそれぞれのライセンスを優先することとします
* 上記を除いたリポジトリ構成ファイル
    * [MIT License](https://github.com/kamiyaowl/presentation/blob/master/LICENSE)

本プレゼン資料生成には[backslide](https://github.com/sinedied/backslide) を使用しており、`/template`と`package.json`を準備しています。

ですので、以下の手順でプレゼンテーション作成環境を整えることができます。

1. 本リポジトリをfork
1. `$ npm install`
1. `$ npm run reset`
1. `$ npm run build`

`/template`にはGoogle Analyticsのコードが埋め込まれていますが、`npm run reset`で削除されます。

# Link

* [portfolio](https://kamiyaowl.github.io/)
* [blog](https://kamiyaowl.github.io/blog/)
* [kamiyaowl - Github](https://github.com/kamiyaowl)
* [kamiyaowl/presentation](https://github.com/kamiyaowl/presentation)




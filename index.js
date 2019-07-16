const assert = require('assert');
const fs     = require('fs');
const path   = require('path');
const config = require ('config');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const baseUrl = pkg.homepage;
assert(baseUrl, 'undefined: package.json::baseUrl.');

// ファイルの'title: '行を取得して返す: string[]
// x: 拡張子なしファイルパス
const getTitle = (x) => {
    const p = path.join(config.srcDir, `${x}.md`);
    const txt = fs.readFileSync(p, 'utf-8');
    const titles = txt.match(/^(title\:\s)(.+)/g);
    if (!titles) {
        console.warn(`undefined title: ${x}`);
        return 'notitle';
    }
    const dst = titles[0].replace('title: ', '');
    return dst;
};
// mdに追記する内容を作る: string[]
// dir: pdf or dist
// ext: pdf or html
const genMd = (files, titles) => {
    assert(files.length == titles.length);
    const arr = [];
    arr.push(config.startTag);
    for(let i = 0 ; i < files.length ; ++i) {
        const htmlUrl = `${baseUrl}dist/${files[i]}.html`;
        const pdfUrl = `${baseUrl}pdf/${files[i]}.pdf`;
        const text = 
            config.insertTextFormat
                  .replace('<TITLE>'    , titles[i])
                  .replace('<HTML_URL>' , htmlUrl)
                  .replace('<PDF_URL>'  , pdfUrl);
        arr.push(text);
    }
    arr.push(config.endTag);
    return arr.join('\n');
}

/* ここから適当に処理 */

// 拡張子なしファイルリスト
const files = 
    fs.readdirSync(config.srcDir)
      .filter(x => x.indexOf('.md') > -1)
      .map(x => x.replace('.md', ''));
// プレゼンタイトル
const titles = files.map(x => getTitle(x));
const md = genMd(files, titles);
// タグの挿入された箇所を特定して置き換える
const srcLines = fs.readFileSync(config.readmePath, 'utf-8').toString().split('\n');
let startIndex = -1;
let endIndex = -1;
for(let i = 0 ; i < srcLines.length ; ++i) {
    if (srcLines[i] == config.startTag) {
        startIndex = i;
    }
    if (srcLines[i] == config.endTag) {
        endIndex = i;
    }
    if (startIndex > -1 && endIndex > -1) break;
}
assert(startIndex > -1 && endIndex > -1);
// 置き換え
let dstStr = '';
for(let i = 0 ; i < srcLines.length ; ++i) {
    if (i == startIndex) {
        i = endIndex;
        dstStr += md + '\n';
    } else {
        dstStr += srcLines[i] + '\n';
    }
}
fs.writeFileSync(config.readmePath, dstStr, { encoding: 'utf-8' });
console.log(dstStr);
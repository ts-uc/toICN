let isAutoKeyDetection = true;
let key = "";
let keyMinorSignature = "";
let detectedKey = "";
let detectedKeyMinorSignature = "";
//ChordやKeyを読む
let chordElms = [];
let keyElm;
if(document.title.indexOf("U-フレット") != -1){chordElms = chordElms.concat(Array.prototype.slice.bind(document.getElementsByTagName("rt"))());}
if(document.title.indexOf("ChordWiki") != -1){
  chordElms = chordElms.concat(Array.prototype.slice.bind(document.getElementsByClassName("chord"))());
  keyElm = document.getElementsByClassName('key')[0];
}
if(document.title.indexOf("楽器.me") != -1){chordElms = chordElms.concat(Array.prototype.slice.bind(document.getElementsByClassName("cd_fontpos"))());}
if(document.title.indexOf("J-Total Music!") != -1){
  chordElms = chordElms.concat(Array.prototype.slice.bind(document.getElementsByTagName("tt")[0].getElementsByTagName("a"))());
  keyElm = document.getElementsByClassName("box2")[0].getElementsByTagName("h3")[0];
}
let chords = chordElms.map((e) => e.firstChild.nodeValue);
//書かれているキーを読み取り
let keyMatch = keyElm?keyElm.firstChild.nodeValue.match(/(: |：)([A-G](#|b){0,1})(m{0,1})$/):null;
detectedKey = keyMatch?sharpify(keyMatch[2]):"";
detectedKeyMinorSignature = keyMatch?keyMatch[4]:"";
if(detectedKey == ""){
  // キーの自動判定
  let tmpDetectedKey = "";
  let maxCount = 0;
  scale.forEach((s) => {
    key = s;
    let notSwapCodesCount = chords.slice(0,30).map((s) => exports.toICN(s)).filter((s) => !(/dim|m7-5|aug/).test(s)).filter((s) => /^([123456][^#~]*$|3~[^#]*$)/.test(s)).length;
    if(notSwapCodesCount > maxCount){
      maxCount = notSwapCodesCount;
      detectedKey = key;
    }
  });
  key = "";
  detectedKeyMinorSignature = "u";
}

let displayedKey = exports.getDisplayedKey(detectedKey, detectedKeyMinorSignature);
// キーの手動設定
var result = prompt("自動検出されたキー:" + displayedKey + "\n別のキーを指定したい場合は、下にキーを入力してください。(例:C)\nよくわからなければ、そのままOKを押してください。");
let resultMatch = result.match(/([A-G](#|b){0,1})(m{0,1})$/);
let resultKey = (resultMatch?sharpify(resultMatch[1]):"");
let resultKeyMinorSignature = resultMatch?resultMatch[3]:"";
if(scale.includes(resultKey)){isAutoKeyDetection = false;}
if(isAutoKeyDetection){
  key = detectedKey;
  keyMinorSignature = detectedKeyMinorSignature=="u"?"":detectedKeyMinorSignature;
}
else{
  key = resultKey;
  keyMinorSignature = resultKeyMinorSignature;
}
//表示書き換え関係
chordElms.forEach((e) => {
  let icn = exports.toICN(""+e.firstChild.nodeValue);
  let isSharp = false;
  let isSwap = false;
  let isBlueChord = false;
  //シャープ、スワップ、特定のセブンスコード等の条件を満たすかどうかを調べる
  if(icn!=""){
    e.firstChild.nodeValue = icn;
    if(icn.includes("#")){isSharp = true;}
    if(icn.includes("~")){isSwap = true;}
    if("1[7],1#[7],4[7],4#[7],2[M7],2#[M7],3[M7],5[M7],5#[M7],6[M7],6#[M7],7[M7]".split(",").includes(icn) || /\[sus4\]|\[aug\]|\[dim\]|\[m7\-5\]$/.test(icn)){
      isBlueChord = true;
    }
  }
  //特定の条件を満たすコードに色を付ける
  if(isSharp&&isSwap){e.classList.add("sharpswap");}
  else if(isSharp&&!isSwap){e.classList.add("sharp");}
  else if(!isSharp&&isSwap){e.classList.add("swap");}
  if(isBlueChord){e.classList.add("bluechord");}
  else{e.classList.add("notbluechord");}
});

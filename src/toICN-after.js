let keyElm = document.getElementsByClassName('key')[0];
let keyMatch = keyElm?keyElm.firstChild.nodeValue.match(/: ([A-G](#|b){0,1})(m{0,1})$/):null;
key = keyMatch?keyMatch[1]:"";
keyMinorSignature = keyMatch?keyMatch[3]:"";
let chordElms = [];
if(document.title.indexOf("U-フレット") != -1){chordElms = chordElms.concat(Array.prototype.slice.bind(document.getElementsByTagName("rt"))());}
if(document.title.indexOf("ChordWiki") != -1){chordElms = chordElms.concat(Array.prototype.slice.bind(document.getElementsByClassName("chord"))());}
let chords = chordElms.map((e) => e.firstChild.nodeValue);
detectedKey = "";
if(key == ""){
  let maxCount = 0;
  scale.forEach((s) => {
    key = s;
    let notSwapCodesCount = chords.slice(0,30).map((s) => module.exports(s)).filter((s) => !(/dim|m7-5|aug/).test(s)).filter((s) => /^([123456][^#~]*$|3~[^#]*$)/.test(s)).length;
    if(notSwapCodesCount > maxCount){
      maxCount = notSwapCodesCount;
      detectedKey = key;
    }
  });
  key = detectedKey;
  alert("Auto Detect Key: " + key);
};
chordElms.forEach((e) => {
  let icn = module.exports(""+e.firstChild.nodeValue);
  let isSharp = false;
  let isSwap = false;
  let isBlueChord = false;
  if(icn!=""){
    e.firstChild.nodeValue = icn;
    if(icn.includes("#")){isSharp = true;}
    if(icn.includes("~")){isSwap = true;}
    if("1[7],1#[7],4[7],4#[7],2[M7],2#[M7],3[M7],5[M7],5#[M7],6[M7],6#[M7],7[M7]".split(",").includes(icn) || /\[sus4\]|\[aug\]|\[dim\]|\[m7\-5\]$/.test(icn)){
      isBlueChord = true;
    }
  }
  if(isSharp&&isSwap){e.classList.add("sharpswap");}
  else if(isSharp&&!isSwap){e.classList.add("sharp");}
  else if(!isSharp&&isSwap){e.classList.add("swap");}
  if(isBlueChord){e.classList.add("bluechord");}
  else{e.classList.add("notbluechord");}
});

const NScale = ["1","1#","2","2#","3","4","4#","5","5#","6","6#","7"];
const MinorNScale = ["3","3#","4","4#","5","6","6#","7","7#","1","1#","2"];
const scale = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const majorScale = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
const minorScale = ["A","Bb","B","C","C#","D","D#","E","F","F#","G","G#"];

// フラットをシャープに置き換える関数
let sharpify = (s) => s.replace("＃","#").replace("♯","#").replace("♭","b").replace("Db","C#").replace("Eb","D#").replace("Fb", "E").replace("Gb","F#").replace("Ab","G#").replace("Bb","A#").replace("Cb", "B");

// 算用数字を漢数字に変換
let convertToKanji = (s) => s.replace("1","一").replace("2","二").replace("3","三").replace("4","四").replace("5","五").replace("6", "六").replace("7","七");

// キーを格納するためのクラス
exports.Key = class{
  constructor(raw="",canDetectMajorOrMinor=false){ // keyがメジャーかマイナーか特定できる場合は canDetectMajorOrMinor=true
    let rawMatch = raw.match(/([A-G](#|b|＃|♯|♭){0,1})(.{0,1})/);
    let tmpKeyNo = rawMatch?scale.indexOf(sharpify(rawMatch[1])):-1;
    let tmpMinorSignature = rawMatch?rawMatch[3]:"";
    if(tmpMinorSignature == "m"){tmpKeyNo = (tmpKeyNo+3) % 12;}
    this.keyNo = tmpKeyNo;
    this.minorSignature = canDetectMajorOrMinor?tmpMinorSignature:"u";

    this.majorScaleName = this.keyNo==-1?"":majorScale[this.keyNo];
    this.minorScaleName = this.keyNo==-1?"":minorScale[this.keyNo] + "m";

    if (this.minorSignature == ""){this.key = this.majorScaleName;}
    else if (this.minorSignature == "m"){this.key = this.minorScaleName;}
    else{this.key = this.majorScaleName + "/" + this.minorScaleName;}
  }
};

// 元のchordを格納するクラス
exports.Chord = class{
  constructor(noIndex, onChordNoIndex, q){
    this.noIndex = noIndex; // NScale
    this.onChordNoIndex = onChordNoIndex; // NScale
    this.q = q; // 7, M7, 6, add9, aug, sus4, m, m7, mM7, m6, madd9, dim, m7-5, m7(9), 7(9)
    this.isMinor = "m,m7,mM7,m6,madd9,dim,m7-5,m7(9)".split(",").includes(q);
  }
  no(settings, modulation=0){
    let noIndex = (this.noIndex- settings.key.keyNo + modulation + 24)% 12;
    return settings.minorMode?MinorNScale[noIndex]:NScale[noIndex];
  }
  onChordNo(settings, modulation=0){
    if(this.onChordNoIndex == -1){
      return "";
    }
    else{
      let onChordNoIndex = (this.onChordNoIndex - settings.key.keyNo + modulation + 24)% 12;
      return settings.minorMode?MinorNScale[onChordNoIndex]:NScale[onChordNoIndex];
    }
  }
};

// toICNのインターフェイス（黄色いやつ）を表示する関数
exports.addToICNBar = function(){
  let barText = 
    '<div class="toicnbar" style="background-color: #f4ffa2; margin: 5px auto; padding: .75rem 1.25rem;">'
    + '<div id="displayedkey" style="font-weight: bold; font-size: 150%; color: #1a4a9c">'
    + '</div>'
    + '<label>Mode:'
    + '<select class="selectedmode" name="selectedmode">'
    + '<option value="off">Off(変換前のコードを表示)</option>'
    + '<option value="ic1">InstaChord Lv.1(初心者向け)</option>'
    + '<option value="ic2" selected>InstaChord Lv.2(標準)</option>'
    + '<option value="ic3">InstaChord Lv.3(省略無し)</option>'
    + '<option value="15ichie">一五一会</option>'
    + '<option value="15ichie_a">一五一会(アラビア数字)</option>'
    + '</select>'
    + '</label>'
    + ' '
    + '<label style = "display: inline-block;">Key:'
    + '<select class="selectedkey" name="selectedkey">'
    + '<option value=-1>Auto(推奨)</option>'
    + '<option value=0>C/Am</option>'
    + '<option value=1>Db/Bbm</option>'
    + '<option value=2>D/Bm</option>'
    + '<option value=3>Eb/Cm</option>'
    + '<option value=4>E/C#m</option>'
    + '<option value=5>F/Dm</option>'
    + '<option value=6>F#/D#m</option>'
    + '<option value=7>G/Em</option>'
    + '<option value=8>Ab/Fm</option>'
    + '<option value=9>A/F#m</option>'
    + '<option value=10>Bb/Gm</option>'
    + '<option value=11>B/G#m</option>'
    + '</select>'
    + '</label>'
    + ' '
    + '<label style = "display: inline-block;">Disp:'
    + '<select class="minormode" name="minormode">'
    + '<option id="majorlabel" value=0></option>'
    + '<option id="minorlabel" value=1></option>'
    + '</select>'
    + '</label>'
    + '<div id="toicnmessage">'
    + '</div>'
    + '</div>';

  if(webSiteName == "ufret"){
    let e = document.getElementById('my-chord-data');
    if(e){e.insertAdjacentHTML('beforebegin', barText);}
    else{document.getElementById('guitar_keep').insertAdjacentHTML('afterend', barText);}
  }
  if(webSiteName == "chordwiki"){(document.getElementsByClassName('subtitle'))[0].insertAdjacentHTML('afterend', barText);}
  if(webSiteName == "gakki.me"){document.querySelector(".music_func,.fumen_func").insertAdjacentHTML('afterend', barText);}
  if(webSiteName == "j-total"){document.body.insertAdjacentHTML('afterbegin', barText);}
};

// Webサイトからキーやコードを読み取り、それをもとに演奏用キーや原曲キーを推定しそれらを返す関数
exports.readKeyChords = function(webSiteName){
  let keyElm;
  let keyChordElms;
  if(webSiteName == "ufret"){keyChordElms = Array.prototype.slice.bind(document.getElementsByTagName("rt"))().map((e => e.firstChild));}
  if(webSiteName == "chordwiki"){
    keyChordElms = Array.prototype.slice.bind(document.querySelectorAll('.chord, .key'))().map((e => e.firstChild));
    keyElm = document.getElementsByClassName('key')[0];
  }
  if(webSiteName == "gakki.me"){
    let elms = Array.prototype.slice.bind(document.querySelectorAll(".cd_fontpos, .cd_font"))();
    keyChordElms = elms.map((e) => {
      if(e.firstChild){
        if(e.firstChild.nodeType == Node.TEXT_NODE){
          return e.firstChild;
        }else if(e.firstChild.nextSibling && e.firstChild.nextSibling.nodeType == Node.TEXT_NODE){
          return e.firstChild.nextSibling;
        }
      }
      return null;
    }).filter((e) => e != null);
    // for コード名表示
    keyChordElms = keyChordElms.concat(Array.prototype.slice.bind(document.getElementById("chord_area").getElementsByTagName("u"))().map((e => e.firstChild)));
  }
  if(webSiteName == "j-total"){
    keyChordElms = Array.prototype.slice.bind(document.querySelectorAll("tt a"))().map((e => e.firstChild));
    try{
      keyElm = document.getElementsByClassName("box2")[0].getElementsByTagName("h3")[0];
    }catch(e){}
    if(!keyElm){ // 古いスタイルのHTMLに対応するため
      keyElm = document.querySelectorAll("tr td font")[5];
    }
  }
  let keyChords = keyChordElms?(keyChordElms.map((e) => {
    if(e){
      if(e.parentNode.classList.contains("key")){
        return {type: "key",v: e.nodeValue, elm: e};
      }
      return {type: "chord",v: e.nodeValue, elm: e}
    }else{
      return null;
    }
  }).filter((e) => e != null)):null;
  //書かれているキーを読み取り
  let keyMatch = keyElm?keyElm.firstChild.nodeValue.match(/(: |：)([A-G](#|b){0,1}m{0,1})$/):null;
  let detectedKey = new exports.Key(keyMatch?keyMatch[2]:"",true);
  let originalKey = new exports.Key();
  let capo = 0;

  // キーが書かれていないときは、キーを自動判定する
  if(detectedKey.keyNo == -1){
    detectedKey = exports.autoDetectKey(keyChords);
  }

  // 原曲のキーを取得する
  if(webSiteName == "ufret"){
    capo = - Number(document.getElementsByName("keyselect")[0].value);
    originalKey = new exports.Key(scale[(detectedKey.keyNo + capo +12)%12]);
  }
  if(webSiteName =="chordwiki"){
    originalKey = detectedKey;
  }
  if(webSiteName == "gakki.me"){
    try{
      let capoElm = document.getElementsByClassName("gakufu_btn_capo")[0].childNodes[1];
      let capoMatch = capoElm?capoElm.firstChild.nodeValue.match(/^capo (.*)/):null;
      capo = Number(capoMatch[1]);
      originalKey = new exports.Key(scale[(detectedKey.keyNo + capo +12)%12]);
    }catch(e){
      originalKey = detectedKey;
    }
  }
  if(webSiteName == "j-total"){
    let originalKeyMatch = keyElm?keyElm.firstChild.nodeValue.match(/^Original Key：(.*) \/ Capo：(.*) \/ /):null;
    originalKey = new exports.Key(originalKeyMatch[1],true);
    capo = Number(originalKeyMatch[2]);
  }

  return {keyChords: keyChords, detectedKey:detectedKey, originalKey:originalKey, capo: capo};
};

// 読み取られたchordからキーを自動で判定する関数
exports.autoDetectKey = function(keyChords){
  let maxCount = 0;
  let chords = keyChords?(keyChords.map((e) => (e.type == "chord")?e:null)):null;
  scale.forEach((s) => {
    let tmpKey = new exports.Key(s);
    let notSwapCodesCount = chords.slice(0,30).map((s) => exports.toICN(s.v,{key:tmpKey, minorMode:false, mode:"ic2"})).filter((s) => !(/dim|m7-5|aug/).test(s)).filter((s) => /^([123456][^#~]*$|3~[^#]*$)/.test(s)).length;
    if(notSwapCodesCount > maxCount){
      maxCount = notSwapCodesCount;
      detectedKey = tmpKey;
    }
  });
  return detectedKey;
};

exports.parseChord = function(raw){
  let m = raw.replace("on","/").match(/^([A-G](#|b|＃|♯|♭){0,1})([^/]*)(\/{0,1})(.*)/);
  if(m){
    let base = sharpify(m[1]);
    let q = m[3];
    let onChord = sharpify(m[5]);
    let noIndex = scale.indexOf(base);
    let onChordNoIndex = -1;
    if(onChord!=""){
      onChordNoIndex = scale.indexOf(onChord);
    }
    // 9を7(9), maj7をM7等表記を置き換える
    q = q.replace(/^maj$/,"").replace(/^min$/,"m").replace(/^maj7$/,"M7").replace(/^maj9$/,"M9").replace(/^m7b5|m7\(-5\)|m7\(b5\)$/,"m7-5").replace(/^m9$/,"m7(9)").replace(/^9$/,"7(9)");
    return new exports.Chord(noIndex, onChordNoIndex, q);
  }
  return null;
};

// 渡されたchordを元にICNを返す関数
exports.toICN = function(raw, settings){
  let s = "";
  let chord = exports.parseChord(raw);
  if(chord){
    let swapped = false;
    let isQAvailable = false;
    let unSupported = false;
    //スワップキーかどうかを判定
    if((!settings.minorMode && "1m,2,3,4m,5m,6,7,1#m,2#m,4#m,5#m,6#m".split(",").includes(chord.no(settings)+(chord.isMinor?"m":"")))||
    (settings.minorMode && "1,2,3m,4,5m,6m,7m,1#m,3#m,4#m,6#m,7#m".split(",").includes(chord.no(settings)+(chord.isMinor?"m":"")))){
      swapped = true;
    }
    let q = chord.q;
    // level 2以下のときは、インスタコードで弾けるキーに置き換える
    if("ic1,ic2".split(",").includes(settings.mode)){q = q.replace(/^add9$/,"9").replace(/^7sus4$/,"sus4").replace(/^dim7$/,"dim").replace(/^7\(9\)$/,"7").replace(/^M9$/,"M7").replace(/^m7\(9\)$/,"m7");}
    // 処理しやすいようにマイナー記号を消す(m7-5 は例外）
    if(q[0] == "m" && q != "m7-5"){q = q.replace(/^m/,"")}

    // Level 1のときは、7・M7・9・6を表示しない
    if("7,M7,9,add9,6".split(",").includes(q)){
      if("ic2,ic3".split(",").includes(settings.mode)){
        isQAvailable = true;
      }
    }
    //sus4,aug,dim,m7-5の場合はスワップさせない
    else if("sus4,7sus4,aug,dim,dim7,m7-5".split(",").includes(q)){
      isQAvailable = true;
      swapped = false;
    }
    //サポートされていない記号である場合の処理（レベル3のときのみ表示）
    else{
      if(q.length>0 && settings.mode == "ic3"){
        unSupported = true;
      }
    }
    s = chord.no(settings)+(swapped?"~":"")+
      (unSupported?"["+q+"]":(isQAvailable?"["+q+"]":""))+
      ((chord.onChordNo(settings)!=""&&"ic3".split(",").includes(settings.mode))?"/"+chord.onChordNo(settings):"");
  }
  return s;
};

exports.to15ichie = function(raw, settings){
  let s = null;
  let chord = exports.parseChord(raw);
  
  if(chord){
    chord.q = chord.q.replace(/^add9$/,"9").replace(/^7sus4$/,"sus4").replace(/^dim7$/,"dim").replace(/^7\(9\)$/,"7").replace(/^m7\(9\)$/,"m7");
    if("aug" == chord.q){
      s = chord.no(settings) + "+";
    }
    else if("dim,dim7,m7-5".split(",").includes(chord.q)){
      s = chord.no(settings) + "-";
    }
    else{
      s = chord.no(settings);
    }

    if(settings.mode == "15ichie"){
      s = convertToKanji(s);
    }
  }
  return s;
};


// chordを書き換える関数
exports.updateChords = function(keyChords, settings){
  let previousKey = new exports.Key(); 
  let currentSettings = {...settings};
  keyChords.forEach((e) => {
    if(e.type == "key"){
      // 転調の場合
      if(currentSettings.isAutoKeyDetection){
        let tmpKeyMatch = e.v.match(/(: |：)([A-G](#|b){0,1}m{0,1})$/);
        currentSettings.key = new exports.Key(tmpKeyMatch?tmpKeyMatch[2]:"", true);
        if(previousKey.keyNo != -1){
          let keyModulationDegree = currentSettings.key.keyNo - previousKey.keyNo;
          if(keyModulationDegree >= 7){keyModulationDegree -= 12;}
          else if(keyModulationDegree <= -6){keyModulationDegree += 12;}
          e.elm.nodeValue = "Key: " + currentSettings.key.key +" ("+(keyModulationDegree>0?"+":"")+keyModulationDegree+")";
        }
        previousKey = currentSettings.key;
      }
    }
    else{
      //chordの色を解除する。test.js対策のためtry-catch
      try{e.elm.parentNode.classList.remove("sharpswap", "sharp", "swap", "notsharpswap", "bluechord", "notbluechord");} catch(error){}
      //offモードが選択されている場合
      if(settings.mode == "off"){
        e.elm.nodeValue = e.v;
      }
      // インスタコードモードが選択されている場合
      else if("ic1,ic2,ic3".split(",").includes(settings.mode)){
        let icn = exports.toICN(e.v,currentSettings);
        let isSharp = false;
        let isSwap = false;
        let isBlueChord = false;
        //シャープ、スワップ、特定のセブンスコード等の条件を満たすかどうかを調べる
        if(icn!=""){
          e.elm.nodeValue = icn;
          if(icn.match(/^([1-7])(#{0,1})(~{0,1})/)[2] == "#"){isSharp = true;}
          if(icn.match(/^([1-7])(#{0,1})(~{0,1})/)[3] == "~"){isSwap = true;}
          if(/\[7\]|\[M7\]|\[m7\-5\]|\[sus4\]|\[aug\]|\[dim\]$/.test(icn))isBlueChord = true;
          if(!currentSettings.minorMode && (/^(1|4).*\[M7\]$/.test(icn) || /^(2|3|5|6).*\[7\]$/.test(icn) || /^7.*\[m7-5\]$/.test(icn)))isBlueChord = false;
          if(currentSettings.minorMode && (/^(3|6).*\[M7\]$/.test(icn) || /^(1|4|5|7).*\[7\]$/.test(icn) || /^2.*\[m7-5\]$/.test(icn)))isBlueChord = false;
        }
        //chordに色を付ける
        if(isSharp&&isSwap){e.elm.parentNode.classList.add("sharpswap");}
        else if(isSharp&&!isSwap){e.elm.parentNode.classList.add("sharp");}
        else if(!isSharp&&isSwap){e.elm.parentNode.classList.add("swap");}
        else{e.elm.parentNode.classList.add("notsharpswap");}
        if(isBlueChord){e.elm.parentNode.classList.add("bluechord");}
        else{e.elm.parentNode.classList.add("notbluechord");}  
      }
      else if("15ichie,15ichie_a".split(",").includes(settings.mode)){
        let ichigo = exports.to15ichie(e.v,currentSettings);
        if(ichigo != null){
          e.elm.nodeValue = ichigo;
        }
      }
    }
  });
};

// 設定されている情報を読み取り、それをもとにページの一部を書き換えてupdateChordsを実行する関数
exports.updateSettings = function(rawKeyChords){
  let settings = {
    key: null,
    isAutoKeyDetection: true,
    mode: "ic2",
    minorMode: false,
  };
  settings.mode = document.querySelector('.selectedmode').value;
  settings.isAutoKeyDetection = document.querySelector('.selectedkey').value == -1;
  settings.minorMode = document.querySelector('.minormode').value == 1;

  if(settings.mode == "off"){
    document.getElementsByClassName("selectedkey")[0].disabled = true;
    document.getElementsByClassName("minormode")[0].disabled = true;
  }
  // インスタコードモードが選択されている場合
  else if("ic1,ic2,ic3".split(",").includes(settings.mode)){
    document.getElementsByClassName("selectedkey")[0].disabled = false;
    document.getElementsByClassName("minormode")[0].disabled = false;

  }
  else if("15ichie,15ichie_a".split(",").includes(settings.mode)){
    document.getElementsByClassName("selectedkey")[0].disabled = false;
    document.getElementsByClassName("minormode")[0].disabled = true;
    document.getElementsByClassName("minormode")[0].value = 0;
  }


  if(settings.isAutoKeyDetection){
    settings.key = rawKeyChords.detectedKey;
    document.getElementById('toicnmessage').innerText = "";
    document.getElementById('majorlabel').innerText =  "1=" + rawKeyChords.originalKey.majorScaleName + "(maj)";
    document.getElementById('minorlabel').innerText =  "1=" + rawKeyChords.originalKey.minorScaleName + "(min)";
  }
  else{
    settings.key = new exports.Key(scale[(Number(document.querySelector('.selectedkey').value) - rawKeyChords.capo+12)%12]);
    document.getElementById('toicnmessage').innerText = "toICNのキー変更機能は、キーが正しく認識されなかったときなどに使用するためのものです。\n演奏するキーを変えたい場合は、インスタコード本体のキー設定かカポ機能を利用してください。";
    document.getElementById('majorlabel').innerText =  "1=" + settings.key.majorScaleName + "(maj)";
    document.getElementById('minorlabel').innerText =  "1=" + settings.key.minorScaleName + "(min)";  
  }

  document.getElementById('displayedkey').innerText = "Original Key: " + rawKeyChords.originalKey.key;

  exports.updateChords(rawKeyChords.keyChords, settings);
};

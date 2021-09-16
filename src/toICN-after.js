let isAutoKeyDetection = true;
let isKeyWritten = false;
let detectedKey;
let keyChords;
let isAutoDetected = false;

function main () {
  let key;
  let level = 2;
  //ChordやKeyを読む
  let rawKeyChords = exports.readKeyChords(webSiteName);
  keyChords = rawKeyChords.keyChords;
  detectedKey = rawKeyChords.key;

  // キーが書かれていないときは、キーを自動判定する
  if(detectedKey.keyNo == -1){
    detectedKey = exports.autoDetectKey(keyChords);

    isAutoDetected = true;
  }

  // キーの手動設定

  //表示書き換え関係

  key = detectedKey;
  
  exports.updateChords(keyChords, key, isAutoKeyDetection, level);
  document.getElementById('displayedkey').innerText = "Original Key: " + detectedKey.key;

  document.querySelector('.selectedkey').addEventListener('change', (event) => {
    if(event.target.value == -1){ //Auto
      key = detectedKey;
      isAutoKeyDetection = true;
      document.getElementById('displayedkey').innerText = "Original Key: " + key.key;
      document.getElementById('toicnmessage').innerText = "";
    }
    else{
      key = new exports.Key(scale[event.target.value]);
      isAutoKeyDetection = tfalse;
      document.getElementById('displayedkey').innerText = "Key: " + key.key + " (selected)";
      document.getElementById('toicnmessage').innerText = "toICNのキー変更機能は、キーが正しく認識されなかったときなどに使用するためのものです。\n演奏するキーを変えたい場合は、インスタコード本体のキー設定かカポ機能を利用してください。";
    }
    exports.updateChords(keyChords, key, isAutoKeyDetection, level);
  });
  document.querySelector('.selectedlevel').addEventListener('change', (event) => {
    level = event.target.value;
    exports.updateChords(keyChords, key, isAutoKeyDetection, level);
  });
};

function waitElement(webSiteName, cb) {
  let selector;
  if (webSiteName === "ufret") {
    selector = 'ruby rt';
  }
  if (!selector) return cb();

  const timer = setInterval(function () {
    const resolve = function () {
      clearInterval(timer);
      cb();
    };
    if (!!document.querySelector(selector)) resolve();
  }, 300);
}

let barText = 
'<div class="toicnbar" style="background-color: #f4ffa2; margin: 5px auto; padding: .75rem 1.25rem;">'
+ '<div id="displayedkey" style="font-weight: bold; font-size: 150%; color: #1a4a9c">'
+ '</div>'
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
+ '<label style = "display: inline-block;">Level:'
+ '<select class="selectedlevel" name="selectedlevel">'
+ '<option value=1>1(初心者向け)</option>'
+ '<option value=2 selected>2(標準)</option>'
+ '<option value=3>3(オンコード対応)</option>'
+ '<option value=4>4(上級者向け)</option>'
+ '</select>'
+ '</label>'
+ '<div id="toicnmessage">'
+ '</div>'
+ '</div>';

if(webSiteName == "ufret"){
  let e = document.getElementById('my-chord-data');
  if(e){e.insertAdjacentHTML('beforebegin', barText);}
  else{document.getElementsByClassName('row')[6].insertAdjacentHTML('afterend', barText);}
}
if(webSiteName == "chordwiki"){(document.getElementsByClassName('subtitle'))[0].insertAdjacentHTML('afterend', barText);}
if(webSiteName == "gakki.me"){document.getElementsByClassName("music_func")[0].insertAdjacentHTML('afterend', barText);}
if(webSiteName == "j-total"){document.body.insertAdjacentHTML('afterbegin', barText);}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  waitElement(webSiteName, main);
} else {
  document.addEventListener('DOMContentLoaded', function () {waitElement(webSiteName, main)});
}

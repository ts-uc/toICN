cat << EOS
# これは何？

[ChordWiki](https://ja.chordwiki.org/)と[U-FRET](https://www.ufret.jp/)のコード譜の表示をInstaChord（インスタコード）での演奏に適した表記法である[ICN](http://instachord.com/instruction/icn/) (InstaChord Number) に変換するブックマークレットです。

- [InstaChord(インスタコード)の購入はこちら](https://c.affitch.com?ref=QEP6CNKKRACV)
  - アフィリエイトコードが入っています。そういうのが嫌な方は直接検索してください。
  - インスタコードは代理店を持たず[「紹介パートナー制度」](https://instachord.com/overview/d2c/)を採用しています。

# 使い方

下記をブックマークとして登録してください。

\`\`\`
EOS

cat toICN.js

cat << EOS

\`\`\`

ChordWikiかU-FRETで目的の曲を表示した状態で、登録したブックマークをクリックすると、コード表記がICNに変換されます。

ChordWikiにてKeyが明示されている場合はそれに従い、それ以外はキーを自動判別します。（間違うこともあります）

# 既知のバグ

- https://github.com/inajob/toICN/issues に随時起票しています。（コメント、PR募集してます！）

# 仕様

- ICN、およびこのブックマークレットの仕様については[こちらをご覧ください](/specification.md)。

# 開発方法

- toICN-before.js
- toICN-core.js
- toICN-after.js

を編集してください。

後工程で各行を連結するので行末にセミコロンを必ずつけてください。

\`node test.js\` でテストを実行できます。

編集が終わったら\`gen.sh\`を実行してください。下記ファイルが自動生成されます。

- toICN.js
- REAMDE.md

EOS

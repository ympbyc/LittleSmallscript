Little Smallscript
==================
jsを楽に書きたい。   
Little Smalltalk楽しい。   
というわけでLittle Smalltalk -> Javascriptコンパイラ作る。   
Little Smalltalkの処理系が手に入らなかったので本を見ながら作る。   

基本方針:
---------
* 最初は基本型はjsの基本型のみをサポートする。(ListやらBagやらは作らない)
* 出発点がjsの作成支援なので、最初のバージョンは最適化等は考えず、単純な翻訳機に徹する。
  * function () {} が [] になるだけでも相当恩恵はある。
* メッセージ式はそのままjsのメソッド呼び出しに変換する。
  * 参照: https://gist.github.com/3654115
  * オブジェクトobjへの単項メッセージobj unaryはobj.unary()、キーワード引数obj keyword: 1 keyword2: 2はobj.keyword1_keyword2(1, 2)、二項メッセージは後回し
  * このときunaryやkeyword1_keyword2はjsでobjのコンストラクタのprototypeに定義することとする。
  * 予約語やメソッド名に使えない記号のときは他の名前に変換できる仕組みを用意する。　(辞書?)

目標:
---------
from.stをto.jsにコンパイルできるようにする。   
to.jsはCoffeeScriptが吐き出すコードを真似たい。
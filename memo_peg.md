PEG 
=====

参照
-----
http://www.konokida.com/orengo/01.ParsingExpressionGrammar/index.html
http://d.hatena.ne.jp/kmizushima/20100203/1265183754
http://d.hatena.ne.jp/ku-ma-me/20070906/p1
http://code.google.com/p/dupsrem/source/browse/trunk/dupes/chrome/content/removedupes/kouprey.js?r=15
http://practical-scheme.net/wiliki/wiliki.cgi?Rui%3AParsingExpressionGrammar

parsing expression
-----
入力に対してパーサを次々に試していき、成功したらマッチした部分を消費し、失敗したらバックトラックを行う(失敗したパーサ試行前まで戻る)。

連接 a b
全て読み込むかまったく読み込まず死。

選択 a / b
aに失敗したらbを検査。どちらかが読み込めればOK
(a失敗時にはバックトラックされる.)

繰り返し a*
aの0回以上の繰り返し. 配列が返る。

1回以上の繰り返し a+
aa*のシンタックスシュガー

先読みAnd &a
入力がaにマッチするか検査して、マッチしたら成功。ただし入力を消費しない。
失敗したら死

先読みNot !a
Andの否定

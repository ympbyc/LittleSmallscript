| BlockParser MyParser mp |
BlockParser := <require('./blockparser')> dot: #BlockParser
.
MyParser := BlockParser subclass
.
MyParser dot:#init method:[:input|
  @input := input.
  @cache := #{}
]
.
MyParser dot:#toJS method:[
  [self try_: #(
    @block
  )] tryCatch: [:err| | line rest token |
    console log: @maxIndex.
    [line := ((@input sub:0 string:@maxIndex) match:</\n/g>) size + 1]
    tryCatch: [line := 0].
    rest := @input substring:@maxIndex.
    token := rest sub:0 string:(rest search:</[\.\s\t\n]|$/>).
    console log: 'Parse error on line '+line+'. Unexpected '+token+'.'
  ]
]
.

mp := MyParser new: '[:a :baa | #(1 2 #aaa #(3))]'
.
mp p: mp toJS

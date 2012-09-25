| LittleParser BlockParser Expression MyParser mp |
LittleParser := <require('./littleparser')> dot: #LittleParser
.
BlockParser := <require('./blockparser')> dot: #BlockParser
.
Expression := <require('./expression')> dot: #Expression
.
MyParser := LittleParser subclass
.
BlockParser@prototype do:[:item:key|
  MyParser@prototype at:key put:item
]
.
Expression@prototype do:[:item:key|
  MyParser@prototype at:key put:item
]
.
MyParser dot:#init method:[:input|
  @input := input.
  @cache := #{}
]
.
MyParser dot:#onError method:[:err| | line rest token |
  console log: @maxIndex.
  [line := ((@input sub:0 string:@maxIndex) match:</\n/g>) size + 1]
  tryCatch: [line := 0].
  rest := @input substring:@maxIndex.
  token := rest sub:0 string:(rest search:</[\.\s\t\n]|$/>).
  console log: 'Parse error on line '+line+'. Unexpected '+token+'.'
]
.
MyParser dot:#toJS method:[
  [self try_: #(
    @expression
  )] tryCatch: [self onError].
  @index < @input@length ifTrue: [@onError value: #{}]
]
.

mp := MyParser new: 'Object new ; at:#a put:1'
.
mp p: mp toJS

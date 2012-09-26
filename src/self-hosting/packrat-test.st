| LittleParser BlockParser Expression Statement MyParser mp |
LittleParser := <require('./littleparser')> dot: #LittleParser
.
BlockParser := <require('./blockparser')> dot: #BlockParser
.
Expression := <require('./expression')> dot: #Expression
.
Statement := <require('./statement')> dot: #Statement
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
Statement@prototype do:[:item:key|
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
MyParser dot:#toJS method:[| ret |
  ret := [self try_: #(
    @statement
  )] tryCatch: [self onError].
  @index < @input@length ifTrue: [@onError value: #{}].
  ret
]
.

mp := MyParser new: '| foo bar | foo := 1. bar.'
.
console log: mp toJS

| Packrat LittleParser BlockParser Expression Statement LittleSmallscript mp |
Packrat := <require('./packrat')> dot: #Packrat
.
LittleParser := <require('./littleparser')> dot: #LittleParser
.
BlockParser := <require('./blockparser')> dot: #BlockParser
.
Expression := <require('./expression')> dot: #Expression
.
Statement := <require('./statement')> dot: #Statement
.
LittleSmallscript := Packrat subclass
.
LittleParser@prototype do:[:item:key|
  LittleSmallscript@prototype at:key put:item
]
.
BlockParser@prototype do:[:item:key|
  LittleSmallscript@prototype at:key put:item
]
.
Expression@prototype do:[:item:key|
  LittleSmallscript@prototype at:key put:item
]
.
Statement@prototype do:[:item:key|
  LittleSmallscript@prototype at:key put:item
]
.
LittleSmallscript dot:#init method:[:input|
  @input := input.
  @index := 0.
  @cache := #{}
]
.
LittleSmallscript dot:#onError method:[:err| | line rest token |
  console log: @maxIndex.
  [line := ((@input sub:0 string:@maxIndex) match:</\n/g>) size + 1]
  tryCatch: [line := 0].
  rest := @input substring:@maxIndex.
  token := rest sub:0 string:(rest search:</[\.\s\t\n]|$/>).
  console log: 'Parse error on line '+line+'. Unexpected '+token+'.'
]
.
LittleSmallscript dot:#toJS method:[| wrapTmpl js beautifyOption |
  wrapTmpl := '(function () { \"use strict\"; %statement% }).call(this)'.
  [
    js := self template: wrapTmpl apply: #{#statement: self statement}
  ] tryCatch: [self onError].
  @index < @input@length ifTrue: [@onError value: #{}].
  
  beautifyOption := #{
    #indent_size: 2
    #indent_char: ' '
    #jslint_happy: true
  }.
  <require('../../lib/beautify.js')> js_: js beautify: beautifyOption 
]
.

mp := LittleSmallscript new: 'foo at: #hoge put: 1'
.
console log: mp toJS

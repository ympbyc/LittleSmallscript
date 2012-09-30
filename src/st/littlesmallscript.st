| Packrat LittleParser BlockParser Expression Statement Class LittleSmallscript mp |
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
Class := <require('./class')> dot: #Class
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
Class@prototype do:[:item:key|
  LittleSmallscript@prototype at:key put:item
]
.
LittleSmallscript dot:#init method:[:input :options|
  @input := input.
  @index := 0.
  @cache := #{}.
  @options := options.
  @instanceVariables := #{}.
  @currentClass := null
]
.
LittleSmallscript dot:#onError method:[:err| | line rest token |
  [line := ((@input sub:0 string:@maxIndex) match:</\n/g>) size + 1]
  tryCatch: [line := 0].
  rest := @input substring:@maxIndex.
  token := rest sub:0 string:(rest search:</[\.\s\t\n]|$/>).
  console log: 'Parse error on line '+line+'. Unexpected '+token+'.'.
  console log: '===================================================='
  "console log: (@stackTrace)"
]
.
LittleSmallscript dot:#toJS method:[| wrapTmpl js beautifyOption |
  wrapTmpl := '(function () { \"use strict\"; %statement% }).call(this);'.
  [
    js := self template: wrapTmpl apply: #{#statement: self statement}
  ] tryCatch: [self onError].
  @index < @input@length ifTrue: [@onError value: #{}].
  
  beautifyOption := #{
    #indent_size: 2
    #indent_char: ' '
    #jslint_happy: true
  }.
  @options && @options@prettyprint ifTrue: [
    <require('../../lib/beautify.js')> js_: js beautify: beautifyOption
  ] ifFalse: [js]
]
.
exports@LittleSmallscript := LittleSmallscript
.
LittleSmallscript
| Packrat LittleParser BlockParser Expression Statement Class LittleSmallscript mp |
Packrat := <require('./packrat')> at: #Packrat
.
LittleParser := <require('./littleparser')> at: #LittleParser
.
BlockParser := <require('./blockparser')> at: #BlockParser
.
Expression := <require('./expression')> at: #Expression
.
Statement := <require('./statement')> at: #Statement
.
Class := <require('./class')> dot: #Class
.
Packrat 
  subclass:#LittleSmallscript
  variables:#(
    #input
    #index
    #maxIndex
    #options
    #stackTrace
)
.
(LittleParser at:#prototype) do:[:item:key|
  (LittleSmallscript at:#prototype) at:key put:item
].
(BlockParser at:#prototype) do:[:item:key|
  (LittleSmallscript at:#prototype) at:key put:item
].
(Expression at:#prototype) do:[:item:key|
  (LittleSmallscript at:#prototype) at:key put:item
].
(Statement at:#prototype) do:[:item:key|
  (LittleSmallscript at:#prototype) at:key put:item
].
(Class at:#prototype) do:[:item:key|
  (LittleSmallscript at:#prototype) at:key put:item
].
!LittleSmallscript
initWithInput:text andOptions:opt
  input := text.
  index := 0.
  cache := #{}.
  options := opt.
  instanceVariables := #{}.
  currentClass := null
!.
!LittleSmallscript
onError:err | line rest token |
  [line := ((input sub:0 string:maxIndex) match:</\n/g>) size + 1]
  tryCatch: [line := 0].
  rest := input substring:maxIndex.
  token := rest sub:0 string:(rest search:</[\.\s\t\n]|$/>).
  console log: 'Parse error on line '+line+'. Unexpected '+token+'.'.
  console log: '===================================================='
  "console log: (stackTrace)"
!.
!LittleSmallscript
toJS | wrapTmpl js beautifyOption |
  wrapTmpl := '(function () { \"use strict\"; %statement% }).call(this);'.
  [
    js := self template: wrapTmpl apply: #{#statement: self statement}
  ] tryCatch: [self onError].
  index < input size ifTrue: [self onError: #{}].
  
  beautifyOption := #{
    #indent_size: 2
    #indent_char: ' '
    #jslint_happy: true
  }.
  options && (options at:#prettyprint) ifTrue: [
    <require('../../lib/beautify.js')> js_: js beautify: beautifyOption
  ] ifFalse: [js]
!.
exports at:#LittleSmallscript put:LittleSmallscript
.
LittleSmallscript
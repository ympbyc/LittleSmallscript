| Statement |
Statement := require value:'./statement'
.
Statement
  subclass:#LittleSmallscript
  variables:#(
    #input
    #options
    #beautifyOption
    #cache
  )
.
!LittleSmallscript
initWithInput:text andOptions:opt
  input := text.
  options := opt.
  cache := #{}.
  beautifyOption := #{
    #indent_size: 2
    #indent_char: ' '
    #jslint_happy: true
  }.
  self
!.
!LittleSmallscript
onError:err | line rest token |
  line := [((input sub:0 string:self getMaxIndex) match:</\n/g>) size + 1]
  tryCatch: [0].
  rest := input substring: self getMaxIndex.
  token := rest sub:0 string:(rest search:</[\.\s\t\n]|$/>).
  console log: 'Parse error on line '+line+'. Unexpected '+token+'.'.
  console log: '===================================================='.
  console log: self getStackTrace
!.
!LittleSmallscript
toJS | wrapTmpl js beautifyOption err |
  err := false.
  wrapTmpl := '(function () { \"use strict\"; %statement% }).call(this);'.
  [
    js := self template: wrapTmpl apply: #{#statement: self statement}
  ] tryCatch: [err := true. self onError].
  err ifFalse: [
    self getIndex < input size ifTrue: [err := true. self onError: null]
  ].
  err ifFalse:[
    options && (options at:#prettyprint) ifTrue: [
      (require value:'../../../lib/beautify.js') js_: js beautify: beautifyOption
    ] ifFalse: [js]
  ]
!.
module at:#exports put:LittleSmallscript
.
LittleSmallscript
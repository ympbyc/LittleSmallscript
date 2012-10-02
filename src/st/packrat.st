<require('../../littlesmallmethods')>
.
!Number
timesString: str | ret |
  ret := ''.
  self timesRepeat:[:i| ret += str].
  ret
!.
Object 
  subclass: #Packrat
  variables: #(
    #input
    #index
    #cache
    #maxIndex
    #logNest
    #stackTrace
  )
.
!Packrat
init: text
  input      := text.
  index      := 0.
  cache      := #{}.
  maxIndex   := 0.
  logNest    := -1.
  stackTrace := ''
!.
!Packrat
getIndex
  index
!.
!Packrat
getMaxIndex
  maxIndex
!.
!Packrat
getInputLength
  input size
!.
!Packrat
getStackTrace
  stackTrace
!.
!Packrat
cache: s aParser: fn | c slot logIndent |
  "Save results of parsing at the index for efficiency"
  fn := (fn !== undefined) ifTrue:[fn] ifFalse:[[]].
  c  := #{}.

  "debug feature"
  logNest += 1.
  logIndent := logNest timesString: '  '.
  stackTrace += (logIndent + 'ENTER : ' + s + ' : ' + (input substring: index) + '\n').
  
  [(cache at: s) === undefined ifTrue: (cache at: s put: #{})]tryCatch:[
    cache at: s put: #{}
  ].
  slot := (cache at: s) at: index.
  (slot !== undefined) && (slot !== null) ifTrue: [
    c := slot.
    index := c at: #idx.

    "debug feature"
    index > maxIndex ifTrue: [maxIndex := index]. "save max index for error message"
    stackTrace +=  (logIndent + 'CACHED: ' + s + ' : ' + (c at: #fn) + '\n').
    logNest -= 1.
    
    c at: #fn
  ] ifFalse: [
    [
      c at:#idx put:index.
      c at:#fn  put:(fn call: self).
      (cache at: s) at: (c at:#idx) put: #{#fn: c at:#fn, #idx: index}.
      
      "debug feature"
      index > maxIndex ifTrue: [maxIndex := index]. "save max index for error message"
      stackTrace += (logIndent + 'PASS  : ' + s + ' : ' + (c at:#fn) + '\n').
      logNest -= 1.

      c at:#fn
    ] tryCatch: [:err|
      (cache at: s) at: (c at:#idx) put: null.
      
      "debug feature"
      stackTrace +=  (logIndent + 'FAIL  : ' + s + '\n').
      logNest -= 1.
      
      self noParse
    ]
  ]
!.
!Packrat
noParse
  "throw an exception"
  self error: ('Parse error at:' + index)
!.
!Packrat 
try_: parsers | ret i |
  "OK if one of the parser matches. Returns the first match."
  i := index.
  parsers do: [:parser |
    ret === undefined ifTrue: [
      [ret := parser call: self] tryCatch: [ index := i ]]].
  ret !== undefined ifTrue: [ret] ifFalse: [self noParse]
!.
!Packrat 
sequence: parsers | ret i fail |
  "OK if all the parsers match in order."
  i := index.
  ret := ''.
  fail := false.
  parsers do: [:parser |
    fail ifFalse: [
      [
        ret += (parser call: self)
      ] tryCatch: [:err |
        index := i. "backtrack"
        fail := true.
        self noParse
      ]]].
  fail ifFalse: [ret] ifTrue: [self noParse]
!.
!Packrat
optional: parser | ret i |
  "Never fails. When not matched return an empty string."
  i := index.
  [ parser call: self ] tryCatch: [ index := i. null ]
!.
!Packrat
followedBy: parser | f i |
  "OK if the parser matches."
  f := true. i := index.
  [ parser call: self. f := false ] tryCatch: [].
  index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
!.
!Packrat
notFollowedBy: parser | f i |
  "OK if the parser does not match"
  f := false. i := index.
  [ parser call: self. f := true ] tryCatch: [].
  index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
!.
!Packrat
many: parser |a|
  "Repeat until the parser fails. Return an empty string if no-match"
  self try_: #(
    [ self many1: [parser call: self] ],
    ['']
  )
!.
!Packrat
many1: parser | v vs  |
  "Same as many butrequires one or more matches"
  v := parser call: self.
  vs := self many: [ parser call: self ].
  v + vs
!.
!Packrat
between: start and: end accept: inbetween | ret |
  "Match 'inbetween' wrapped with 'start' and 'end'"
  self sequence: #(
    start,
    [ret := self many: [
      self notFollowedBy: end.
      inbetween call: self
    ]],
    end
  ).
  ret
!.
!Packrat
anyChar | c |
  "Any character"
  c := input at: index.
  index += 1.
  c !== undefined ifTrue: [c] ifFalse: [self noParse]
!.
!Packrat 
satisfyChar: fn | c |
  "Character that satisfies the parser given"
  c := self anyChar.
  ((fn value: c) !== undefined) ifTrue: [c] ifFalse: [self noParse]
!.
!Packrat
chr: ch | c |
  "Matches the given character"
  c := self anyChar.
  c === ch ifTrue: [c] ifFalse: [self noParse]
!.
!Packrat
string: str
  "Matches the given string"
  (input sub: index string: (index + str size))
    === str ifTrue: [index += str size. str] ifFalse: [self noParse]
!.
!Packrat
regex: regex | rc match |
  "Matches the given regex"
  rc := regex exec: (input substring: index).
  (rc isKindOf: Array) ifTrue: [
    match := rc at: 0 .
    index += match size.
    match
  ] ifFalse: [
    console log: #regexFalse.
    self noParse: #regex
  ]
!.
!Packrat
toParser: str
  "Turn the string into parser"
  [self string: str]
!
.
!Packrat
p: s
  "p"
  console log: s.
  s
!.
exports at: #Packrat put: Packrat
.
Packrat

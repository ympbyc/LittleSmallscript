| Packrat |
<require('../littlesmallmethods')>
.
Number dot:#timesString method: [:str | | ret |
  ret := ''.
  self timesRepeat:[:i| ret += str].
  ret
]
.
Packrat := Object subclass
.
Packrat dot:#init method:[:input |
  @input := input.
  @index := 0.
  @cache := #{}.
  @maxIndex := 0.
  @logNest := -1
]
.
Packrat dot:#getIndex method:[
  @index
]
.
Packrat dot:#getInputLength method:[
  @input@length
]
.
"cache:parser:"
Packrat dot:#cacheparser method:[:s :fn| | c slot logIndent |
  fn := fn || [].
  c := #{}.
  
  "debug feature"
  @logNest += 1.
  logIndent := @logNest timesString: '  '.
  console log: logIndent + 'ENTER : ' + s + ' : ' + (@input substring: @index).
  
  [(@cache at: s) === undefined ifTrue: (@cache at: s put: #{})]tryCatch:[
    @cache at: s put: #{}
  ].
  slot := (@cache at: s) at: @index.
  (slot !== undefined) && (slot !== null) ifTrue: [
    c := slot.
    @index := c@idx.

    "debug feature"
    @index > @maxIndex ifTrue: [@maxIndex := @index]. "save max index for error message"
    console log: logIndent + 'CACHED: ' + s + ' : ' + c@fn.
    @logNest -= 1.
    
    c@fn
  ] ifFalse: [
    [
      c@idx := @index.
      c@fn := fn call: self.
      (@cache at: s) at: c@idx put: #{#fn: c@fn, #idx: @index}.
      
      "debug feature"
      @index > @maxIndex ifTrue: [@maxIndex := @index]. "save max index for error message"
      console log: logIndent + 'PASS  : ' + s + ' : ' + c@fn.
      @logNest -= 1.

      c@fn
    ] tryCatch: [:err|
      (@cache at: s) at: c@idx put: null.
      
      "debug feature"
      console log: logIndent + 'FAIL  : ' + s.
      @logNest -= 1.
      
      self noParse
    ]
  ]
]
.
Packrat dot:#noParse method:[
  self error: ('Parse error at:' + @index)
]
.
"one-of"
Packrat dot:#try_ method:[:parsers| | ret i |
  i := @index.
  parsers do: [:parser |
    ret === undefined ifTrue: [
      [ret := parser call: self] tryCatch: [ @index := i ]]].
  ret !== undefined ifTrue: [ret] ifFalse: [self noParse: #try_]
]
.
Packrat dot:#sequence method:[:parsers| | ret i fail |
  i := @index.
  ret := ''.
  fail := false.
  parsers do: [:parser |
    fail ifFalse: [
      [
        ret += (parser call: self)
      ] tryCatch: [:err |
        @index := i. "backtrack"
        fail := true.
        self noParse
      ]]].
  fail ifFalse: [ret] ifTrue: [self noParse]
]
.
Packrat dot:#optional method:[:parser | | ret i |
  i := @index.
  [ parser call: self ] tryCatch: [ @index := i. null ]
]
.
Packrat dot:#followedBy method:[:parser| | f i |
  f := true. i := @index.
  [ parser call: self. f := false ] tryCatch: [].
  @index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
]
.
Packrat dot:#notFollowedBy method:[:parser| | f i |
  f := false. i := @index.
  [ parser call: self. f := true ] tryCatch: [].
  @index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
]
.
Packrat dot:#many method:[:parser | |a|
  self try_: #(
    [ self many1: [parser call: self] ],
    ['']
  )
]
.
Packrat dot:#many1 method:[:parser | | v vs  |
  v := parser call: self.
  vs := self many: [ parser call: self ].
  v + vs
]
.
"between:and:accept"
Packrat dot:#betweenandaccept method:[:start :end :inbetween | | ret | 
  self sequence: #(
    start,
    [ret := self many: [
      self notFollowedBy: end.
      inbetween call: self
    ]],
    end
  ).
  ret
]
.
Packrat dot:#anyChar method:[| c |
  c := @input at: @index.
  @index += 1.
  c !== undefined ifTrue: [c] ifFalse: [self noParse]
]
.
Packrat dot:#satisfyChar method:[:fn | | c |
  c := self anyChar.
  ((fn value: c) !== undefined) ifTrue: [c] ifFalse: [self noParse]
]
.
Packrat dot:#chr method:[:ch | | c |
  c := self anyChar.
  c === ch ifTrue: [c] ifFalse: [self noParse]
]
.
Packrat dot:#string method:[:str |
  (@input sub: @index string: (@index+str@length))
    === str ifTrue: [@index += str@length. str] ifFalse: [self noParse]
]
.
Packrat dot:#regex method:[:regex| | rc match |
  rc := regex exec: (@input substring: @index).
  (rc isKindOf: Array) ifTrue: [
    match := rc at: 0 .
    @index += match size.
    match
  ] ifFalse: [
    console log: #regexFalse.
    self noParse: #regex
  ]
]
.
Packrat dot:#toParser method:[:str|
  [self string: str]
]
.
Packrat dot:#p method:[:s |
  console log: s.
  s
]
.
exports@Packrat := Packrat
.
Packrat

| Packrat |
<require('../littlesmallmethods')>
.
Packrat := Object subclass
.
Packrat@init := [:input |
  @input := input.
  @index := 0.
  @cache := #{}
]
.
"cache:parser:"
Packrat@cacheparser :=  [:s :fn| | c |
  fn := fn || [].
  c := #{}.
  ((@cache at: s) && ((@cache at: s) at: @index)) ifTrue: [
    c := (@cache at: s) at: @index.
    c idx ifTrue: [
      @index := c idx
    ] ifFalse: [self noParse]
  ] ifFalse: [
    [ 
      c.idx put: (@index).
      c.fn put: (fn call: self).
      (@cache at: s) at: @index put: #{#fn: c.fn, #idx: @index}.
      c.fn 
    ] tryCatch: [:err|
        (@cache at: s) at: @index put: null.
        self error: err
    ]
  ]
]
.
Packrat@noparse := [
  self error: ('Parse error at:' + @index)
]
.
"one-of"
Packrat@try_ := [:parsers| | ret i |
  i := @index.
  parsers do: [:parser |
    ret ifFalse: [
      [ret := parser call: self ] tryCatch: [ @index := i ]]].
  ret !== undefined ifTrue: [ret] ifFalse: [self noParse]
]
.
Packrat@sequence := [:parsers| | ret i fail |
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
Packrat@optional := [:parser | | ret i |
  i := @index.
  [ parser call: self ] tryCatch: [ @index := i. null ]
]
.
Packrat @followedBy := [:parser| | f i |
  f := true. i := @index.
  [ parser call: self. f := false ] tryCatch: [].
  @index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
]
.
Packrat@notFollowedBy := [:parser| | f i |
  f := false. i := @index.
  [ parser call: self. f := true ] tryCatch: [].
  @index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
]
.
Packrat@many := [:parser |
  (self.try) value: [ self many1: [parser call: self] ] value: ['']
]
.
Packrat@many1 := [:parser | | v vs  |
  v := parser call: self.
  vs := self many: [ parser call: self ].
  v + vs
]
.
"between:and:accept"
Packrat@betweenandaccept := [:start :end :inbetween | | ret | 
  self sequence: #(
    start
    [ret := self many: [| a|
      self notFollowedBy: end.
      a := inbetween call: self
    ]]
    end
  ).
  ret
]
.
Packrat@anyChar := [| c |
  c := @input at: @index.
  @index += 1.
  c ifTrue: [c] ifFalse: [self noParse]
]
.
Packrat@satisfyChar := [:fn | | c |
  c := self anuChar.
  fn value: c ifTrue: c ifFalse: [self noParse]
]
.
Packrat@chr := [:ch | | c |
  [ c := self anyChar.
    c === ch ifTrue: [c] ifFalse: [self noParse] ]
]
.
Packrat@string := [:str |
  [ (@input sub: @index string: (str.length))
    === str ifTrue: [str] ifFalse: [self noParse] ]
]
.
Packrat@regex := [:regex| | rc match |
  rc := regex exec: (@input substring: @index).
  rc notNil ifTrue: [
    match := rc at: 0.
    @index += match size.
    match
  ] ifFalse: [self noParse]
]
.
exports.Packrat := Packrat
.
Packrat

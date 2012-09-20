| Packrat |
Packrat := Object subclass
.
Packrat method: [:input |
  @input := input.
  @index := 0.
  @cache := #{}
] dot: #init
.
Packrat method: [
  self error: ('Parse error at:' + @index)
] dot: #noParse
.
Packrat method: [ | ret i |
  i := @index.
  arguments toArray do: [:parser |
    ret ifFalse: [
      [ ret := parser call: self ] tryCatch: [ @index := i ]]].
  ret !== undefined ifTrue: [ret] ifFalse: [self noParse]
] dot: #try_
.
Packrat method: [ | ret i fail |
  i := @index.
  ret := ''.
  fail := false.
  arguments toArray do: [:parser |
    fail ifFalse: [
      [
        ret += (parser call: self)
      ] tryCatch: [:err |
        @index := i. "backtrack"
        fail := true.
        self noParse
      ]]].
  fail ifFalse: [ret] ifTrue: [self noParse]
] dot: #sequence
.
Packrat method: [:parser | | ret i |
  i := @index.
  [ parser call: self ] tryCatch: [ @index := i. null ]
] dot: #optional
.
Packrat method: [:parser| | f i |
  f := true. i := @index.
  [ parser call: self. f := false ] tryCatch: [].
  @index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
] dot: #followedBy
.
Packrat method: [:parser| | f i |
  f := false. i := @index.
  [ parser call: self. f := true ] tryCatch: [].
  @index := i. "this method does not consume the input"
  f ifTrue: [self noParse] ifFalse: [null]
] dot: #notFollowedBy
.
Packrat method: [:parser |
  (self dot: try) value: [ self many1: [parser call: self] ] value: ['']
] dot: #many
.
Packrat method: [:parser | | v vs  |
  v := parser call: self.
  vs := self many: [ parser call: self ].
  v + vs
] dot: #many1
.
Packrat method: [| c |
  c := @input at: @index.
  @index += 1.
  c ifTrue: [c] ifFalse: [self noParse]
] dot: #anyChar
.
Packrat method: [:fn | | c |
  c := self anuChar.
  fn value: c ifTrue: c ifFalse: [self noParse]
] dot: #satisfyChar
.
Packrat method: [:ch | | c |
  [ c := self anyChar.
    c === ch ifTrue: [c] ifFalse: [self noParse] ]
] dot: #chr
.
Packrat method: [:str |
  [ (@input sub: @index string: (str dot: #length))
    === str ifTrue: [str] ifFalse: [self noParse] ]
] dot: #string
.
exports dot: #Packrat put: Packrat
.
Packrat

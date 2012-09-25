| Packrat LittleParser |
Packrat := <require('./packrat')> dot: #Packrat
.
LittleParser := Packrat subclass
.
LittleParser dot:#init method:[:input|
  @input := input.
  @cache := #{}
]
.
LittleParser dot:#space method:[
  self cache: #space parser: [
    self regex: (RegExp new: '^[\\s\\n\\t]+')
  ]
]
.
LittleParser dot:#blockStart method: [
  self cache: #blockStart parser: [self chr: '[']
]
.
LittleParser dot:#blockEnd method:[
  self cache: #blockEnd parser: [self chr: ']']
]
.
LittleParser dot:#verticalBar method:[
  self cache: #verticalBar parser: [self chr: '|']
]
.
LittleParser dot:#colon method:[
  self cache: #colon parser: [self chr: ':']
]
.
LittleParser dot:#semicolon method:[
  self cache: #semicolon parser: [self chr: ';']
]
.
LittleParser dot:#assignmentArrow method:[
  self cache: #assignmentArrow parser: [self string: ':=']
]
.
LittleParser dot:#apostrophe method:[
  self cache: #apostrophe parser: [self chr: <"'">]
]
.
LittleParser dot:#arrayStart method: [
  self cache: #arrayStart parser: [self string: '#(']
]
.
LittleParser dot:#closeParen method: [
  self cache: #closeParen parser: [self string: ')']
]
.
LittleParser dot:#variable method:[
  self cache: #variable parser: [
    self regex: (RegExp new: '^[a-zA-Z_$][a-zA-Z0-9_$]*')
  ]
]
.
LittleParser dot:#literal method:[
  self cache: #literal parser: [
    self try_: #(
      @numberLiteral,
      @stringLiteral,
      @symbolLiteral,
      @arrayLiteral
    )
  ]
]
.
LittleParser dot:#numberLiteral method:[
  self cache: #numberLiteral parser: [
    self regex: (RegExp new: '^-?[0-9]+(\\.?[0-9]+)?')
  ]
]
.
LittleParser dot:#stringLiteral method:[
  self cache: #stringLiteral parser: [
    '\"' + (self 
          between: @apostrophe
          and: @apostrophe 
          accept: @anyChar) + '\"'
  ]
]
.
LittleParser dot:#symbolLiteral method:[
  self cache: #symbolLiteral parser:[
    self chr: '#'.
    '\"' + self variable + '\"'
  ]
]
.
LittleParser dot:#arrayLiteral method:[|args|
  self cache:#arrayLiteral parser:[
    args := #().
    self arrayStart.
    self many: [
      args push: self literal.
      self skipSpace.
      self optional: [self chr: ','].
      self skipSpace
    ].
    self closeParen.
    '[' + (args join: ', ') + ']'
  ]
]
.
LittleParser dot:#skipSpace method:[
  self cache:#skipSpace parser:[
    self optional: @space
  ]
]
.
LittleParser dot:#expression method:[
  self cache:#expression parser:[
    self literal
  ]
]
.
LittleParser dot:#templateapply method:[:template :hashmap | | dest_str |
  dest_str := template.
  hashmap do: [:it :key |
    (it === null) || (it === undefined) ifTrue: [it := ''].
    dest_str := dest_str rep: (RegExp ne: '%'+key+'%' w: 'g') lace: it
  ].
  dest_str
]
.
exports@LittleParser := LittleParser
.
LittleParser
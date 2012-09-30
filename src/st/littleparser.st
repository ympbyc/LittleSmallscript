| Packrat LittleParser |
Packrat := <require('./packrat')> dot: #Packrat
.
LittleParser := Packrat subclass
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
  self cache: #assignmentArrow parser: [
    self try_: #(
      [self string: ':='],
      [self string: '<-']
    )
  ]
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
  self cache: #closeParen parser: [self chr: ')']
]
.
LittleParser dot:#hashStart method:[
  self cache:#hashStart parser:[self string: '#{']
]
.
LittleParser dot:#hashEnd method: [
  self cache: #hashEnd parser: [self chr: '}']
]
.
LittleParser dot:#exclamation method:[
  self cache:#exclamation parser:[self chr: '!']
]
.
LittleParser dot:#variable method:[
  self cache: #variable parser: [
    self regex: (RegExp new: '^[a-zA-Z_$][a-zA-Z0-9_$]*')
  ]
]
.
LittleParser dot:#extendedVariable method:[
  self cache: #extendedVariable parser:[| v |
    v := self regex: (RegExp new: '^[a-zA-Z_$][a-zA-Z0-9_$]*').
    v === 'self' ifTrue: ['_this']
    ifFalse: [
      "if it is instance variable, prefix it with 'this'"
      (self instanceVariableP: v) ifTrue: [v := '_this.'+v]. 
      v
    ]
  ]
]
.
LittleParser dot:#keywordSelector method:[
  self cache:#keywordSelector parser:[
    self sequence: #(@variable, @colon)
  ]
]
.
LittleParser dot:#unarySelector method:[
  self cache:#unarySelector parser:[| sel |
    sel := self sequence: #(@variable).
    self notFollowedBy: @colon.
    sel
  ]
]
.
LittleParser dot:#explicitReturn method:[
  self cache:#explicitReturn parser:[
    self chr: '^'
  ]
]
.
LittleParser dot:#commentQuote method:[
  self cache: #commentQuote parser:[
    self chr: '\"'
  ]
]
.
LittleParser dot:#skipSpace method:[
  self cache:#skipSpace parser:[
    self optional: @space.
    self many: [
      self between: @commentQuote and: @commentQuote accept: @anyChar.
      self optional: @space
    ]
  ]
]
.
LittleParser dot:#literal method:[
  self cache: #literal parser: [
    self try_: #(
      @numberLiteral,
      @stringLiteral,
      @symbolLiteral,
      @arrayLiteral,
      @hashLiteral,
      @block
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
      args push: self expression.
      self skipSpace.
      self optional: [self chr: ','].
      self skipSpace
    ].
    self closeParen.
    '[' + (args join: ', ') + ']'
  ]
]
.
LittleParser dot:#hashLiteral method:[
  self cache:#hashLiteral parser:[| ret |
    ret := ''.
    self hashStart.
    ret += '{'.
    ret += ((self many: [| key val |
      self skipSpace.
      key := self try_: #(@stringLiteral, @numberLiteral, @symbolLiteral).
      self skipSpace.
      self colon.
      self skipSpace.
      val := self expression.
      self skipSpace.
      self optional: [self chr: ','].
      key + ': ' + val + ','
    ]) sli: 0 ce:-1).
    self skipSpace.
    self hashEnd.
    ret += '}'.
    ret
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
"
  Small parsers that are used to implement the greater parsers
"
| Packrat |
Packrat := require value:'./packrat'
.
Packrat 
  subclass:#LittleParser
  variables:#()
.
!LittleParser
space
  self cache: #space aParser: [
    self regex: (RegExp new: '^[\\s\\n\\t]+')
  ]
!.
!LittleParser
blockStart
  self cache: #blockStart aParser: [self chr: '[']
!.
!LittleParser
blockEnd
  self cache: #blockEnd aParser: [self chr: ']']
!.
!LittleParser
verticalBar
  self cache: #verticalBar aParser: [self chr: '|']
!.
!LittleParser
colon
  self cache: #colon aParser: [self chr: ':']
!.
!LittleParser 
semicolon
  self cache: #semicolon aParser: [self chr: ';']
!.
!LittleParser
assignmentArrow
  self cache: #assignmentArrow aParser: [
    self try_: #(
      [self string: ':='],
      [self string: '<-']
    )
  ]
!.
!LittleParser
apostrophe
  self cache: #apostrophe aParser: [self chr: <"'">]
!.
!LittleParser
arrayStart
  self cache: #arrayStart aParser: [
    self string: '#('.
    self skipSpace
  ]
!.
!LittleParser
closeParen
  self cache: #closeParen aParser: [self chr: ')']
!.
!LittleParser
hashStart
  self cache: #hashStart aParser:[self string: '#{']
!.
!LittleParser
hashEnd
  self cache: #hashEnd aParser: [self chr: '}']
!.
!LittleParser
exclamation
  self cache:#exclamation aParser:[self chr: '!']
!.
!LittleParser
variable
  self cache: #variable aParser: [
    self regex: (RegExp new: '^[a-zA-Z_$][a-zA-Z0-9_$]*')
  ]
!
.
!LittleParser
extendedVariable
  self cache: #extendedVariable aParser:[| v |
    v := self regex: (RegExp new: '^[a-zA-Z_$][a-zA-Z0-9_$]*').
    v === 'self' ifTrue: ['_this']
    ifFalse: [
      "if it is instance variable, prefix it with 'this'"
      (self instanceVariableP: v) ifTrue: [v := '_this.'+v]. 
      v
    ]
  ]
!.
!LittleParser
keywordSelector
  self cache:#keywordSelector aParser:[
    self sequence: #([self variable], [self colon])
  ]
!.
!LittleParser
unarySelector
  self cache:#unarySelector aParser:[| sel |
    sel := self variable.
    self notFollowedBy: [self colon].
    sel
  ]
!.
!LittleParser
explicitReturn
  self cache:#explicitReturn aParser:[
    self chr: '^'
  ]
!.
!LittleParser
commentQuote
  self cache: #commentQuote aParser:[
    self chr: '\"'
  ]
!.
!LittleParser
comment
  self cache:#comment aParser:[| comment |
    comment := self between: [self commentQuote] and: [self commentQuote] accept: [self anyChar].
    self optional: [self space].
    comment
  ]
!.
!LittleParser
skipSpace
  self cache:#skipSpace aParser:[
    self optional: [self space].
    self many: [self comment]
  ]
!.
!LittleParser
literal
  self cache: #literal aParser: [
    self try_: #(
      [self numberLiteral],
      [self stringLiteral],
      [self symbolLiteral],
      [self arrayLiteral],
      [self hashLiteral],
      [self block]
    )
  ]
!.
!LittleParser
numberLiteral
  self cache: #numberLiteral aParser: [
    self regex: (RegExp new: '^-?[0-9]+(\\.?[0-9]+)?')
  ]
!.
!LittleParser
stringLiteral
  self cache: #stringLiteral aParser: [
    '\'' + ((self 
          between: [self apostrophe]
          and: [self apostrophe] 
          accept: [|c|
            c := self anyChar.
            c === '\\' ifTrue:[c + self anyChar]
                       ifFalse:[c]
          ]) rep:</\n/g> lace:'\\n') + '\''
  ]
!.
!LittleParser
symbolLiteral
  self cache: #symbolLiteral aParser:[
    self chr: '#'.
    '\'' + self variable + '\''
  ]
!.
!LittleParser
arrayLiteral |args|
  self cache:#arrayLiteral aParser:[
    args := #().
    self arrayStart.
    self skipSpace.
    self many: [
      args push: self expression.
      self skipSpace.
      self optional: [self chr: ','].
      self skipSpace
    ].
    self closeParen.
    '[' + (args join: ', ') + ']'
  ]
!.
!LittleParser
hashLiteral
  self cache:#hashLiteral aParser:[| ret |
    ret := ''.
    self hashStart.
    ret += '{'.
    ret += ((self many: [| key val |
      self skipSpace.
      key := self try_: #([self stringLiteral], [self numberLiteral], [self symbolLiteral]).
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
!.
!LittleParser
template: template apply: hashmap | dest_str |
  dest_str := template.
  hashmap do: [:it :key |
    (it === null) || (it === undefined) ifTrue: [it := ''].
    dest_str := dest_str rep: (RegExp ne: '%'+key+'%' w: 'g') lace: it
  ].
  dest_str
!.
module at: #exports put: LittleParser
.
LittleParser
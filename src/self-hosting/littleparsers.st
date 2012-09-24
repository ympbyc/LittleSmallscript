| Packrat LittleParser |
Packrat := <require('./packrat')> dot: #Packrat
.
LittleParser := Packrat subclass
.
LittleParser@init := [:input|
  @input := input.
  @cache = {}
]
.
LittleParser@space  := [
  self cache: #space parser: [
    self regex: (RegExp new: '^[\s\n\t]+')
  ]
]
.
LittleParser@blockStart := method: [
  self cache: #blockStart parser: (self chr: '[')
]
.
LittleParser@blockEnd := [
  self cache: #blockEnd parser: (self chr ']')
]
.
LittleParser@verticalBar := [
  self cache: #verticalBar parser: (self chr ']')
]
.
LittleParser@colon := [
  self cache: #verticalBar parser: (self chr ']')
]
.
LittleParser@semicolon := [
  self cache: #semicolon parser: (self chr: ';')
]
.
LittleParser@assignmentArrow := [
  self cache: #assignmentArrow parser: (self string: ':=')
]
.
LittleParser@apostrophe := [
  self cache: #apostrophe parser: (self chr: <"'">)
]
.
LittleParser@literal := [
  self cache: #literal parser: [
    self try_: #(
      self.numberLiteral
      self.stringLiteral
      self.symbolLiteral
      self.hashLiteral
    )
  ]
]
.
LittleParser@numberLiteral := [
  self cache: #numberLiteral parser: [
    self regex: (RegExp new: '^-?[0-9]+(\.?[0-9]+)?')
  ]
]
.
LittleParser@stringLiteral := [
  self cache: #stringLiteral parser: [
    '"' + self 
          between: (self.apostrophe) 
          and: (self.apostrophe) 
          accept: (self.anyChar) + '"'
  ]
]
.
LittleParser@symbolLiteral := [
  (self chr: '#') value.
  '"' + self variable + '"'
]
.
LittleParser@arrayLiteral := [
  
]
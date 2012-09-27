| Packrat Statement |
Packrat := <require('./packrat')> dot: #Packrat
.
Statement := Packrat subclass
.
Statement dot:#statement method:[
  self cache:#statement parser:[| ret vd |
    ret := ''.
    self skipSpace.
    vd := self optional: @variableDeclaration.
    vd !== null ifTrue:[ ret += vd ].

    self skipSpace.
    ret += (self many: [| a |
      a := self expression.
      self skipSpace.
      self chr: '.'.
      self skipSpace.
      self followedBy: @expression.

      a + '; '
    ]).
    ret := ret + 'return ' + self expression + ';'.
    self skipSpace.
    self optional: [ self chr: '.' ]. "allow tail period"

    ret
  ]
]
.
Statement dot:#variableDeclaration method:[
  self cache:#variableDeclaration parser:[| ret |
    ret := 'var '.
    self skipSpace.
    self verticalBar.
    ret += ((self many1: [
      self skipSpace.
      self variable + ', '
    ]) rep: </,\s$/> lace: '; ').
    self skipSpace.
    self verticalBar.
    ret
  ]
]
.
exports dot:#Statement put: Statement
.
Statement
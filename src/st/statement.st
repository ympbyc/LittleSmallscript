| Class |
Class := require value:'./class'
.
Class subclass: #Statement variables: #()
.
!Statement
statement
  self cache:#statement aParser:[| ret vd |
    ret := ''.
    self skipSpace.
    vd := self optional: [self variableDeclaration].
    vd !== null ifTrue:[ ret += vd ].

    self skipSpace.
    ret += (self many: [| a |
      a := self statementable.
      self skipSpace.
      self chr: '.'.
      self skipSpace.
      self followedBy: [self statementable].

      a + '; '
    ]).
    ret += ([
      'return ' + self expression + ';'
    ] tryCatch: [| st |
      st := [self statementable + ';'] tryCatch: [''].
      st + 'return null;'
    ]).
    self skipSpace.
    self optional: [ self chr: '.' ]. "allow tail period"

    ret
  ]
!.
!Statement
statementable 
  self cache:#statementable aParser:[
    self try_: #(
      [self classHeader],
      [self instanceMethod],
      [self expression]
    )
  ]
!.
!Statement
variableDeclaration 
  self cache:#variableDeclaration aParser:[| ret |
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
!.
module at:#exports put: Statement
.
Statement
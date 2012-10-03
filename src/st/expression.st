| LittleParser optimization |
LittleParser := require value:'./littleparser'
.
optimization := require value:'./optimization'
.
LittleParser subclass:#Expression 
            variables:#(#bundledMethods)
.
!Expression
init
  bundledMethods := #()
!.
!Expression
bundleAMethodIfAvailable: methodName
  (bundledMethods indexOf: methodName) > -1 && (bundlableMethods bundlable:methodName)
  ifTrue: [bundledMethods push: (bundlableMethods bundle:methodName)]
!.
!Expression
expression | tmpl |
  tmpl := '%assignments%%cascade%'.
  self cache:#expression aParser:[
    | assignments cascade |
    assignments := self optional: [self assignments].
    cascade := self cascade.
    self template: tmpl apply: #{
      #assignments:assignments #cascade:cascade
    }
  ]
!.
!Expression
assignments 
  self cache:#assignments aParser:[
    self many: [| variable |
      variable := self extendedVariable.
      self skipSpace.
      self assignmentArrow.
      self skipSpace.
      variable + ' = '
    ]
  ]
!.
!Expression
cascade | tmpl |
  tmpl := 
    '(function () { var _receiver = %simpleExpression%; %body% return _receiver;  })()'.
  self cache:#cascade aParser:[| se |
    se := self simpleExpression.
    self try_: #([
      self skipSpace.
      self notFollowedBy: [self semicolon].
      se
    ], [| conti |
      conti := self many: [| mes |
        self skipSpace.
        self semicolon.
        self skipSpace.
        mes := self continuation.
        (optimization optimizationAvailable: (mes at:#methodName))
        ifTrue:[
          (optimization op: '_receiver' ti: (mes at:#methodName) mize: (mes at:#args)) + ';'
        ]
        ifFalse: ['_receiver' + (mes at: #js) + ';']
      ].
      self template: tmpl apply: #{
        #simpleExpression:se 
        #body:conti
      }
    ])
  ]
!.
!Expression
simpleExpression: allowedParsers
  self cache:#simpleExpression aParser:[| receiver injection |
    receiver := injection := self primaryReceiver.
    self many:[| mes ret |
      mes := self continuation: allowedParsers.

      "optimize if optimization is available"
      (optimization optimizationAvailable: (mes at:#methodName))
        ifTrue: [
          injection := optimization op: injection ti: (mes at:#methodName) mize: (mes at:#args)
        ]
        ifFalse:[
          (mes at:#wrapMe)
            ifTrue: [injection := '(' + injection + (mes at:#js) + ')']
            ifFalse: [injection += (mes at:#js)]
        ]
    ].
    injection
  ]
!.
!Expression
continuation: allowedParsers
  self cache:#continuation aParser:[
    allowedParsers === undefined ifTrue: [
      allowedParsers := #([self keywordMessage],
        [self binaryMessage],
        [self unaryMessage])].
    self try_: allowedParsers
  ]
!.
!Expression
keywordMessage 
  self cache:#keywordMessage aParser:[| methodName args |
    methodName := ''.
    args := #().
    self many1: [
      self skipSpace.
      methodName += (self keywordSelector rep:':' lace:'').
      self skipSpace.
      "unary and binary messages are ranked higher"
      args push: (self simpleExpression: #([self binaryMessage], [self unaryMessage])).
      self skipSpace
    ].
    #{
      #js: '.' + methodName + '(' + (args join: ', ') + ')',
      #wrapMe: false,
      #methodName: methodName,
      #args: args
    }
  ]
!.
!Expression
binaryMessage 
  self cache:#binaryMessage aParser:[| operator argument |
    self skipSpace.
    operator := self operator.
    self skipSpace.
    "unary messages are ranked higher"
    argument := self simpleExpression: #([self unaryMessage]).
    #{
      #js: ' ' + operator + ' ' + argument,
      #wrapMe: true,
      #methodName: operator,
      #args: #(argument)
    }
  ]
!.
!Expression
unaryMessage 
  self cache:#unaryMessage aParser:[| unarySelector |
    self skipSpace.
    unarySelector := self unarySelector.
    #{
      #js: '.' + unarySelector + '()',
      #wrapMe: false,
      #methodName: unarySelector,
      #args: #()
    }
  ]
!.
!Expression
primary 
  self cache:#primary aParser:[
    self try_: #(
      [self extendedVariable],
      [self literal],
      [self block],
      [self primitive],
      [self between: [self chr: '('. self skipSpace]
        and: [self skipSpace. self chr: ')']
        accept: [self cascade]
      ]
    )
  ]
!.
!Expression
primaryReceiver 
  self cache:#primaryReceiver aParser:[
    self try_: #([| num |
      num := self numberLiteral.
      self followedBy: [
        self try_: #([self keywordMessage], [self unaryMessage])
      ].
      '(' + num + ')'
    ], [
      self followedBy: [
        self block.
        self skipSpace.
        self try_: #([self keywordMessage], [self unaryMessage])
      ].
      '(' + self block + ')'
    ],
    [self primary])
  ]
!.
!Expression
primitive 
  self cache:#primitive aParser:[
    self skipSpace.
    self between: [
      self chr: '<'.
      self notFollowedBy: [self chr: '-'].
      '<'
    ] and: [
      self chr: '>'
    ] accept: [self anyChar]
  ]
!.
!Expression
operator | p |
  p := [:str | [self string: str]].
  self cache:#operator aParser:[| op |
    self skipSpace.
    op := self try_: #(
      p value: '+=',
      p value: '-=',
      p value: '*=',
      p value: '/=',
      p value: '+',
      p value: '-',
      p value: '*',
      p value: '/',
      p value: '%',
      p value: '===',
      p value: '!==',
      p value: '<=',
      p value: '>=',
      p value: '<',
      p value: '>',
      p value: '^',
      p value: '&&',
      p value: '||'
    )
  ]
!.
module at: #exports put: Expression
.
Expression

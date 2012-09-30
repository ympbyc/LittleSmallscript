| Packrat optimization Expression |
Packrat := <require('./packrat')> dot: #Packrat
.
optimization := <require('./optimization')>
.
Expression := Packrat subclass
.
Expression dot:#expression method:[| tmpl |
  tmpl := '%assignments%%cascade%'.
  self cache:#expression parser:[
    | assignments cascade |
    assignments := self optional: @assignments.
    cascade := self cascade.
    self template: tmpl apply: #{
      #assignments:assignments #cascade:cascade
    }
  ]
]
.
Expression dot:#assignments method:[
  self cache:#assignments parser:[
    self many: [| variable |
      variable := self extendedVariable.
      self skipSpace.
      self assignmentArrow.
      self skipSpace.
      variable + ' = '
    ]
  ]
]
.
Expression dot:#cascade method:[| tmpl |
  tmpl := 
    '(function () { var _receiver = %simpleExpression%; %body% return _receiver;  })()'.
  self cache:#cascade parser:[| se |
    se := self simpleExpression.
    self try_: #([
      self skipSpace.
      self notFollowedBy: @semicolon.
      se
    ], [| conti |
      conti := self many: [
        self skipSpace.
        self semicolon.
        self skipSpace.
        '_receiver' + (self continuation at: #js) + ';'
      ].
      self template: tmpl apply: #{
        #simpleExpression:se 
        #body:conti
      }
    ])
  ]
]
.
Expression dot:#simpleExpression method:[:allowedParsers |
  self cache:#simpleExpression parser:[| receiver injection |
    receiver := injection := self primaryReceiver.
    self many:[| mes ret |
      mes := self continuation: allowedParsers.

      "optimize if optimization is available"
      (optimization@optimizationAvailable value: mes@methodName)
        ifTrue: [
          injection := optimization@optimize value: injection value: mes@methodName value: mes@args
        ]
        ifFalse:[
          mes@wrapMe 
            ifTrue: [injection := '(' + injection + mes@js + ')']
            ifFalse: [injection += mes@js]
        ]
    ].
    injection
  ]
]
.
Expression dot:#continuation method:[:allowedParsers |
  self cache:#continuation parser:[
    allowedParsers === undefined ifTrue: [
      allowedParsers := #(
        @keywordMessage,
        @binaryMessage,
        @unaryMessage)].
    self try_: allowedParsers
  ]
]
.
Expression dot:#keywordMessage method:[
  self cache:#keywordMessage parser:[| methodName args |
    methodName := ''.
    args := #().
    self many1: [
      self skipSpace.
      methodName += (self keywordSelector rep:':' lace:'').
      self skipSpace.
      "unary and binary messages are ranked higher"
      args push: (self simpleExpression: #(@binaryMessage, @unaryMessage)).
      self skipSpace
    ].
    #{
      #js: '.' + methodName + '(' + (args join: ', ') + ')',
      #wrapMe: false,
      #methodName: methodName,
      #args: args
    }
  ]
]
.
Expression dot:#binaryMessage method:[
  self cache:#binaryMessage parser:[| operator argument |
    self skipSpace.
    operator := self operator.
    self skipSpace.
    "unary messages are ranked higher"
    argument := self simpleExpression: #(@unaryMessage).
    #{
      #js: ' ' + operator + ' ' + argument,
      #wrapMe: true,
      #methodName: operator,
      #args: #(argument)
    }
  ]
]
.
Expression dot:#unaryMessage method:[
  self cache:#unaryMessage parser:[| unarySelector |
    self skipSpace.
    unarySelector := self unarySelector.
    #{
      #js: '.' + unarySelector + '()',
      #wrapMe: false,
      #methodName: unarySelector,
      #args: #()
    }
  ]
]
.
Expression dot:#primary method:[
  self cache:#primary parser:[
    self try_: #(
      @extendedVariable,
      @literal,
      @block,
      @primitive,
      [self between: [self chr: '(']
        and: [self chr: ')']
        accept: @cascade
      ]
    )
  ]
]
.
Expression dot:#primaryReceiver method:[
  self cache:#primaryReceiver parser:[
    self try_: #([| num |
      num := self numberLiteral.
      self followedBy: [
        self try_: #(@keywordMessage, @unaryMessage)
      ].
      '(' + num + ')'
    ], [
      self followedBy: [
        self block.
        self skipSpace.
        self try_: #(@keywordMessage, @unaryMessage)
      ].
      '(' + self block + ')'
    ],
    @primary)
  ]
]
.
Expression dot:#primitive method:[
  self cache:#primitive parser:[
    self skipSpace.
    self between: [
      self chr: '<'.
      self notFollowedBy: [self chr: '-'].
      '<'
    ] and: [
      self chr: '>'
    ] accept: @anyChar
  ]
]
.
Expression dot:#operator method:[| p |
  p := [:str | [self string: str]].
  self cache:#operator parser:[| op |
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
]
.
exports dot: #Expression put: Expression
.
Expression

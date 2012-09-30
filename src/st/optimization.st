| LP template optimTmpl optimize canUseDotNotation optimizationAvailable |
LP := <require('./littleparser')> at: #LittleParser
.
template := [:template :hashmap | | dest_str |
  dest_str := template.
  hashmap do: [:it :key |
    (it === null) || (it === undefined) ifTrue: [it := ''].
    dest_str := dest_str rep: (RegExp ne: '%'+key+'%' w: 'g') lace: it
  ].
  dest_str
]
.
optimTmpl := #{
  'at' : '%receiver%[%arg1%]',
  'atput' : '%receiver%[%arg1%] = %arg2%',
  'dot' : '%receiver%.%arg1%',
  'dotput' : '%receiver%.%arg1% = %arg2%',
  'do' : '%receiver%.do_(%arg1%)',
  'value' : '%receiver%(%arg1%)',
  'valuevalue' : '%receiver%(%args%)',
  'valuevaluevalue' : '%receiver%(%args%)',
  'valuevaluevaluevalue' : '%receiver%(%args%)',
  'valuevaluevaluevaluevalue' : '%receiver%(%args%)',
  'ifTrue' : '%receiver% ? (%arg1%)() : void 0',
  'ifFalse' : '%receiver% ? void 0 : (%arg1%)()',
  'ifTrueifFalse' : '%receiver% ? (%arg1%)() : (%arg2%)()',
  'ifFalseifTrue' : '%receiver% ? (%arg2%)() : (%arg1%)()',
  'and' : '%receiver% && %arg1%()',
  'or'  : '%receiver% || %arg1%()',
  'eqv' : '%receiver% === %arg1%()',
  'xor' : '(%receiver% && !%arg1%()) || (!%receiver% && %arg1%())',
  'not' : '! %receiver%',
  'new' : 'new %receiver%(%args%)',
}
.
canUseDotNotation := [:str| | v identifier |
  v := LP new: str.
  [
    identifier := v between: [v chr: '\"'] and: [v chr: '\"'] accept: v at:#variable
  ] tryCatch: [].
  v getIndex === v getInputLength ifTrue: [identifier] ifFalse: [null]
]
.
optimize := [:receiver :methodName :args |
  "special cases"
  (methodName === 'at') || (methodName === 'dot') ifTrue: [| identifier |
    identifier := (canUseDotNotation value: (args at: 0)).
    identifier !== null ifTrue: [
      args at: 0 put: identifier.
      methodName := 'dot'
    ]
  ].
  (methodName === 'atput') || (methodName === 'dotput') ifTrue: [| identifier |
    identifier := (canUseDotNotation value: (args at: 0)).
    identifier !== null ifTrue: [
      args at: 0 put: identifier.
      methodName := 'dotput'
    ]
  ].
  "end"

  template value: (optimTmpl at: methodName) value: #{
    'receiver' : receiver,
    'args'     : args join: ', ',
    'arg1'     : args at: 0,
    'arg2'     : args at: 1,
    'arg3'     : args at: 2
  }
]
.
optimizationAvailable := [:methodName |
  optimTmpl hasOwnProperty: methodName
]
.
exports at:#optimize put:optimize.
exports at:#optimizationAvailable put:optimizationAvailable
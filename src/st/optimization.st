| LP template optimTmpl optimize canUseDotNotation optimizationAvailable |
LP := require value:'./littleparser'
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
  'tryCatch' : 
    '(function () { var _ret; try { _ret = %receiver%(); } catch (err) { _ret = %arg1%(err); } return _ret; })()',
  'tryCatchFinally' : 
    '(function () { var _ret; try { _ret = %receiver%(); } catch (err) { _ret = %arg1%(err); } finally { _ret = %arg2%(); } return _ret; })()',
  'new' : 'new %receiver%(%args%)',
  'super' : '%receiver%.__super.%arg1%.call(_this)',
  'superarguments' : '%receiver%.__super.%arg1%.apply(_this, %arg2%)',
}
.
canUseDotNotation := [:str| | v identifier |
  v := LP new: str.
  [
    identifier := v between: [v chr: '\"'] and: [v chr: '\"'] accept: (v at:#variable)
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
  (methodName === 'super') || (methodName === 'superarguments') ifTrue: [
    args at:0 put: (canUseDotNotation value: (args at: 0))
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
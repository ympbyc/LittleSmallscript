"class definition syntax"
| Packrat Class |
Packrat := <require('./packrat')> dot: #Packrat
.
Class := Packrat subclass
.
"Animal subclass: #Snake variables: #(#name #colour #awake)"
Class dot:#classHeader method: [| dst_tmpl |
  dst_tmpl := 
'%className% = function () { %variableInitialization%};
%className%.prototype = new %superClass%();'.
  self cache: #classHeader parser: [| className superClass variables v_init |
    self optional: [self chr: '+']. "LSt compatibility"
    superClass := self variable.
    self skipSpace.
    self string: 'subclass:'.
    self skipSpace.
    className := self variablableStringContent.
    self skipSpace.
    self string: 'variables:'.
    self skipSpace.
    variables := self instanceVariableArray.
    @instanceVariables at: className put: #(). "save variables for this class"
    v_init := variables inject: '' into: [:a :b |
      (@instanceVariables at: className) push: a.
      b + 'this.' + a + ' = null; '
    ].
    self template: dst_tmpl apply: #{
      #className: className
      #superClass: superClass
      #variableInitialization: v_init
    }
  ]
]
.
"#(#a #b) -> ['a', 'b']"
Class dot:#instanceVariableArray method:[
  self cache:#instanceVariableArray parser:[| variables |
    variables := #().
    self arrayStart.
    self many: [| v |
      self skipSpace.
      v := self variablableStringContent.
      variables push: v.
      v
    ].
    self closeParen.
    variables
  ]
]
.
Class dot:#variablableStringContent method:[
  self cache:#variablableStringContent parser:[
    self try_: #(
      [self chr: '#'. self variable],
      [self between: @apostrophe and: @apostrophe accept: @variable]
    )
  ]
]
.
"
!Snake
setName: name |
  _name := name.
  ^ name
!
"
Class dot:#instanceMethod method: [| method_tmpl |
  method_tmpl := '%className%.prototype.%methodName% = function (%args%) { %methodBody% };'.
  self cache:#instanceMethod parser:[| className methodHead methodBody |
    self exclamation.
    self skipSpace.
    className := self variable.
    self skipSpace.
    methodHead := self methodHead.
    self skipSpace.
    self optional: @verticalBar.
    self skipSpace.
    methodBody := self statement. "change me"
    self skipSpace.
    self exclamation.
    self template: method_tmpl apply: #{
      #className: className
      #methodName: methodHead@name
      #args: methodHead@args
      #methodBody: methodBody
    }
  ]
]
.
Class dot:#methodHead method:[
  self cache:#methodHead parser:[| methodName args |
    methodName := ''.
    args := ''.
    self try_: #([
      self many1: [
        methodName += (self keywordSelector sli: 0 ce: -1). "remove colon"
        self skipSpace.
        args += self variable
      ]
    ],[
      methodName := self unarySelector
    ]).
    #{
      #name: methodName
      #args: args
    }
  ]
]
.
exports@Class := Class
.
Class
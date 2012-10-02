"class definition syntax"
| Block |
Block := <require('./block')> at: #Block
.
Block
  subclass: #Class
  variables: #(
    #instanceVariables
    #currentClass
  )
.
!Class
init
  instanceVariables := #{}.
  currentClass := null
!.
"Animal subclass: #Snake variables: #(#name #colour #awake)"
!Class
classHeader | dst_tmpl |
  dst_tmpl := 
'var %className%;
%className% = function () { %variableInitialization%if (this.init) { this.init.apply(this, arguments); } };
%className%.prototype = new %superClass%();'.
  self cache: #classHeader aParser: [| className superClass variables v_init |
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
    instanceVariables at: className put: #(). "save variables for this class"
    v_init := variables inject: '' into: [:a :b |
      (instanceVariables at: className) push: a.
      b + 'this.' + a + ' = null; '
    ].
    self template: dst_tmpl apply: #{
      #className: className
      #superClass: superClass
      #variableInitialization: v_init
    }
  ]
!.
"#(#a #b) -> ['a', 'b']"
!Class
instanceVariableArray 
  self cache:#instanceVariableArray aParser:[| variables |
    variables := #().
    self arrayStart.
    self many: [| v |
      self skipSpace.
      v := self variablableStringContent.
      variables push: v.
      self skipSpace.
      self optional: [self chr: ','].
      self skipSpace.
      v
    ].
    self closeParen.
    variables
  ]
!.
!Class
variablableStringContent 
  self cache:#variablableStringContent aParser:[
    self try_: #(
      [self chr: '#'. self variable],
      [self between: [self apostrophe] and: [self apostrophe] accept: [self variable]]
    )
  ]
!.
"
!Snake
setName: aname
  name := aname.
  name
!
"
!Class
instanceMethod | method_tmpl |
  method_tmpl := '%className%.prototype.%methodName% = function (%args%) { var _this = this; %methodBody% }'.
  self cache:#instanceMethod aParser:[| className methodHead methodBody |
    self exclamation.
    self skipSpace.
    className := self variable.
    self skipSpace.
    methodHead := self methodHead. "#{}"
    self skipSpace.
    self setCurrentClass: className. "set the current class"
    methodBody := self statement. "change me"
    self setCurrentClass: null. "empty the current class"
    self skipSpace.
    self exclamation.
    self template: method_tmpl apply: #{
      #className: className
      #methodName: methodHead at:#name
      #args: methodHead at:#args
      #methodBody: methodBody
    }
  ]
!.
!Class
methodHead 
  self cache:#methodHead aParser:[| methodName args |
    methodName := ''.
    args := #().
    self try_: #([
      self many1: [
        methodName += (self keywordSelector sli: 0 ce: -1). "remove colon"
        self skipSpace.
        args push: self variable.
        self skipSpace
      ]
    ],[
      methodName := self unarySelector
    ]).
    #{
      #name: methodName
      #args: args join: ', '
    }
  ]
!.
!Class
setCurrentClass: className
  currentClass := className.
  className
!.
!Class
instanceVariableP: variableName |v|
  (currentClass !== null) 
  && ((instanceVariables at: currentClass) !== undefined)
  && (((instanceVariables at: currentClass) indexOf: variableName) > -1)
!.
exports at:#Class put:Class
.
Class
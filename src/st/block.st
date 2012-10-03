"
  parse and compile lexical block
"
| Expression |
Expression := require value:'./expression'
.
Expression 
  subclass:#Block 
  variables:#()
.
!Block
block | dst_tmpl |
  dst_tmpl := 'function (%parameters%) { %body% }'.
  self cache: #block aParser: [| parameters body |
    self blockStart.
    parameters := self blockHead.
    body := self optional: [self statement].
    self blockEnd.
    self template: dst_tmpl apply: #{#parameters:parameters #body:body}
  ]
!.
!Block
blockParameters
  self cache: #blockParameters aParser: [| vars |
    vars := ''.
    self skipSpace.
    self many: [
      self colon.
      vars += (self variable + ', ').
      self skipSpace
    ].
    vars sli: 0 ce: -2
  ]
!.
!Block
blockHead
  self cache: #blockHead aParser: [
    self optional: [|params|
      self skipSpace.
      params := self blockParameters.
      params size > 0 ifTrue: [ self verticalBar ].
      self skipSpace.
      params
    ]
  ]
!.
module at: #exports put: Block
.
Block
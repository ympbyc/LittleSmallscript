| Packrat BlockParser |
Packrat := <require('./packrat')> dot: #Packrat
.
BlockParser := Packrat subclass
.
BlockParser dot:#block method: [| dst_tmpl |
  dst_tmpl := 'function (%parameters%) { %body% }'.
  self cache: #block parser: [| parameters body |
    self blockStart.
    parameters := self blockHead.
    body := self optional: @statement.
    self blockEnd.
    self template: dst_tmpl apply: #{#parameters:parameters #body:body}]]
.
BlockParser dot: #blockParameters method: [
  self cache: #blockParameters parser: [| vars |
    vars := ''.
    self skipSpace.
    self many: [
      self colon.
      vars += (self variable + ', ').
      self skipSpace].
    vars@slice value: 0 value: -2]]
.
BlockParser dot: #blockHead method: [
  self cache: #blockHead parser: [
    self optional: [|params|
      self skipSpace.
      params := self blockParameters.
      params@length > 0 ifTrue: [
        self verticalBar].
      self skipSpace.
      params]]]
.
exports dot: #BlockParser put: BlockParser
.
BlockParser
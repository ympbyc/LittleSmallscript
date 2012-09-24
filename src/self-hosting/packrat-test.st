| LittleParser MyParser mp |
LittleParser := <require('./littleparser')> dot: #LittleParser
.
MyParser := LittleParser subclass
.
MyParser dot:#init method:[:input|
  @input := input.
  @cache := #{}
]
.
MyParser dot:#toJS method:[
  "self between: [self chr:'['] and: [self chr: ']'] accept: [self anyChar]"
  self try_: #(
    @literal
  )
]
.

mp := MyParser new: '#(1)'
.
mp p: mp toJS

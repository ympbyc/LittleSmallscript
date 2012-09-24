| LittleParser MyParser mp |
LittleParser := <require('./littleparser')> dot: #LittleParser
.
console log: LittleParser
.
MyParser := LittleParser subclass
.
MyParser dot:#init method:[:input|
  @input := input.
  @cache := #{}
]
.
MyParser dot:#toJS method:[
  self try_: #(
    @literal
  )
]
.

mp := MyParser new: '#(1)'
.
mp p: mp toJS
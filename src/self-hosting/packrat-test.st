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
  self try_: #(
    @literal
  )
]
.

mp := MyParser new: '#(1 2 #bar #(3))'
.
mp p: mp toJS

"AutoTyper automates your live-coding performance"

| AutoTyper autotyper |
AutoTyper := Object subclass
.
AutoTyper method: [:input |
  @input := input.
  @index := 0.
  @interval := 0.
  @console := $ value: 'body'
] dot: #init
.
AutoTyper method: [:selector |
  @console := $ value: selector
] dot: #setConsole
.
AutoTyper method: [:interval |
  @interval := interval
] dot: #setInterval
.
AutoTyper method: [
  @console text: ''
] dot: #first
.
AutoTyper method: [
  @index > (@input dot: length - 1) ifFalse: [
    @console text: (@console text + (@input at: @index)).
    @index += 1
  ] ifTrue: [null]
] dot: #next
.
AutoTyper method: [| interval |
  self first.
  interval := [window set: [
    self next !== null ifFalse: [window clearInterval: interval]
  ] Interval: @interval] value
] dot: #start
.

AutoTyper new: 'Hello, world!'
; setConsole: '#js-source'
; setInterval: 50
; start
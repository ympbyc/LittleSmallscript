"
  examples/AutoTyper.st

  AutoTyper automates your live coding.
  AutoTyper
    author: 'Minori Yamashita'
    Email: 'ympbyc@gmail.com'
    requires: 'jQuery'
"
Object subclass: #AutoTyper variables: #(#input #index #interval #console)
.
!AutoTyper
init: text
  input <- text.
  index <- 0.
  interval <- 0.
  console <- $ value: 'body'
!
.
!AutoTyper
setConsole: selector
  console <- $ value: selector
!
.
!AutoTyper
setInterval: num
  interval <- num
!
.
!AutoTyper
first
  console text: ''
!
.
!AutoTyper
next
  index > (input size - 1) ifFalse: [
    console text: (console text + (input at: index)).
    index += 1
  ] ifTrue: [null]
!
.
!AutoTyper
start | interval |
  self first.
  interval <- [window set:[
    (self next === null) ifTrue: [window clearInterval: interval]
  ] Interval: interval] value
!
.
AutoTyper new
; init: 'Hello, world!'
; setConsole: '#js-source'
; setInterval: 50
; start

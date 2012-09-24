| Packrat pkrt |
Packrat := <require('./packrat')> dot: #Packrat
.
pkrt := Packrat new: '12345'.
console log: ((pkrt try_: #(
  pkrt string: '08765',
  pkrt string: '12345',
  pkrt string: '76122'
)) === '12345')
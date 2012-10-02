"
  examples/server.st
  
  Node http server
  Compile this file and give it to node
"
| http Server |
http := <require('http')>
.
Server := http at:#Server
.
!Server
listenPort: port host: host
  (self at:#listen) value: port value: host.
  self
!
.
(http createServer: [:req :res |
  res write: 200 Head: #{'Content-Type': 'text/plain'}.
  res end: 'Hello, LittleSmallscript!'
]) listenPort: 1337 host: '127.0.0.1'
.
console log: 'Server running at http://127.0.0.1:1337/'
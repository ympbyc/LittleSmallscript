Class Klass :superClass
| someArray index |
[
  new
    someArray <- Array new.
    index <- 0
|
  current
    ^ someArray at: index
|
  current: replacement
    someArray at: index put: replacement.
    ^ self
|
  incrementPointer | origin |
    origin <- index deepCopy.
    index <- index + 1.
    (origin, ' to ', index) print
    ^ index
]

(Klass new ; incrementPointer ; current: 3 ; current) print.

#(1 2 3 4) inject: 0 into: [:a :lastres | lastres + a].

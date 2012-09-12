| Klass  |
Klass <- Class subclassWithVariables #('someArray' 'index').

Klass method: [
  someArray <- 1 to: 10.
  index <- 0
] at: 'constructor'.

Klass method: [
  someArray at: index
] at: 'current'.

Klass method: [:replacement |
  someArray at: index put: replacement.
  self
] withKeywords: #('replaceCurrentWith').

Klass method: [ | origin |
  origin <- index.
  index <- index <+> 1.
  ((origin <+> ' to ') <+> index) print.
  index
] at 'incrementPointer'.


(Klass new_ ; incrementPointer ; replaceCurrentWith: 3) current print.

#(1 2 3 4) inject: 0 into: [:a :lastres | lastres + a].

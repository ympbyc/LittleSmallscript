| Map | \
Map <- Object subclass. \
Map method: [self at: _map put: (Array new)] at: 'new'. \
Map method: [:w :h | \
  h timesRepeat: [| row | \
    row <- Array new. \
    w timesRepeat: [row addLast: (MapCell new)]. \
    _map addLast: row \
  ]. \
  ^ _map \
] at: 'init'. \
Map method: [^ _map] at: 'show'. \
 \
(Map new: init) show \
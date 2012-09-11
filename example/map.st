| Map MapCell |
MapCell <- Array subclass.
Map <- Object subclass.
Map method: [self at: '_map' put: (Array new)] at: 'init'.
Map method: [:w :h |
  h timesRepeat: [| row |
    row <- Array new.
    w timesRepeat: [row addLast: (MapCell new)].
    _map addLast: row
  ].
  ^ _map
] at: 'width_height_'.
Map method: [^ _map] at: 'show'.

(Map new; width: 10 height: 5) show

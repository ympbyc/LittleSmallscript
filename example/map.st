| Map MapCell |
MapCell <- Array subclass.
Map <- Object subclass.
Map method: [this at: '_map' put: (Array new_)] at: 'init'.
Map method: [:w :h | | _this |
  _this <- this.
  h timesRepeat: [| row |
    row <- Array new_.
    w timesRepeat: [row addLast: (MapCell new_)].
    (_this at: '_map') addLast: row
  ].
  ^ this at: '_map'
] withKeywords: #('width' 'height').
Map method: [^ this at: '_map'] at: 'show'.

(Map new_; width: 10 height: 5) show


var mapSt = 
"| Map MapCell |\
MapCell <- Array subclass.\
Map <- Object subclass.\
Map method: [this at: '_map' put: (Array new)] at: 'init'.\
Map method: [:w :h | | _this |\
  _this <- this.\
  h timesRepeat: [| row |\
    row <- Array new.\
    w timesRepeat: [row addLast: (MapCell new)].\
    (_this at: '_map') addLast: row\
  ].\
  ^ this at: '_map'\
] at: 'width_height_'.\
Map method: [^ this at: '_map'] at: 'show'.\
\
(Map new; width: 10 height: 5) show";

eval((function () {
  var js = new LittleSmallscript(mapSt).toJS();
  console.log(js);
  return js;
})());

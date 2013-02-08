"
  examples/titaniumApp
  
  Simple titanium mobile application.
  Compile this file and save as app.js in your titanium mobile project
"
| UI win label button |
UI := Ti at:#UI.

win := UI createWindow: (
  Object new
  ; at:#backgroundColor put:'#fff'
  ; at:#navBarHidden    put:false
  ; at:#title           put:'Hello LittleSmallscript!'
  ; at:#layout          put:#vartical ).

label := UI createLabel: (
  Object new
  ; at:#text put:'Hello, LittleSmallscript!'
  ; at:#top put:'45%' ).

button := UI createButton: (
  Object new
  ; at:#title put:'touch me!'
  ; at:#top  put:'50%' ).

win add: label.
win add: button.
label hide.

button addEvent: 'click' Listener: [
  label show ].

win open.
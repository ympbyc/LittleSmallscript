class definition syntax
=======================

Lets imitate the Little Smalltalk v5's syntax for class definition.

```smalltalk

Animal subclass: #Snake variables: #(#name #colour #awake)
.
!Snake
initWithName: itsName color: itsColour
  name := itsName.
  colour := itsColour.
  awake := true
!
.
!Snake
getName
  ^ name
!
.
!Snake
move: metre
  awake ifFalse: [^ null].
  ^ name , ' the python moved ' , metre , 'm.'
!
.
(Snake new ; initWithName: 'Sammy' color: 'green') move: 5
```

Indentations and newlines are not required, so you could do something like

```smalltalk
!Snake move: metre awake ifFalse: [^ null]. ^ name , '...'!
```

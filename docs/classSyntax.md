class definition syntax
=======================

Lets imitate the Little Smalltalk v5's syntax for class definition.

```smalltalk

Animal subclass: #Snake variables: #(#name #color #awake).

!Snake
initWithName: itsName color: itsColor |
  name := itsName.
  color := itsColor.
  awake := true
!

!Snake
getName
  ^ name
!

!Snake
move: metre |
  awake ifFalse [^ null].
  ^ name , ' the python moved ' , metre , 'm.'
!

(Snake new ; initWithName: 'Sammy' color: 'green') move: 5
```


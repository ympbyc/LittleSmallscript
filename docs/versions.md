Difference between versions
======================

Little Smalltalk version 1
--------------------------

```smalltalk
Class Person :Animal
| myname answerString |
[
  new: name
    myname <- name.
    answerString <- 'hello' , name
|
  answer
    answerString print.
    ^ answerString
|
  answer: str | prefix  |
    prefix <- '.'.
    answerString <- str , prefix.
    ^ self answer
]
    
```

Little Smalltalk version 3
--------------------------

```smalltalk
Class Person Animal myname answerString

Methods Person 'all'
  new: name
    "same as version 1"
|
  answer
    "same as version 1"
|
  answer: str | prefix |
    "same as version 1"
]
```

Little Smalltalk version 4 and 5
--------------------------

```smalltalk
+Animal subclass: #Person variables: #(name answerString)

!Person
new: name
  "same as version 1"
!
!Person
answer
  "same as version 1"
!
!Person
answer: str | prefix |
  "same as version 1"
!
```

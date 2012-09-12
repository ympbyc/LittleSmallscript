Little Smallscript
==================
Little Smalltalk to Javascript translator.

Author:
-------
Minori Yamashita <ympbyc@gmail.com>

LICENCE:
--------
MIT

Direction:
----------
* Support only the Javascript's primary classes like Array and String. 
  * We will not build-in Little Smalltalk unique classes such as Bag, List, Bytearray, etc.
* <del>The first version will not perform any optimization.</del> first version is complete.
* Some expressions are converted to javascripts syntax, for efficiency and readability.
  * "(1 <==> 1) ifTrue: ['yay']" -> "(1 === 1).ifTrue(function () {return 'yay';})" -> "if (1 == 1) { 'yay'; }"
  * #(1 2 3) at: 0 -> [1,2,3].at(0) -> [1,2,3][0]
* Other message expressions are translated into method calling expression.
  * reference: https://github.com/ympbyc/LittleSmallscript/blob/master/src/littlesmallmethods.js
  * "obj unary" becomes "obj.unary()". "array at: 1 put: 2" becomes "array.atput(1, 2)".
  * binary messages take inline js for selector: ((x <%> 2) <==> 0)
  
Goal:
----------
Create a translator that can translate docs/from.st to docs/to.js.
Make resulting javascript code similar to that of CoffeeScript.

Current working example:
------------------------
The language is changing every second so do example codes. Here's what works at least for now.

```smalltalk
| Robot Enemy  |
Enemy <- Object subclass.
Enemy method: [:myname |
  this at: '_name' put: myname.
  this
] at: 'init'.
Enemy method: [| ret caught |
  ret <- false.
  caught <- (((Math random) <*> 10) <<> 3).
  caught ifTrue: [ret <- true].
  ret
] at: 'isCaught'.
Robot <- Object subclass.
Robot method: [:myname |
  this at: '_name' put: myname.
  this
] at: 'init'.
Robot method: [| message |
  message <- 'Hello. I am ' <+> ((this at: '_name') <+> '.').
  window alert: message.
  message
] at: 'greet'.
Robot method: [:enemy :block | | mes |
  mes <- (((this at: '_name') <+> ' is chasing') <+> (enemy at: '_name')).
  [enemy isCaught] whileFalse: [window alert: mes].
  block value
] withKeywords: #('chaseEnemy' 'whenCaught').

Robot new_: 'Yendor' 
  ; greet 
  ; chaseEnemy: (Enemy new_: 'Demogorgon') whenCaught: [
    window alert: 'a robot caught his enemy'
  ]
```

Milestones:
----------
5am 10 Sep 2012  

v0.0.1  
Implemented a PEG parser in javascript.  
Can now parse and generate expressions and literals.  
Messages are compiled to method calling, blocks are compiled to function literal.  
Temporary variable declaration is yet to be supported.  


12pm 12 Sep 2012  

v0.0.2  
Statement parser is coplete.  
Consequently, temporary variable declaration is now supported. | foo bar | compiles to var foo, bar;.  
Inline javascript as primary values. obj method: <function () {}>  
Binary messages with javascript operators. 1 <+> 1;  
Much of Little Smalltalk's built-in methods are provided via the library: LittleSmallmethods.js.  
Prettyprint using beautify.js.  


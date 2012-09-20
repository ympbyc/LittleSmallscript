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
  * "(1 === 1) ifTrue: ['yay']" -> "(1 === 1).ifTrue(function () {return 'yay';})" -> "if (1 === 1) { 'yay'; }"
  * #(1 2 3) at: 0 -> [1,2,3].at(0) -> [1,2,3][0]
* Other message expressions are translated into method calling expression.
  * reference: https://github.com/ympbyc/LittleSmallscript/blob/master/src/littlesmallmethods.js
  * "obj unary" becomes "obj.unary()". "array at: 1 put: 2" becomes "array.atput(1, 2)".
  * binary messages take js operators as selectors: ((x % 2) === 0)

Current working example:
------------------------
The language is changing every second so do example codes. Here's what works at least for now.

```smalltalk
| Animal Snake sam |

Animal := Object subclass.

Animal method: [:name | 
  this at: #name put: name
] at: #init.

Animal method: [:metres |
  window alert: (@name + 'moved ' + metres + 'm.')
] at: #move.

Snake := Animal subclass.
Snake method: [
  "'super' is not supported yet"
  window alert: 'Slithering...'.
  self move: 5
] at: #crawl.

sam := Snake new: 'Sammy the Python'.
sam crawl
```

Milestones:
----------

23pm 20 Sep 2012

v0.0.4
Fixed many bugs.  
Binary messages now take bare operators instead of primitives.
method:at: and method:dot: fixes the scope of 'self'.

1am 20 Sep 2012

v0.0.3
Ready to ship! Known bugs are to be fixed.  
Added optimization.

12pm 12 Sep 2012  

v0.0.2  
Statement parser is coplete.  
Consequently, temporary variable declaration is now supported. | foo bar | compiles to var foo, bar;.  
Inline javascript as primary values. obj method: <function () {}>  
Binary messages with javascript operators. 1 <+> 1;  
Much of Little Smalltalk's built-in methods are provided via the library: LittleSmallmethods.js.  
Prettyprint using beautify.js.  

5am 10 Sep 2012  

v0.0.1  
Implemented a PEG parser in javascript.  
Can now parse and generate expressions and literals.  
Messages are compiled to method calling, blocks are compiled to function literal.  
Temporary variable declaration is yet to be supported.  
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
* The goal is to write Javascript in Smalltalk's syntax.
* No class browser and stuff.
* Some expressions are converted to javascripts syntax, for efficiency and readability.
  * "(1 === 1) ifTrue: ['yay']" -> "(1 === 1).ifTrue(function () {return 'yay';})" -> "(1 === 1) ? (function { 'yay'; })()"
  * #(1 2 3) at: 0 -> [1,2,3].at(0) -> [1,2,3][0]
* Other message expressions are translated into method calling expression.
  * "obj unary" becomes "obj.unary()". "array at: 1 put: 2" becomes "array.atput(1, 2)".
  * binary messages take js operators as selectors: ((x % 2) === 0)

ToDo:
-----
* Error messages enhancement
* Bundle standard methods into compiled js (issue#3)
* !!!<strong>DOCUMENTS<strong>!!!
* ^ syntax

Current working example:
------------------------
The language is changing every second so do example codes. Here's what works at least for now.

```smalltalk
Object subclass:#Animal variables:#(#name)
.
!Animal
move: metre
  window alert: name + ' moved ' + metre + 'm.'
!.
Animal subclass:#Snake variables:#(#name)
.
!Snake
init: aName
  name := aName.
  self
!.
!Snake
crawl
  window alert: 'Slithering...'.
  self move: 5
!.
Snake new
; init: 'Sammy the Python'
; crawl
```

Versions:
----------

23pm 30 Sep 2012

v1.0.0  
The first major version!  
Every parser is now written in LittleSmallscript itself.  
v1 is not backward compatible with v0.  
Syntax for accessing instance variables has changed.  
Class definition syntax has been added.  

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
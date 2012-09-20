Thoughts on class definition notation
=====================================

Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>

Problem
-------

In Little Smalltalk v.5, classes are defined in the following manner:

```smalltalk
+Animal subclass: #Human
       variables: #(name)

!Human
new
  name <- 'Yendor'
!

!Human
greet: yourname
  | myname |
  myname <- name.
  console log: ('hello from ' , myname , ' to ' , yourname)
!
```

It uses specialforms and you do not see many specialforms in Smalltalk source code.  
Therefore I think the ideal way to define classes should not need any specialforms.  

Solution
--------
If we were to define the following methods in the language the compiler is targeting (javascript in this case):

```javascript
Function.prototype.subclass = function (Constructor) {
  var Sc;
  Sc = Constructor || new Function (); // function () {}
  Sc.prototype = new this();
  return Sc;
};

Function.ptototype.methodAt = function (fn, name) {
  return this.prototype[name] = fn;
};
```

The class definition can be written like this:

```smalltalk
| Human |
Human <- Animal subclass: [
  self at: #name put: 'Yendor'
].

Human method: [ :yourname |
  | myname  |
  myname <- self at: #name.
  console log: ('hello from ' , myname  , ' to ' , yourname)
] at: #greet .

(Human new) greet: 'Master Lich'
```

You no longer see specialforms in this version, which is good.

Things to note
--------------

The only problem with this is that it makes referencing instance variables verbose.

```smalltalk
"Little Smalltalk"
!Klass
someMethod
  ^ someInstanceVariable

"Proposal"
Klass method: [
  ^ self at: someInstanceVariable
] at: #someMethod
``` 

You now have to append "self at:" before instance variable names.  
This probably should automaticaly be done in compile time.  


Conclusion
----------

Little Smallscript will go with the proposed notation because it reduces the amount of specialforms and it still look like a Smalltalk.

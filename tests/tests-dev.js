(function () {
  'use strict';

  var LittleSmallscript, errors, test, log, lss, p;
  LittleSmallscript = require("../src/js/development/littlesmallscript");

  errors = [];
  test = function (result, expected, mes) {
    if (result !== expected) {
      return log(mes + '\n\tEXPECTED:' + expected + '\n\tPASSED  :' + result)
    }
    console.log('\u001b[32m' + 'GREEN:\t' + mes + '\u001b[0m');
    return true;
  };
  log = function (a) {
    console.log('\u001b[31m' + 'RED  :\t' + a + '\u001b[0m');
    errors.push(a);
  };
  lss = function (input) {
    return new LittleSmallscript().initWithInputandOptions(input, {});
  };
  p = function (a) {
    console.log(a);
    return a;
  };

  console.log("=========Packrat=========");

  /* Packrat  */
  (function () {
    var a, example1 = "| foo | foo := 1 + 2 to: #(1 2 3) size ; do: [:a | a]. foo";

    //cacheDo
    a = lss("111");
    test(a.anyChar(), a.anyChar(), "cacheDo01");

    //try_
    a = lss(example1);
    test(a.try_([
      a.toParser("foo"),
      a.toParser("bar"),
      a.toParser("|"),
      a.toParser("baz")
    ]), "|", "try_01")
      
    a.skipSpace();

    try {
      a.try_([
        a.toParser("1"),
        a.toParser("2")
      ]);
      log("try_02")
    } catch (err) {}

    //sequence
    a = lss(example1);
    test(a.sequence([
      a.verticalBar,
      a.space,
      a.toParser("foo"),
      a.space,
      a.verticalBar
    ]), "| foo |", "sequence01");

    //optional
    a = lss(example1);
    test(a.optional(a.toParser("| foo |")), "| foo |", "optional01")

    test(a.optional(a.toParser("fooobaaaaa")), null, "optional02");
    
    //followedBy / notFollowedBy
    a = lss(example1);
    try {
      test(a.followedBy(a.verticalBar), null);
      test(a.followedBy(a.verticalBar), null);
    } catch (e) {
      log("followedBy01");
    }
    try {
      a.FollowedBy(a.toParser("fooobaaaaa"));
      log("followedBy02");
    } catch (e) {}
    try {
      test(a.notFollowedBy(a.toParser("fooobaaaaa")), null);
      test(a.notFollowedBy(a.toParser("fooobaaaaa")), null);
    } catch (e) {
      log("notFollowedBy01");
    }
    try {
      a.notFollowedBy(a.verticalBar);
      log("notFollowedBy02");
    } catch (e) {}
    
    //many
    a = lss(example1);
    test(a.many(a.anyChar), example1, "many01");

    test(a.many(a.many(a.colon)), "", "many02");
    
    //many1
    a = lss(example1);
    try {
      test(a.many1("colon"));
      log("many01");
    } catch (e) {}
    
    //between
    a = lss(example1);
    test(a.betweenandaccept(a.verticalBar, a.verticalBar, a.anyChar), " foo ", "between01");

    //anyChar
    a = lss(example1);
    test(a.anyChar(), "|", "anyChar01");
    
    //satisfyChar
    a = lss(example1);
    test(a.satisfyChar(function (c) { return c, "|"; }), "|", "satisfyChar");

    //chr
    a = lss(example1);
    test(a.chr("|"), "|", "chr01");

    //string
    a = lss(example1);
    test(a.string("| foo |"), "| foo |", "string01");
    
    //regex
    a = lss(example1);
    test(a.regex(/^\|\s[a-z]+\s\|/), "| foo |", "regex01");

    //toParser
    a = lss(example1);
    test(a.toParser("| foo |")(), "| foo |", "toParser01");
  })();
  
  console.log("=========LittleParser=========");

  //LittleParser
  (function () {
    var a;

    //whiteSpace
    a = lss("  \t\n  ");
    test(a.space(), "  \t\n  ", "space01");
    
    //assignmentArrow
    a = lss(":= <-");
    test(a.assignmentArrow(), ":=", "assignmentArrow01");
    a.space();
    test(a.assignmentArrow(), "<-", "assignmentArrow02")

    //literal
    a = lss("-12.15'foo'#symbol123#(1 2 #(3))#{#a: 1,#b: #{#a: #()}}");
    test((function () {
      return a.literal() + a.literal() + a.literal() + a.literal() + a.literal();
    })(), "-12.15'foo''symbol123'[1, 2, [3]]{'a': 1,'b': {'a': []}}", "literal01");
    
    a = lss("-12.15'foo'#symbol123#(1 2 #(3))#{#a: 1,#b: #{#a: #()}}");
    test((function () {
      return a.numberLiteral() +
          a.stringLiteral() +
          a.symbolLiteral() +
          a.arrayLiteral() +
          a.hashLiteral();
    })(), "-12.15'foo''symbol123'[1, 2, [3]]{'a': 1,'b': {'a': []}}", "literal02");

    //newlines inside strings
    test(
      lss("'1\n2\n3'").stringLiteral(),
      "'1\\n2\\n3'",
      'newlines in strings'
    );

    //backslash escaping
    test(
      lss("'Foo\\'s name:\\nMike'").stringLiteral(),
      "'Foo\\'s name:\\nMike'",
      "backslash escaping"
    );

    //variable
    a = lss("ab123scdh$_jags#ahj[]");
    test(a.variable(), "ab123scdh$_jags", "variable01");
        
    //keywordSelector
    a = lss("ah_$akd12:foooo");
    test(a.keywordSelector(), "ah_$akd12:", "keywordSelector01");
    
    //unarySelector
    a = lss("fooo fooo:");
    test(a.unarySelector(), "fooo", "unarySelector01");
    a.space();
    try {
      a.unarySelector();
      log(false, "unarySelector02");
    } catch(e) {}
    
    //skipSpace
    a = lss('   "comment  "  ');
    a.skipSpace()
    test(a.index, '   "comment  "  '.length, "skipSpace01");
  })();

  console.log("=========BlockParser=========");

  /* BlockParser */
  (function () {
    var a;
    
    //block
    a = lss("[] [1] [:foo| foo] [:foo||bar|foo.bar]");
    test((function () {
      return a.many(function () {
        a.skipSpace();
        return a.block() + "; ";
      });
    })(), "function () { return null; }; function () { return 1; }; function (foo) { return foo; }; function (foo) { var bar; foo; return bar; }; ", "block01");
    
    //blockParameters
    a = lss(" :foo  :bar :baz");
    test(a.blockParameters(), "foo, bar, baz", "blockParameters01");
    
    //blockHead
    a = lss(":foo :bar | 123");
    test(a.blockHead(), "foo, bar", "blockHead01");
  })();

  console.log("=========Expression=========");

  //Expression
  (function () {
    var a;
    
    //expression
    test(lss("foo := a kw: b + c sel").expression(), "foo = a.kw((b + c.sel()))", "expression01");
    test(lss("b + a kw: c sel").expression(), "(b + a).kw(c.sel())", "expression02");
    test(lss("c sel + b kw: a").expression(), "(c.sel() + b).kw(a)", "expression03");
    
    //assignments
    test(lss("foo := bar := 1").assignments(), "foo = bar = ", "assignments01");
    
    //cascade
    test(
      lss("Object new ; foo ; bar: 1").cascade(), 
      "(function () { var _receiver = new Object(); _receiver.foo();_receiver.bar(1); return _receiver;  })()", 
      "cascade01"
    );

    //simpleExpression
    test(lss("b + a kw: c sel").simpleExpression(), "(b + a).kw(c.sel())", "simpleExpression01");
    
    //primaryReceiver
    test(lss("1").primaryReceiver(), "1", "primaryReceiver01");
    test(lss("1 to: 5").primaryReceiver(), "(1)", "primaryReceiver02");
    test(lss("[]").primaryReceiver(), "function () { return null; }", "primaryReceiver03");
    test(lss("[] tryCatch: []").primaryReceiver(), "(function () { return null; })", "primaryReceiver04");
    //primitive
    test(lss("<alert(1)>").primaryReceiver(), "alert(1)", "primitive01");

    //optimization in cascade
    test(
      lss("Object new ; at:#a put:1 ; at:#b put: 2").cascade(),
      "(function () { var _receiver = new Object(); _receiver.a = 1;_receiver.b = 2; return _receiver;  })()",
      "cascade optimization"
    );
    
  })();

  console.log("=========Statement=========");

  //Statement
  (function () {
    var a;
    
    //statement
    test(lss("1").statement(), "return 1;", "statement01");
    test(lss("1.").statement(), "return 1;", "statement02");
    test(lss("a foo. b bar: 1 . c * 2").statement(), "a.foo(); b.bar(1); return (c * 2);", "statement03");
    test(lss("| foo | foo := 1 . foo").statement(), "var foo; foo = 1; return foo;", "statement04");

    //variableDeclaration
    test(lss("| foo bar baz |").variableDeclaration(), "var foo, bar, baz; ", "variableDeclaration01");

  })();

  console.log("=========Class=========");

  //Class
  (function () {
    //classHeader
    test(
      lss('Animal subclass: #Snake variables: #(#name #color)').classHeader(),
      'var Snake;\nSnake = function () { this.name = null; this.color = null; if (this.init) { this.init.apply(this, arguments); } };\nSnake.__super = Animal.prototype;\nSnake.prototype = new Animal()',
      'classHeader01'
    );

    //instanceMethod
    test(
      lss('!Snake setName: name myName := name. name!').instanceMethod(),
      'Snake.prototype.setName = function (name) { var _this = this; myName = name; return name; }',
      'instanceMethod01'
    );

  })();

  console.log("=========LittleSmallscript=========");

  //LittleSmallscript
  (function () {
    test(lss("1").toJS({prettyprint:false}), '(function () { "use strict"; return 1; }).call(this);', "toJS01");

  })();

  if (errors.length === 0) console.log("ALL GREEN");
}).call(this);

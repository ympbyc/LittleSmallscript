echo packrat &&
node ../../bin/main.js -c packrat.st &&

echo littleparser &&
node ../../bin/main.js -c littleparser.st &&

echo expression &&
node ../../bin/main.js -c expression.st &&

echo blockparser &&
node ../../bin/main.js -c block.st &&

echo class &&
node ../../bin/main.js -c class.st &&

echo statement &&
node ../../bin/main.js -c statement.st &&

echo optimization &&
node ../../bin/main.js -c optimization.st &&

echo littlesmallscript &&
node ../../bin/main.js -c littlesmallscript.st

mv *.js ../js/development/

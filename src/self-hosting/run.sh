echo packrat &&
node ../main.js -c packrat.st &&
echo littleparser &&
node ../main.js -c littleparser.st &&
echo blockparser &&
node ../main.js -c blockparser.st &&
echo expression &&
node ../main.js -c expression.st &&
echo statement &&
node ../main.js -c statement.st &&
echo optimization &&
node ../main.js -c optimization.st &&
echo littlesmallscript &&
node ../main.js -c littlesmallscript.st &&

node littlesmallscript.js
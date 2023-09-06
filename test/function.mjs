const foo = { bar() { } }
// translate foo.bar() => foo:bar()
foo.bar()
foo.map(e => { return e.name })
foo.map(e => e.name)
foo.map(function (e) { return e.name })
const func1 = (x = 1, y = 2, ...args) => [x, y, ...args]

function func2(x = [], y = {}, ...args) {
  return { x, y, ...args }
}

// first uppercase is treated as class
function Echo(x = 1, y = 2, ...args) {
  this.x = x
  this.y = y
  this.args = args
}
// xx.prototype.yy => xx:yy
Echo.prototype.echoX = function () {
  console.log(this.x)
}
Echo.prototype.echoY = function () {
  console.log(this.y)
}
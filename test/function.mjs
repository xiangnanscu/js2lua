const foo = { bar() { } }
// translate foo.bar() => foo:bar()
foo.bar()

const func1 = (x = 1, y = 2, ...args) => [x, y, ...args]

function func2(x = 1, y = 2, ...args) {
  return { x, y, ...args }
}

// first uppercase is treated as class
function Echo(x = 1, y = 2, ...args) {
  this.x = x
  this.y = y
  this.args = args
}
Echo.prototype.echoX = function () {
  console.log(this.x)
}
Echo.prototype.echoY = function () {
  console.log(this.y)
}
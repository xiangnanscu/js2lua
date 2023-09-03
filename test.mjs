class Position {
  static insCount = 0
  start = true
  end = false;
  constructor(name, x = 1, y = 2, ...args) {
    Position.insCount++
    this.name = name
    this.x = x
    this.y = y
    this.args = args
  }
  static echoInsCount() {
    console.log(this.insCount)
  }
  echoPosition() {
    console.log(this.name, this.x, this.y)
  }
  echoArgsLength(...arr) {
    console.log('args length:', this.name, this.args.length, arr.length)
  }
  say(s = 'haha') {
    console.log(`${this.name} say: ${s}, ${this.args[1]}`)
  }
}
const p1 = new Position('p1', 1, 2, 3, 4)
Position.echoInsCount()
const p2 = new Position('p2', 10, 20, 30, 40)
Position.echoInsCount()
p1.echoPosition()
p2.echoPosition()
p1.say('hello')
p1.say.call(p2)
p1.echoArgsLength('a', 'b', 'c')
p1.echoArgsLength.apply(p2, [1, 2])
const a = () => 1
console.log(a?.())
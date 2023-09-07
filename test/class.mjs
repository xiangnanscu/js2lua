class BasePosition {
  say(word = 'base haha') {
    console.log(`Base say: ${word}`)
  }
}
class Position extends BasePosition {
  static insCount = 0
  start = 0
  end = 1;
  constructor(name, x = 1, y = 2, ...numbers) {
    super()
    Position.insCount++
    this.name = name
    this.x = x
    this.y = y
    this.numbers = numbers
  }
  static echoInsCount() {
    console.log(this.insCount)
  }
  echoPosition() {
    console.log(this.name, this.x, this.y)
  }
  echoNumbersLength() {
    console.log('numbers length:', this.name, this.numbers.length)
  }
  say(word = 'haha') {
    super.say(word)
    console.log(`${this.name} say: ${word}, first number is ${this.numbers[0]}`)
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
p1.echoNumbersLength('a', 'b', 'c')
p1.echoNumbersLength.apply(p2, [1, 2])
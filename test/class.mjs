class Position {
  static insCount = 0
  start = 0
  end = 1;
  constructor(name, x = 1, y = 2, ...numbers) {
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
    console.log(`${this.name} say: ${word}, first number is ${this.numbers[0]}`)
  }
}
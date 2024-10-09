const { a, b: bAlias, ...rest } = { a: 1, b: 2, c: 3, d: 4 }
const [x, y, ...others] = [1, 2, 3, 4]
for (i = 0; i < 10; i = i + 2) {
  if (i % 2) {
    continue;
  }
  print(1);
}
// class
class Child extends Parent {
  static myMethod(msg) {
    super.myMethod(msg);
  }
  constructor(x, y) {
    super(x);
    this.y = y;
  }
  myMethod(msg) {
    super.myMethod(msg);
  }
}
// calling a function expression
(() => print(1))();


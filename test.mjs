// 父类
function Parent(name) {
  this.name = name;
}

Parent.prototype.sayHello = function () {
  console.log('Hello, ' + this.name + '!');
};

// 子类
function Child(name, age) {
  Parent.call(this, name); // 调用父类构造函数
  this.age = age;
}

// 子类继承父类
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayAge = function () {
  console.log('I am ' + this.age + ' years old.');
};

// 创建子类的实例
var childInstance = new Child('Alice', 10);

// 调用父类的方法
childInstance.sayHello(); // 输出: Hello, Alice!

// 调用子类的方法
childInstance.sayAge(); // 输出: I am 10 years old.

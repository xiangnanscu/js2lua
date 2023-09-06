// lua keywords
const Obj = { and: 'real' }

Obj.prototype.f1 = function () { }
Obj.prototype.end = function () { }
print(Obj.end)

const arr = [true, false]
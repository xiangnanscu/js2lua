const obj = {}
let a = 1
typeof a
print(a instanceof obj)
const x = a ? 1 : 2
a = !!a
const k = obj?.b;
const o = a?.[k]?.['c']?.e;
obj.func?.(1, ...[1, 2, 3]);
a.b?.c?.();
a ?? 'hello';
obj.n ??= 100;
print(a && x || k)
print(a && (x || k))
a += 1
a -= 1
a *= 1
a /= 1
a %= 1
a &&= k
a ||= k
a >> 2
2 << a
a & 2
a &= 2
a | 2
a |= 2
a ^ 2
a ^= 2
a ** 2
a **= 2
~a
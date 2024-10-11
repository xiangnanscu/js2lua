
// optional
const a = 1, b = 'foo', obj = {}, args = []

// basic
const m = a?.b;

//chain
const o = a?.[b]['c']?.e;

// optional call
obj.func?.(1, ...args);

// chain optional call
a.b?.c.d?.();

// nullish
a ?? 'hello';
a.b() ?? 'hello';
const d = {}
d.n ??= 100;
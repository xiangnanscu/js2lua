
// optional
const a = 1, b = 'foo', obj = {}, args = []
const m = a?.b; // basic
const o = a?.[b]['c']?.e; //chain
obj.func?.(1, ...args); // optional call
a.b?.c.d?.();  // chain optional call
// nullish
a ?? 'hello';
const d = {}
d.n ??= 100;
const foo = 'bar'
const d1 = {
  foo: 1,
  [foo]: 2,
  "k3": 3,
  [5]: 5,
  // "true":7,
  [true]: 6
}
const d2 = { end: 1, end1: 2 }
const d3 = { end: 1, end1: 2, ...d2, and: 3 }
const a = { ["true"]: 1, [true]: 2 }
const d = {
  ...d3,
  foo: 1,
  end() { },
  end2() { },
};

// local a = { ["true"] = 1, [true] = 2 }
// print(a['true'], a[true])
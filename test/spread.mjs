const a = [1, 2, 3]
const d = { x: 1, y: 2, z: 3 }
const [v1, v2, ...v] = [4, 5, ...a]
const { x: k1, y: k2, ...k } = { ...d, foo: 'bar' }
module.exports.a = {}
module.exports['b'] = {}

const c = 1
const d = 2
const e = 3

export default { c }
export { d }
export { e as f }
export const g = 1, h = 2;
export function foo() { }
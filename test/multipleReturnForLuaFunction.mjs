let [ok, res] = pcall(foo)
let [ok2, res2] = xpcall(foo)
let [e1, e2] = unpack(bar)
// comparision
let [ok3, res3] = pcall2(foo)
let [ok4, ...res4] = xpcall(foo)

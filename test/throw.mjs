const test = ''
if (test) {
  throw new Error('!')
}
if (test) {
  throw new CustomError({ message: "custom error" })
}
if (test) {
  throw '!!'
}
if (test) {
  throw { message: 'bare object error' }
}
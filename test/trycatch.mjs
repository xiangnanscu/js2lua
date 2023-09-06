try {
  const res = parseInt('fooo')
  print(res)
} catch (error) {
  // rename error to _err to prevent shadow lua's error function name
  console.log(error)
}

try {
  const res = parseInt('fooo')
  print(res)
} catch (error1) {
  console.log(error1)
}

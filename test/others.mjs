const foo = {}
delete foo.bar
print(foo.length)
const URL_PATTERN = /^https?:\/\/.*?\//

const constraints = {
  'foo': 'baz',
  foo: 'bar',
  ...route.opts.constraints,
  [httpMethodStrategy.name]: route.method
}
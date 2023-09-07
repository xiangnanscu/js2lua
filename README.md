# js2lua
[js2lua](https://xiangnanscu.github.io/js2lua/)
Writing LuaJIT with the expressiveness of JavaScript.
# Install
```sh
npm install -g @xiangnanscu/js2lua
```
# Usage
## command
Concat one or more js files and transform them to one lua string:
```sh
js2lua [options] file1, file2, ...
```
where options are:
```js
const defaultOptions = {
  debug: false,
  importStatementHoisting: true,
  transformToString: true,
  transformString: true,
  transformJSONStringify: true,
  transformJSONParse: true,
  transformParseFloat: true,
  transformParseInt: true,
  transformNumber: true,
  transformIsArray: true,
  transformConsoleLog: true,
  moduleExportsToReturn: true,
  index0To1: true,
  tryTranslateClass: true,
  disableUpdateExpressionCallback: true,
  renameCatchErrorIfNeeded: true,
  disableClassCall: true,
};
```
### examples
Basic:
```sh
js2lua foo.js > foo.lua
```
To disable a feature (--no-[option_name]):
```sh
js2lua --no-transformToString foo.js
```
To enable a feature (--[option_name]):
```sh
js2lua --debug foo.js
```
## api
```js
import { js2lua } from 'js2lua';
js2lua(`let a = 1`, {importStatementHoisting:true})
```
# Features
* [assignment](#assignment)
* [class](#class)
* [export](#export)
* [function](#function)
* [if](#if)
* [import](#import)
* [index0To1](#index0To1)
* [keywords](#keywords)
* [loop](#loop)
* [object](#object)
* [operator](#operator)
* [optionalNullish](#optionalNullish)
* [others](#others)
* [spread](#spread)
* [stringTemplate](#stringTemplate)
* [switch](#switch)
* [throw](#throw)
* [transform](#transform)
* [trycatch](#trycatch)
* [updateExpression](#updateExpression)
## assignment
### js
```js
const foo = 1
const object = { o1: 'o1', o2: 'o2' }, array = [1, 2]
// eslint-disable-next-line no-undef
const h1 = h2 = h3 = 'title'
const { a, b: bAlias, ...rest } = { a: 1, b: 2, c: 3, d: 4 }
const [x, y, ...others] = [1, 2, 3, 4]
const e = 1, f = 'a', { o1, o2: o22 } = object, [a1, a2] = array
```
### lua
```lua
local foo = 1
local object = {o1 = "o1", o2 = "o2"}
local array = {1, 2}
local h3 = "title"
local h2 = h3
local h1 = h2
local a, bAlias, rest
do
    local __tmp = {a = 1, b = 2, c = 3, d = 4}
    a = __tmp.a
    bAlias = __tmp.b
    rest = {}
    for k, v in pairs(__tmp) do
        if k ~= "a" and k ~= "b" then
            rest[k] = v
        end
    end
end
local x, y, others
do
    local __tmp = {1, 2, 3, 4}
    x = __tmp[1]
    y = __tmp[2]
    others = {}
    for i = 3, #__tmp do
        others[#others + 1] = __tmp[i]
    end
end
local e = 1
local f = "a"
local o1, o22
do
    local __tmp = object
    o1 = __tmp.o1
    o22 = __tmp.o2
end
local a1, a2
do
    local __tmp = array
    a1 = __tmp[1]
    a2 = __tmp[2]
end

```
## class
### js
```js
class Position {
  static insCount = 0
  start = 0
  end = 1;
  constructor(name, x = 1, y = 2, ...numbers) {
    Position.insCount++
    this.name = name
    this.x = x
    this.y = y
    this.numbers = numbers
  }
  static echoInsCount() {
    console.log(this.insCount)
  }
  echoPosition() {
    console.log(this.name, this.x, this.y)
  }
  echoNumbersLength() {
    console.log('numbers length:', this.name, this.numbers.length)
  }
  say(word = 'haha') {
    console.log(`${this.name} say: ${word}, first number is ${this.numbers[0]}`)
  }
}

const p1 = new Position('p1', 1, 2, 3, 4)
Position.echoInsCount()
const p2 = new Position('p2', 10, 20, 30, 40)
Position.echoInsCount()
p1.echoPosition()
p2.echoPosition()
p1.say('hello')
p1.say.call(p2)
p1.echoNumbersLength('a', 'b', 'c')
p1.echoNumbersLength.apply(p2, [1, 2])
```
### lua
```lua
local Position =
    setmetatable(
    {},
    {
        __call = function(t, name, x, y, ...)
            local self = t:new()
            self:constructor(name, x, y, ...)
            return self
        end
    }
)
Position.__index = Position
Position.insCount = 0
function Position.new(cls)
    return setmetatable({start = 0, ["end"] = 1}, cls)
end
function Position:constructor(name, x, y, ...)
    if x == nil then
        x = 1
    end
    if y == nil then
        y = 2
    end
    local numbers = {...}
    Position.insCount = Position.insCount + 1
    self.name = name
    self.x = x
    self.y = y
    self.numbers = numbers
end
function Position:echoInsCount()
    print(self.insCount)
end
function Position:echoPosition()
    print(self.name, self.x, self.y)
end
function Position:echoNumbersLength()
    print("numbers length:", self.name, #self.numbers)
end
function Position:say(word)
    if word == nil then
        word = "haha"
    end
    print(string.format([=[%s say: %s, first number is %s]=], self.name, word, self.numbers[1]))
end
local p1 = Position("p1", 1, 2, 3, 4)
Position:echoInsCount()
local p2 = Position("p2", 10, 20, 30, 40)
Position:echoInsCount()
p1:echoPosition()
p2:echoPosition()
p1:say("hello")
p1.say(p2)
p1:echoNumbersLength("a", "b", "c")
p1.echoNumbersLength(p2, unpack({1, 2}))

```
## export
### js
```js
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
```
### lua
```lua
local _M = {}

local c = 1
local d = 2
local e = 3
local g = 1
local h = 2
local function foo()
end
_M.a = {}
_M["b"] = {}
_M.default = {c = c}
_M.d = d
_M.f = e
_M.g = g
_M.h = h
_M.foo = foo
return _M

```
## function
### js
```js
const foo = { bar() { } }
// translate foo.bar() => foo:bar()
foo.bar()
foo.map(e => { return e.name })
foo.map(e => e.name)
foo.map(function (e) { return e.name })
const func1 = (x = 1, y = 2, ...args) => [x, y, ...args]

function func2(x = [], y = {}, ...args) {
  return { x, y, ...args }
}

// first uppercase is treated as class
function Echo(x = 1, y = 2, ...args) {
  this.x = x
  this.y = y
  this.args = args
}
// xx.prototype.yy => xx:yy
Echo.prototype.echoX = function () {
  console.log(this.x)
}
Echo.prototype.echoY = function () {
  console.log(this.y)
}
```
### lua
```lua
local foo = {bar = function()
    end}
foo:bar()
foo:map(
    function(e)
        return e.name
    end
)
foo:map(
    function(e)
        return e.name
    end
)
foo:map(
    function(e)
        return e.name
    end
)
local func1 = function(x, y, ...)
    if x == nil then
        x = 1
    end
    if y == nil then
        y = 2
    end
    local args = {...}
    return (function()
        local __tmp = {}
        __tmp[#__tmp + 1] = x
        __tmp[#__tmp + 1] = y
        for _, v in ipairs(args) do
            __tmp[#__tmp + 1] = v
        end
        return __tmp
    end)()
end
local function func2(x, y, ...)
    if x == nil then
        x = {}
    end
    if y == nil then
        y = {}
    end
    local args = {...}
    return (function()
        local __tmp = {}
        __tmp.x = x
        __tmp.y = y
        for k, v in pairs(args) do
            __tmp[k] = v
        end
        return __tmp
    end)()
end
local Echo =
    setmetatable(
    {},
    {
        __call = function(t, x, y, ...)
            local self = t:new()
            self:constructor(x, y, ...)
            return self
        end
    }
)
Echo.__index = Echo
function Echo.new(cls)
    return setmetatable({}, cls)
end
function Echo:constructor(x, y, ...)
    if x == nil then
        x = 1
    end
    if y == nil then
        y = 2
    end
    local args = {...}
    self.x = x
    self.y = y
    self.args = args
end
function Echo:echoX()
    print(self.x)
end
function Echo:echoY()
    print(self.y)
end

```
## if
### js
```js
const a = 1
if (a === 1) {
  print(a)
}
if (a) {
  print(a)
}
if (!a) {
  print(a)
}
if (a === 1) {
  print(a)
} else {
  print(2)
}

if (a === 1) {
  print(a)
} else if (a == 2) {
  print(2)
} else {
  print(3)
}
```
### lua
```lua
local a = 1
if a == 1 then
    print(a)
end
if a then
    print(a)
end
if not a then
    print(a)
end
if a == 1 then
    print(a)
else
    print(2)
end
if a == 1 then
    print(a)
else
    if a == 2 then
        print(2)
    else
        print(3)
    end
end

```
## import
### js
```js
import g from "bar"
import { foo } from "bar"
import { a as b } from "bar"
import * as c from "bar"
import d, { e as eAlias, f } from "bar"
```
### lua
```lua
local g = require("bar").default
local foo = require("bar").foo
local b = require("bar").a
local c = require("bar")
local d, eAlias, f
do
    local _esModule = require("bar")
    d = _esModule.default
    eAlias = _esModule.e
    f = _esModule.f
end

```
## index0To1
### js
```js
const a = []
const i = a[0]
```
### lua
```lua
local a = {}
local i = a[1]

```
## keywords
### js
```js
// lua keywords
const Obj = { and: 'real' }

Obj.prototype.f1 = function () { }
Obj.prototype.end = function () { }
print(Obj.end)

const arr = [true, false]
```
### lua
```lua
local Obj = {["and"] = "real"}
function Obj:f1()
end
Obj["end"] = function(self)
end
print(Obj["end"])
local arr = {true, false}

```
## loop
### js
```js
const arr = []
for (let i = 0; i <= arr.length; i++) {
  print(i)
}

for (const e of arr) {
  print(e)
  break
}
for (const [a, b] of arr) {
  if (b === 1) {
    continue
  }
  print(a)
}

for (const key in arr) {
  print(key)
}

while (1) {
  print('a')
}


```
### lua
```lua
local arr = {}
do
    local i = 0
    while i <= #arr do
        print(i)
        (function()
            i = i + 1
            return i
        end)()
    end
end
for _, e in ipairs(arr) do
    print(e)
    break
end
for _, esPairs in ipairs(arr) do
    local a, b = unpack(esPairs)
    if b == 1 then
        goto continue
    end
    print(a)
    ::continue::
end
for key, __ in pairs(arr) do
    print(key)
end
while 1 do
    print("a")
end

```
## object
### js
```js
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

// local a = { ["true"] = 1, [true] = 2 }
// print(a['true'], a[true])
```
### lua
```lua
local foo = "bar"
local d1 = {foo = 1, [foo] = 2, ["k3"] = 3, [5] = 5, [true] = 6}
local d2 = {["end"] = 1, end1 = 2}
local d3 = (function()
    local __tmp = {}
    __tmp["end"] = 1
    __tmp.end1 = 2
    for k, v in pairs(d2) do
        __tmp[k] = v
    end
    __tmp["and"] = 3
    return __tmp
end)()
local a = {["true"] = 1, [true] = 2}

```
## operator
### js
```js
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
```
### lua
```lua
local bit = require("bit")

local obj = {}
local a = 1
type(a)
print(getmetatable(a) == obj)
local x = (function()
    if a then
        return 1
    else
        return 2
    end
end)()
a = not (not a)
local k = (function()
    if obj == nil then
        return nil
    else
        return obj.b
    end
end)()
local o = (function()
    if a == nil then
        return nil
    elseif a[k] == nil then
        return nil
    elseif a[k]["c"] == nil then
        return nil
    else
        return a[k]["c"].e
    end
end)()
(function()
    local _fn = obj.func
    if _fn == nil then
        return nil
    elseif type(_fn) ~= "function" then
        error("obj.func is not a function")
    else
        return obj:func(1, unpack({1, 2, 3}))
    end
end)()
(function()
    local _fn = (function()
        if a.b == nil then
            return nil
        else
            return a.b.c
        end
    end)()
    if _fn == nil then
        return nil
    elseif type(_fn) ~= "function" then
        error("a.b.c is not a function")
    else
        return a.b.c()
    end
end)()
(function()
    if a == nil then
        return "hello"
    else
        return a
    end
end)()
obj.n = (function()
    if obj.n == nil then
        return 100
    else
        return obj.n
    end
end)()
print(a and x or k)
print(a and (x or k))
a = a + 1
a = a - 1
a = a * 1
a = a / 1
a = a % 1
a = a and k
a = a or k
bit.rshift(a, 2)
bit.lshift(2, a)
bit.band(a, 2)
a = bit.band(a, 2)
bit.bor(a, 2)
a = bit.bor(a, 2)
bit.bxor(a, 2)
a = bit.bxor(a, 2)
math.pow(a, 2)
a = math.pow(a, 2)
bit.bnot(a)

```
## optionalNullish
### js
```js

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
const d = {}
d.n ??= 100;
```
### lua
```lua
local a = 1
local b = "foo"
local obj = {}
local args = {}
local m = (function()
    if a == nil then
        return nil
    else
        return a.b
    end
end)()
local o = (function()
    if a == nil then
        return nil
    elseif a[b]["c"] == nil then
        return nil
    else
        return a[b]["c"].e
    end
end)()
(function()
    local _fn = obj.func
    if _fn == nil then
        return nil
    elseif type(_fn) ~= "function" then
        error("obj.func is not a function")
    else
        return obj:func(1, unpack(args))
    end
end)()
(function()
    local _fn = (function()
        if a.b == nil then
            return nil
        else
            return a.b.c.d
        end
    end)()
    if _fn == nil then
        return nil
    elseif type(_fn) ~= "function" then
        error("a.b.c.d is not a function")
    else
        return a.b.c.d()
    end
end)()
(function()
    if a == nil then
        return "hello"
    else
        return a
    end
end)()
local d = {}
d.n = (function()
    if d.n == nil then
        return 100
    else
        return d.n
    end
end)()

```
## others
### js
```js
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
```
### lua
```lua
local foo = {}
foo.bar = nil
print(#foo)
local URL_PATTERN = [=[^https?:\/\/.*?\/]=]
local constraints = (function()
    local __tmp = {}
    __tmp["foo"] = "baz"
    __tmp.foo = "bar"
    for k, v in pairs(route.opts.constraints) do
        __tmp[k] = v
    end
    __tmp[httpMethodStrategy.name] = route.method
    return __tmp
end)()

```
## spread
### js
```js
const a = [1, 2, 3]
const d = { x: 1, y: 2, z: 3 }
const [v1, v2, ...v] = [4, 5, ...a]
const { x: k1, y: k2, ...k } = { ...d, foo: 'bar' }
```
### lua
```lua
local a = {1, 2, 3}
local d = {x = 1, y = 2, z = 3}
local v1, v2, v
do
    local __tmp = (function()
        local __tmp = {}
        __tmp[#__tmp + 1] = 4
        __tmp[#__tmp + 1] = 5
        for _, v in ipairs(a) do
            __tmp[#__tmp + 1] = v
        end
        return __tmp
    end)()
    v1 = __tmp[1]
    v2 = __tmp[2]
    v = {}
    for i = 3, #__tmp do
        v[#v + 1] = __tmp[i]
    end
end
local k1, k2, k
do
    local __tmp = (function()
        local __tmp = {}
        for k, v in pairs(d) do
            __tmp[k] = v
        end
        __tmp.foo = "bar"
        return __tmp
    end)()
    k1 = __tmp.x
    k2 = __tmp.y
    k = {}
    for k, v in pairs(__tmp) do
        if k ~= "x" and k ~= "y" then
            k[k] = v
        end
    end
end

```
## stringTemplate
### js
```js
const foo = 5
const s = `1.${2}.3.${'4'}.${foo}`
```
### lua
```lua
local foo = 5
local s = string.format([=[1.%s.3.%s.%s]=], 2, "4", foo)

```
## switch
### js
```js
const c = 'v2'

switch (c) {
  case 'v1':
    print(1)
    break;
  default:
    break;
}

switch (c) {
  case 'v1':
    print(1)
    break
  case 'v2':
  case 'v3':
    print(2)
    break
  default:
    break;
}
```
### lua
```lua
local c = "v2"
repeat
    local caseExp = c
    if caseExp == "v1" then
        print(1)
        break
    else
        break
    end
until (false)
repeat
    local caseExp = c
    if caseExp == "v1" then
        print(1)
        break
    elseif caseExp == "v2" or caseExp == "v3" then
        print(2)
        break
    else
        break
    end
until (false)

```
## throw
### js
```js
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
```
### lua
```lua
local test = ""
if test then
    error("!")
end
if test then
    error({message = "custom error"})
end
if test then
    error("!!")
end
if test then
    error({message = "bare object error"})
end

```
## transform
### js
```js
const a = { b: '' }
String(1)
a.b.toString()
JSON.stringify({})
JSON.parse('{}')
Number('2')
parseInt('2')
parseFloat('1')
Array.isArray(1)
```
### lua
```lua
local isarray = require("table.isarray")
local cjson = require("cjson")

local a = {b = ""}
tostring(1)
tostring(a.b)
cjson.encode({})
cjson.decode("{}")
tonumber("2")
math.floor("2")
tonumber("1")
isarray(1)

```
## trycatch
### js
```js
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

```
### lua
```lua
local ok, _err =
    pcall(
    function()
        local res = math.floor("fooo")
        print(res)
    end
)
if not ok then
    print(_err)
end
local ok, error1 =
    pcall(
    function()
        local res = math.floor("fooo")
        print(res)
    end
)
if not ok then
    print(error1)
end

```
## updateExpression
### js
```js
// NOTE: both i++ and ++i means ++i to lua, don't use i++ in expression context!
// in statement context, use i = i ? 1
i++;
--i;
// otherwise use a callback
let a = --i
let b = i++
if (--i) {
  print(i)
}


```
### lua
```lua
i = i + 1
i = i - 1
local a = (function()
    i = i - 1
    return i
end)()
local b = (function()
    i = i + 1
    return i
end)()
if (function()
        i = i - 1
        return i
    end)() then
    print(i)
end

```
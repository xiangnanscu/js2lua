<script setup>
import { ref, computed, watch } from "vue";
import { js2lua, js2ast } from "./js2lua.mjs";
import fs from "file-saver";

const showjsAst = ref(false);
const optionNamesDict = {
  moduleExportsToReturn: true,
  index0To1: true,
  tryTranslateClass: true,
  selfOperatorToCallback: true,
  consoleLogToPrint: true,
  renameCatchError: true,
  useClassCall: false,
};
const ts = "`1.${2}.3.${bar}`";
const jscode = ref(`
print(1>>2)

`);
const jscode1 = ref(`\
import {e} from "bar"
import {e as g} from "bar"
import * as x from "bar"
import a from "bar"
import d, {a as c, b} from "bar"
let s1 = 1, s2 ='\\n', h1 = h2 = h3 = 1, {j1, j2} = s
delete foo.bar
a ?? 'hello';
let options = {}
options.duration ??= 100;
let m = a?.b;
let n = a?.[b]?.['c']?.end?.e;
a.b?.c?.();
obj.func?.(1, ...args);
print(a[1], a['b'], a[true], a.true, a.true2)
class Position {
  static insCount = 0
  start = true
  end = false;
  constructor(name, x = 1, y = 2, ...args) {
    Position.insCount++
    this.name = name
    this.x = x
    this.y = y
    this.args = args
  }
  static echoInsCount() {
    console.log(this.insCount)
  }
  echoPosition() {
    console.log(this.name, this.x, this.y)
  }
  echoArgsLength(...arr) {
    console.log('args length:', this.name, this.args.length, arr.length)
  }
  say(s = 'haha') {
    console.log(\`\${this.name} say: \${s}, \${this.args[1]}\`)
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
p1.echoArgsLength('a', 'b', 'c')
p1.echoArgsLength.apply(p2, [1, 2])
function Echo(x=1, y=2, ...args) {
  this.x = x
  this.y = y
  this.args = args
}
Echo.prototype.echoX = function() {
  console.log(this.x)
}
Echo.prototype.echoY = function() {
  console.log(this.y)
}
let xx =
undefined
res.end()
print(path[0])
const FULL_PATH_REGEXP = /^https?:\\/\\/.*?\\//
function f1(e={}) {
  return e
}
for (let i = 0; i <= pattern.length; i++) {}
const s = ${ts}
const { version, host, ...rest } = d
let g2 = foo ? 1 : 2
const func1 = (e, ...args)=>[e, ...args]
function func2(e, ...args) {
  return [e, ...args]
}
a.map(e=>{return e.name})
a.map(e=>e.name)
print(a.length)
print(a && b || c)
print(a && (b || c))
const g = [1, ...x2, 'haha', ...x3, true]
print(a.foo, a.true, a['true'])
let x11,x2,x3;
const [r1, r2] = x3, {a:zz1,true:zz2} ={a:1, true:2}, c1 = 3
const constraints = {
  'foo': 'baz',
  foo: 'bar',
  ...route.opts.constraints,
  [httpMethodStrategy.name]: route.method
}
while (1) {
  print('a')
}
let [x1, y1] = [1,2,3]
let k = 'a'
let d1 = {[k]: 'a', k:'b'}
let [a1, b1] = t
if (path[idx] === ')') {
  parentheses--
} else if (path['idx'] !== '(') {
  parentheses++
} else if (n > 1) {
  n++
}
print(i)
try {
  const res =foo()
} catch {
  console.log(error)
}

const fx = function (a) {}
Router.prototype.foo = function (x=[], ...y) {
  return [x, ...y]
}
const f2 = typeof 2
const f = new C({x:1, y:2})
const {k1, k2: v} = e
if (false) {
  throw new Error('!')
}
if (false) {
  throw new CustomError({message:"haha"})
}
if (false) {
  throw '!!'
}
if (false) {
  throw {K:2}
}
class C {
  a = 1;
  constructor(c, b) {
    this.c = c
    this.b = b
  }
  static boo() {
    print(1)
    return this.a
  }
  foo(...rest) {
    return [this.a, ...rest]
  }
}
for (const e of arr) {
  print(e)
  break
}
for (const [a, b] of arr) {
  print(a, b)
  continue
}
for (const key in object) {
  print(key)
}
function foo(x,b) {
  const a = 1
  return a
}
print(a && (b||c))
const a = 1 , b= 'x', c = true, d = {k:1,[k]:2}, e = [1]
if (a) {
  f()
}
if (a) {
  f()
} else if (b) {
  f()
} else if (c) {
  f()
} else {
  f()
}
if (!(this instanceof Router)) {
  foo()
} else {
  bar()
}
a += 1
a -= 1
a *= 1
a /= 1
a %= 1
a &&= b
a ||= b
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
`);

const optionNames = Object.keys(optionNamesDict);
const selectNames = ref(
  Object.entries(optionNamesDict)
    .filter(([k, v]) => v)
    .map(([k, v]) => k)
);
const selectOptions = computed(() => Object.fromEntries(selectNames.value.map((e) => [e, true])));
const luacode = computed(() => {
  return js2lua(jscode.value, selectOptions.value);
  // try {
  //   return js2lua(jscode.value, selectOptions.value);
  // } catch (error) {
  //   console.error(error);
  //   return "--" + error.message;
  // }
});

const jsast = computed(() => js2ast(jscode.value, selectOptions.value));
function copylua() {
  CopyToClipboard("luacode");
}
function saveluaAs() {
  fs.saveAs(new Blob([luacode.value]), "test.lua");
}
function CopyToClipboard(containerid) {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    // IE?
    document.selection.empty();
  }

  if (document.selection) {
    const range = document.body.createTextRange();
    range.moveToElementText(document.getElementById(containerid));
    range.select().createTextRange();
    document.execCommand("copy");
  } else if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(document.getElementById(containerid));
    window.getSelection().addRange(range);
    document.execCommand("copy");
  }
}
const checkAll = ref(false);
watch(checkAll, (checkAll) => {
  if (checkAll) {
    selectNames.value = [...optionNames];
  } else {
    selectNames.value = [];
  }
});
</script>

<template>
  <div>
    <div class="row">
      <div class="col"></div>
    </div>
    <div class="row">
      <div class="col-1">
        <div :class="{ 'error-wrapper': error }">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="label-all" v-model="checkAll" />
            <label class="form-check-label" for="label-all" style="color: red"> all </label>
          </div>
          <div v-for="(c, i) of optionNames" :key="i" :class="{ 'form-check': true }">
            <input class="form-check-input" type="checkbox" :id="`label` + i" v-model="selectNames" :value="c" />
            <label class="form-check-label" :for="`label` + i">
              {{ c }}
            </label>
          </div>
        </div>
      </div>
      <div class="col-3">
        <button @click="jscode = ''">clear textarea</button>
        <textarea
          rows="10"
          style="height: 800px"
          class="form-control"
          :value="jscode"
          @input="jscode = $event.target.value"
        ></textarea>
      </div>
      <div class="col">
        <div class="form-check-inline">
          <label class="form-check-label">
            <input @input="showjsAst = !showjsAst" :value="showjsAst" type="checkbox" class="form-check-input" />show js
            ast</label
          >
        </div>
        <div v-if="showjsAst">
          <pre>{{ jsast }}</pre>
        </div>
        <div v-else>
          <highlightjs language="javascript" :code="jscode" />
        </div>
      </div>
      <div class="col">
        <button @click="copylua">copy lua</button>
        <button @click="saveluaAs">save as</button>
        <highlightjs id="luacode" language="lua" :code="luacode" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap.scss";
span.hljs-string {
  color: #22863a;
}
.col {
  overflow: scroll;
}
</style>

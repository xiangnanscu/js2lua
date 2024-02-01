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
To disable a feature `--no-[option]`:
```sh
js2lua --no-transformToString foo.js
```
To enable a feature `--[option]`:
```sh
js2lua --debug foo.js
```
## api
```js
import { js2lua } from 'js2lua';
js2lua(`let a = 1`, {importStatementHoisting:true})
```
## see also
[lua2js](https://xiangnanscu.github.io/lua2js/) transform lua to js

# Features
[CODE_TABLE]
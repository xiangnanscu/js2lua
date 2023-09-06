# js2lua
[js2lua](https://xiangnanscu.github.io/js2lua/)
Writing LuaJIT with the expressiveness of JavaScript.
# Install
```sh
npm install -g @xiangnanscu/js2lua
```
# Usage
## command
concat one or more js files and transform them to one lua string
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
  selfOperatorToCallback: true,
  renameCatchErrorIfNeeded: true,
  disableClassCall: true,
};
```
### examples
### basic:
```sh
js2lua foo.js > foo.lua
```
### to disable a feature (--no-[option_name]):
```sh
js2lua --no-transformToString foo.js
```
### to enable a feature:
```sh
js2lua --debug foo.js
```
## api
```js
import { js2lua } from 'js2lua';
js2lua(`let a = 1`, {importStatementHoisting:true})
```
# Features
[CODE_TABLE]
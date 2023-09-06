import fs from 'fs';
import path from 'path';
import { js2lua, js2ast } from "./src/js2lua.mjs";

const folderPath = './test';

const markdown = fs.readFileSync('./README.template.md', 'utf8');
const files = fs.readdirSync(folderPath);
const opts = {
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
}
const res = []
for (const file of files) {
  if (path.extname(file) === '.mjs') {
    const filePath = path.join(folderPath, file);
    const name = filePath.match(/\/(\w+)\.mjs$/)[1];
    res.push(`* [${name}](#${name})`)
  }
}
for (const file of files) {
  if (path.extname(file) === '.mjs') {
    const filePath = path.join(folderPath, file);
    const name = filePath.match(/\/(\w+)\.mjs$/)[1];
    const jscode = fs.readFileSync(filePath, 'utf8');
    const luacode = js2lua(jscode, opts)
    res.push(`## ${name}\n` + '### js\n```js\n' + jscode + '\n```')
    res.push('### lua\n```lua\n' + luacode + '\n```')
    // res.push('<tr>\n<td>\n' + filePath.split('/').pop() + '\n</td>\n<td>\n\n```js\n' + jscode + '\n```\n</td>\n<td>\n\n```lua\n' + luacode + '\n```\n</td>\n</tr>')
  }
  // break
}

const content = markdown.replace('[CODE_TABLE]', res.join('\n'))
// console.log(content)
fs.writeFileSync('./README.md', content, 'utf8')

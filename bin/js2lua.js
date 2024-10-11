#!/usr/bin/env node

import { js2lua, defaultOptions } from "../src/js2lua.mjs";
import fs from "fs";
import yargsParser from "yargs-parser";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const packageJson = require(join(__dirname, '..', 'package.json'));
const version = packageJson.version;

const helpMessage = `
Usage: js2lua [options] <file...>

Options:
  -h, --help     Show help information
  -v, --version  Show version information

Default options:
${Object.entries(defaultOptions).map(([key, value]) => {
  const padding = Math.max(0, 35 - key.length);
  return `  --${key}${' '.repeat(padding)}${value}`;
}).join('\n')}

To disable an option, use the --no- prefix. For example:
  js2lua --no-debug foo.js

Option descriptions:
  --debug                                Enable debug mode, print more information
  --tagArrayExpression                   transform [] to array {} instead of {}
  --useColonOnMethod                     Use colon for method callsf
  --importStatementHoisting              Hoist import statements
  --transform$SymbolToDollar             Transform $ symbol to _DOLLAR_
  --transformToString                    Transform toString method
  --transformString                      Transform String constructor
  --transformJSONStringify               Transform JSON.stringify
  --transformJSONParse                   Transform JSON.parse
  --transformParseFloat                  Transform parseFloat
  --transformParseInt                    Transform parseInt
  --transformNumber                      Transform Number constructor
  --transformIsArray                     Transform Array.isArray
  --transformConsoleLog                  Transform console.log
  --moduleExportsToReturn                Convert module.exports to return statement
  --index0To1                            Change index from 0-based to 1-based
  --tryTranslateClass                    Attempt to translate classes
  --disableUpdateExpressionCallback      Disable update expression callback
  --renameCatchErrorIfNeeded             Rename catch error if needed
  --disableClassCall                     Disable class calls
`;

const argv = yargsParser(process.argv.slice(2), {
  boolean: Object.keys(defaultOptions),
  alias: {
    h: "help",
    v: "version"
  },
});

if (argv.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (argv.version) {
  console.log(`js2lua version ${version}`);
  process.exit(0);
}

const files = argv._;

if (files.length === 0) {
  console.error("Error: Please specify at least one input file");
  console.log("Use --help to see help information");
  process.exit(1);
}

files.forEach((file) => {
  const jsCode = fs.readFileSync(file, "utf8");
  const luaCode = js2lua(jsCode, argv);
  console.log(luaCode);
});

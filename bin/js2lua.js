#!/usr/bin/env node

import { js2lua } from "../src/js2lua.mjs";
import fs from "fs";
import yargsParser from "yargs-parser";

const argv = yargsParser(process.argv.slice(2), {
  boolean: [
    "debug",
    "importStatementHoisting",
    "transformToString",
    "transformString",
    "transformJSONStringify",
    "transformJSONParse",
    "transformParseFloat",
    "transformParseInt",
    "transformNumber",
    "transformIsArray",
    "transformConsoleLog",
    "moduleExportsToReturn",
    "index0To1",
    "tryTranslateClass",
    "selfOperatorToCallback",
    "renameCatchErrorIfNeeded",
    "disableClassCall",
  ],
  alias: {
    // o1: "option1",
  },
});

const files = argv._;
// console.log(argv);
files.forEach((file) => {
  const jsCode = fs.readFileSync(file, "utf8");
  const luaCode = js2lua(jsCode, argv);
  console.log(luaCode);
});

#!/usr/bin/env node

import { js2lua } from '../src/js2lua.mjs';
import fs from 'fs';
import yargsParser from 'yargs-parser';

const argv = yargsParser(process.argv.slice(2), {
  boolean: ['option1', 'option2'],
  alias: {
    o1: 'option1',
    o2: 'option2',
  },
});


const files = argv._;

files.forEach(file => {
  const jsCode = fs.readFileSync(file, 'utf8');
  const luaCode = js2lua(jsCode, argv);
  console.log(luaCode);
});

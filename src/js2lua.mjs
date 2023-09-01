
import { parse } from "@babel/parser"

const options = {
  sourceType: "module",
};


function js2lua() {

}

function js2ast(code) {
  const ast = parse(code, options);
  return ast
}

export {
  js2lua,
  js2ast
}
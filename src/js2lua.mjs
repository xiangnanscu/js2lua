/* eslint-disable no-constant-condition */
/* eslint-disable no-duplicate-case */

import { parse } from "@babel/parser"
import { formatText } from 'lua-fmt';

function p() {
  console.log.apply(this, arguments)
}

function js2ast(code) {
  const ast = parse(code);
  return ast
}
const luaKeyWords = {
  and: "_and", break: "_break", do: "_do", else: "_else", elseif: "_elseif",
  end: "_end", false: "_false", for: "_for", function: "_function", if: "_if",
  in: "_in", local: "_local", nil: "_nil", not: "_not", or: "_or", repeat: "_repeat",
  return: "_return", then: "_then", true: "_true", until: "_until", while: "_while"
}
const isKeyWords = (k) => Object.prototype.hasOwnProperty.call(luaKeyWords, k)
const logicMap = {
  '!': 'not',
  '&&': "and",
  '||': 'or',
  '===': '==',
  '==': '==',
  '!==': '~=',
  '!=': '~=',
}
const isNode = e => e && typeof e == 'object' && e.type
function walkAst(ast, callback, depth) {
  const nextDepth = depth === undefined ? undefined : depth - 1
  const ok = depth > 0 || depth === undefined
  if (Array.isArray(ast)) {
    if (ok) {
      for (const e of ast) {
        walkAst(e, callback, nextDepth)
      }
    }
  } else if (!isNode(ast)) {
    return
  } else {
    const stop = callback(ast)
    if (stop) {
      return stop
    }
    if (ok) {
      for (const e of Object.values(ast)) {
        walkAst(e, callback, nextDepth)
      }
    }
  }
}
function renameIdentifier(ast, old, new1, depth) {
  walkAst(ast, (e) => {
    if (e.type == 'Identifier' && e.name == old) {
      e.name = new1
    }
  }, depth)
}
function hasIdentifier(ast, name, depth) {
  let find
  walkAst(ast, (e) => {
    if (e.type == 'Identifier' && e.name == name) {
      find = e
      return true
    }
  }, depth)
  return find
}
function renameThisToCls(ast) {
  walkAst(ast, (node) => {
    if (node.type == 'ThisExpression') {
      node.type = 'Identifier'
      node.name = 'cls'
    }
  })
}
function findNode(ast, callback, depth) {
  let find;
  const test = (node) => {
    if (callback(node)) {
      find = node
      return true
    }
  }
  walkAst(ast, test, depth)
  return find
}
function findNodes(ast, callback, depth) {
  const find = [];
  const test = (node) => {
    if (callback(node)) {
      find.push(node)
    }
  }
  walkAst(ast, test, depth)
  return find
}
function findNodeByType(ast, type, depth) {
  return findNode(ast, (node) => node.type === type, depth)
}
function getRestToken(params) {
  const restNode = findNodeByType(params, "RestElement")
  const restToken = restNode ? `local ${restNode.argument.name} = {...};` : ''
  return restToken
}
function ast2lua(ast, opts) {
  p(ast.program.body)
  const headSnippets = []
  const tailSnippets = []
  const getDefaultTokens = (params) => params.filter(p => p.type == 'AssignmentPattern')
    .map(p => `if ${_ast2lua(p.left)} == nil then ${_ast2lua(p.left)} = ${_ast2lua(p.right)} end`).join(';')
  const getFunctionSnippet = (params) => {
    const restToken = getRestToken(params)
    const defaultTokens = getDefaultTokens(params)
    return `${defaultTokens} ${restToken}`
  }
  const getSafePropery = (key, asIndex) => {
    key = _ast2lua(key)
    if (isKeyWords(key)) {
      return `["${key}"]`
    } else {
      return asIndex ? `.${key}` : key
    }
  }
  const getCallExpressionToken = (ast) => {
    if (ast.callee.type == "MemberExpression") {
      // foo.bar()
      const funcObject = _ast2lua(ast.callee.object)
      const method = _ast2lua(ast.callee.property)
      if (method == 'call') {
        return [funcObject, joinAst(ast.arguments)]
      } else if (method == 'apply') {
        const [a, b] = ast.arguments
        if (b) {
          return [funcObject, `${_ast2lua(a)}, unpack(${_ast2lua(b)})`]
        } else {
          return [funcObject, _ast2lua(a)]
        }
      } else if (isKeyWords(method)) {
        return [`${funcObject}["${method}"]`, `${funcObject}${ast.arguments.length > 0 ? ',' : ''}${joinAst(ast.arguments)}`]
      } else if (method == 'log' && funcObject == 'console') {
        return ['print', joinAst(ast.arguments)]
      } else {
        return [`${funcObject}:${method}`, joinAst(ast.arguments)]
      }
    } else {
      return [_ast2lua(ast.callee), joinAst(ast.arguments)]
    }
  }
  const getOptionalMemberExpression = (ast) => {
    const flatAsts = []
    let _ast = ast
    while (true) {
      const { type, object } = _ast
      if (type == 'OptionalMemberExpression') {
        flatAsts.push(_ast)
      } else if (type == 'MemberExpression') {
        flatAsts.push(_ast)
      } else {
        flatAsts.push(_ast)
        break
      }
      _ast = object
    }
    let firstTestDone = false
    let chainKey = ""
    const conditions = []
    for (let i = flatAsts.length - 1; i > -1; i--) {
      const _ast = flatAsts[i];
      if (chainKey) {
        if (flatAsts[i].computed) {
          chainKey = `${chainKey}[${_ast2lua(_ast.property)}]`
        } else {
          const safeKey = getSafePropery(_ast.property, true)
          chainKey = `${chainKey}${safeKey}`
        }
      } else {
        chainKey = _ast2lua(_ast)
      }
      if (i == 0) {
        conditions.push(`else return ${chainKey} end`)
      } else if (flatAsts[i - 1].optional) {
        if (!firstTestDone) {
          firstTestDone = true
          conditions.push(`if ${chainKey} == nil then return nil`)
        } else {
          conditions.push(`elseif ${chainKey} == nil then return nil`)
        }
      }
    }
    const token = `(function() ${conditions.join('\n')} end)()`
    return [token, chainKey]
  }
  const joinAst = (params, e = ',') => params.map(_ast2lua).join(e)
  function _ast2lua(ast) {
    switch (ast.type) {
      case "File":
        return ast.program.body.map(_ast2lua).join(';\n')
      case "VariableDeclaration": {
        const declarePrefix = ast.ForOfStatement ? '' : 'local '
        return ast.declarations.map(_ast2lua).map(e => `${declarePrefix}${e}`).join(';\n')
      }
      case "VariableDeclarator": {
        if (!ast.init) {
          return `${_ast2lua(ast.id)}`
        } else if (ast.init.type == "AssignmentExpression") {
          const res = [`${_ast2lua(ast.id)} = ${_ast2lua(ast.init.left)}`]
          let _ast = ast.init
          while (1) {
            if (_ast.type == "AssignmentExpression") {
              if (_ast.right.type == "AssignmentExpression") {
                res.unshift(`${_ast2lua(_ast.left)} = ${_ast2lua(_ast.right.left)}`)
              } else {
                res.unshift(`${_ast2lua(_ast.left)} = ${_ast2lua(_ast.right)}`)
              }
            } else {
              break
            }
            _ast = _ast.right
          }
          return res.join(';\nlocal ')
        } else if (ast.id.type == 'ArrayPattern') {
          return `${_ast2lua(ast.id).slice(1, -1)} = unpack(${_ast2lua(ast.init)})`
        } else if (ast.id.type == 'ObjectPattern') {
          const varibles = ast.id.properties.map(p => p.type == 'RestElement' ? _ast2lua(p.argument) : `${_ast2lua(p.value)}`)
          const assignments = ast.id.properties.map(p => {
            if (p.type == 'RestElement') {
              const restArg = _ast2lua(p.argument)
              const restCond = ast.id.properties.slice(0, -1).map(p => `k ~= "${_ast2lua(p.key)}"`).join(' and ')
              return `${restArg} = {};
              for k, v in pairs(__tmp) do
              if ${restCond} then
                ${restArg}[k] = v
              end
              end`
            } else {
              const key = _ast2lua(p.key)
              const init = isKeyWords(key) ? `__tmp["${key}"]` : `__tmp.${key}`
              return `${_ast2lua(p.value)} = ${init}`
            }
          }).join(';')
          return `${varibles.join(', ')};do local __tmp = ${_ast2lua(ast.init)}; ${assignments} end`
        } else {
          return `${_ast2lua(ast.id)} = ${_ast2lua(ast.init)}`
        }
      }
      case "Identifier": {
        const id = ast.name
        if (id == 'undefined') {
          return 'nil'
        }
        return id
      }
      case 'NumericLiteral':
        return `${ast.value}`
      case "StringLiteral": {
        return ast.extra?.raw
      }
      case "IfStatement": {
        return `if ${_ast2lua(ast.test)} then ${_ast2lua(ast.consequent)} ${ast.alternate ? ` else ${_ast2lua(ast.alternate)}` : ''} end`
      }
      case "BlockStatement": {
        return `${ast.body.map(_ast2lua).join(';')}`
      }
      case "CallExpression": {
        const [callee, args] = getCallExpressionToken(ast)
        return `${callee}(${args})`
      }
      case "ExpressionStatement": {
        return `${_ast2lua(ast.expression)}`
      }
      // arshift = <function 1>,
      // band = <function 2>,
      // bnot = <function 3>,
      // bor = <function 4>,
      // bswap = <function 5>,
      // bxor = <function 6>,
      // lshift = <function 7>,
      // rol = <function 8>,
      // ror = <function 9>,
      // rshift = <function 10>,
      // tobit = <function 11>,
      // tohex = <function 12>
      case "BinaryExpression": {
        const op = logicMap[ast.operator] || ast.operator
        const left = _ast2lua(ast.left)
        const right = _ast2lua(ast.right)
        if (ast.operator == 'instanceof') {
          return `getmetatable(${left}) == ${right}`
        } else if (ast.operator == ">>") {
          return `bit.rshift(${left}, ${right})`
        } else if (ast.operator == "<<") {
          return `bit.lshift(${left}, ${right})`
        } else if (ast.operator == "&") {
          return `bit.band(${left}, ${right})`
        } else if (ast.operator == "|") {
          return `bit.bor(${left}, ${right})`
        } else if (ast.operator == "^") {
          return `bit.bxor(${left}, ${right})`
        } else if (ast.operator == "**") {
          return `math.pow(${left}, ${right})`
        } else {
          return `${left} ${op} ${_ast2lua(ast.right)}`
        }
      }
      case "UnaryExpression": {
        const op = logicMap[ast.operator] || ast.operator
        const arg = _ast2lua(ast.argument)
        if (ast.operator == 'typeof') {
          return `type(${arg})`
        } else if (ast.operator == 'delete') {
          return `${arg} = nil`
        } else if (ast.operator == '~') {
          return `bit.bnot(${arg})`
        }
        return `${op} ${arg}`
      }
      case "ThisExpression": {
        return `self`
      }
      case "BooleanLiteral": {
        return `${ast.value}`
      }
      case "ObjectExpression": {
        if (findNodeByType(ast.properties, "SpreadElement")) {
          return `(function() local d = {}; ${ast.properties.map(e => {
            if (e.type == 'SpreadElement') {
              return `for k, v in pairs(${_ast2lua(e.argument)}) do d[k] = v end`
            } else {
              const key = _ast2lua(e.key)
              return `d${e.computed || e.key.type == "StringLiteral" || isKeyWords(key) ? `[${key}]` : `.${key}`} = ${_ast2lua(e.value)}`
            }
          }).join(';')} return d end)()`
        } else {
          return `{${joinAst(ast.properties)}}`
        }

      }
      case "ObjectProperty": {
        const key = _ast2lua(ast.key)
        return `${ast.computed || ast.key.type == "StringLiteral" || isKeyWords(key) ? `[${key}]` : key} = ${_ast2lua(ast.value)}`
      }
      case "ArrayExpression": {
        if (findNodeByType(ast.elements, "SpreadElement")) {
          const iife = `(function() local a = {}; ${ast.elements.map(e => {
            if (e.type == 'SpreadElement') {
              return `for _, v in ipairs(${_ast2lua(e.argument)}) do a[#a + 1] = v end`
            } else {
              return `a[#a + 1] = ${_ast2lua(e)}`
            }
          }).join(';')} return a end)()`
          return iife
        } else {
          return `{${joinAst(ast.elements)}}`
        }
      }
      case "ForOfStatement": {
        const hasContinue = findNodeByType(ast, 'ContinueStatement')
        const clabel = hasContinue ? ';::continue::' : ''
        ast.left.ForOfStatement = true
        if (ast.left.declarations[0]?.id.type == 'ArrayPattern') {
          return `for _, __vars in ipairs(${_ast2lua(ast.right)}) do
           local ${_ast2lua(ast.left).slice(1, -1)} = unpack(__vars); ${_ast2lua(ast.body)} ${clabel} end`
        } else {
          return `for _, ${_ast2lua(ast.left)} in ipairs(${_ast2lua(ast.right)}) do
           ${_ast2lua(ast.body)} ${clabel} end`
        }
      }
      case "ForInStatement": {
        const hasContinue = findNodeByType(ast, 'ContinueStatement')
        const clabel = hasContinue ? ';::continue::' : ''
        ast.left.ForOfStatement = true
        return `for ${_ast2lua(ast.left)}, __ in pairs(${_ast2lua(ast.right)}) do ${_ast2lua(ast.body)} ${clabel} end`
      }
      case "LogicalExpression": {
        const op = logicMap[ast.operator] || ast.operator
        const left = _ast2lua(ast.left)
        const right = _ast2lua(ast.right)
        let s
        if (op == '??') {
          s = `(function()
            if ${left} == nil then
              return ${right}
            else
              return ${left}
            end
          end)()`
        } else {
          s = `${left} ${op} ${right}`
        }
        if (ast.extra?.parenthesized) {
          return `(${s})`
        } else {
          return `${s}`
        }
      }
      case "FunctionDeclaration": {
        const className = _ast2lua(ast.id)
        const funcPrefixToken = getFunctionSnippet(ast.params)
        const funcBody = _ast2lua(ast.body)
        const paramsToken = joinAst(ast.params)
        const metaParamsToken = ast.params.length > 0 ? ', ' + paramsToken : paramsToken
        if (opts.tryTranslateClass && className.match(/^[A-Z]/) && findNodeByType(ast.body, "ThisExpression")) {
          return `\
local ${className} = setmetatable({}, {
  __call = function(t${metaParamsToken})
    local self = t:new();
    self:constructor(${paramsToken});
    return self;
  end})
${className}.__index = ${className}
function ${className}.new(cls) return setmetatable({}, cls) end
function ${className}:constructor(${paramsToken})
  ${funcPrefixToken}
  ${funcBody}
end`
        } else {
          return `local function ${className}(${paramsToken}) ${funcPrefixToken} ${funcBody} end`
        }

      }
      case "ReturnStatement": {
        return ast.argument ? `return ${_ast2lua(ast.argument)}` : `return;`
      }
      case "ArrayPattern": {
        return `[${joinAst(ast.elements)}]`
      }
      case "ClassDeclaration": {
        const superClassToken = ast.superClass ? `{${_ast2lua(ast.superClass)}}` : ``
        if (opts.useClassCall) {
          return `local ${_ast2lua(ast.id)} = class ${superClassToken} {
            ${_ast2lua(ast.body)}}`
        } else {
          const className = _ast2lua(ast.id)
          const classMethods = ast.body.body.filter(e => e.type === 'ClassMethod' && e.kind !== 'constructor').map(b => {
            const key = _ast2lua(b.key)
            const funcPrefixToken = getFunctionSnippet(b.params)
            const safeDeclare = isKeyWords(key) ? `${className}["${key}"] = function` : `function ${className}:${key}`
            const firstParam = isKeyWords(key) ? b.params.length > 0 ? 'self,' : 'self' : ''
            return `${safeDeclare}(${firstParam}${joinAst(b.params)})
            ${funcPrefixToken}
            ${_ast2lua(b.body)}
            end`
          }).join(';')
          const ClassProperties = ast.body.body.filter(e => e.type === 'ClassProperty' && e.static).map(b => {
            const key = _ast2lua(b.key)
            if (isKeyWords(key)) {
              return `${className}["${key}"] = ${_ast2lua(b.value)}`
            } else {
              return `${className}.${key} = ${_ast2lua(b.value)}`
            }
          }).join(';')
          const InstanceProperties = ast.body.body.filter(e => e.type === 'ClassProperty' && !e.static).map(b => {
            const key = _ast2lua(b.key)
            if (isKeyWords(key)) {
              return `["${key}"] = ${_ast2lua(b.value)}`
            } else {
              return `${key} = ${_ast2lua(b.value)}`
            }
          }).join(',')
          const constructorNode = findNode(ast.body, e => e.kind == 'constructor')
          const superClass__indexToken = ast.superClass ? `__index = ${_ast2lua(ast.superClass)},` : ''
          if (!constructorNode) {
            return `\
local ${className} = setmetatable({}, {
  ${superClass__indexToken}
  __call = function(t)
    local self = t:new();
    self:constructor();
    return self;
  end})
${className}.__index = ${className};${ClassProperties};
function ${className}.new(cls) return setmetatable({${InstanceProperties}}, cls) end
function ${className}:constructor() end
${classMethods}`
          } else {
            const funcPrefixToken = getFunctionSnippet(constructorNode.params)
            const funcBody = _ast2lua(constructorNode.body)
            const paramsToken = joinAst(constructorNode.params)
            const metaParamsToken = constructorNode.params.length > 0 ? ', ' + paramsToken : paramsToken
            return `\
local ${className} = setmetatable({}, {
  __call = function(t${metaParamsToken})
    local self = t:new();
    self:constructor(${paramsToken});
    return self;
  end})
${className}.__index = ${className}
${ClassProperties}
function ${className}.new(cls) return setmetatable({${InstanceProperties}}, cls) end
function ${className}:constructor(${paramsToken})
  ${funcPrefixToken}
  ${funcBody}
end
${classMethods}`
          }
        }
      }
      case "ClassBody": {
        return `${ast.body.map(_ast2lua).join(',\n')}`
      }
      case "ClassProperty": {
        return `${getSafePropery(ast.key)} = ${_ast2lua(ast.value)}`
      }
      case "ClassMethod": {
        const funcPrefixToken = getFunctionSnippet(ast.params)
        ast.params.unshift({ type: 'ThisExpression' })
        const canRename = ast.static && !hasIdentifier(ast.body, 'cls') && !hasIdentifier(ast.params, 'cls')
        if (canRename) {
          renameThisToCls(ast.body)
          renameThisToCls(ast.params)
        }
        return `${getSafePropery(ast.key)} = function(${joinAst(ast.params)})
         ${funcPrefixToken} ${_ast2lua(ast.body)} end`
      }
      case "OptionalCallExpression": {
        let originFuncToken, funcName, callee, args
        if (ast.callee.type == 'OptionalMemberExpression') {
          [callee, args] = getCallExpressionToken(ast);
          [originFuncToken, funcName] = getOptionalMemberExpression(ast.callee)
          callee = funcName
        } else {
          [callee, args] = getCallExpressionToken(ast)
          originFuncToken = _ast2lua(ast.callee)
          funcName = originFuncToken
        }
        if (originFuncToken[0] == '#') {
          originFuncToken = originFuncToken.slice(1) + '.length'
        }
        const token = `(function()
          local _fn = ${originFuncToken}
          if _fn == nil then
            return nil
          elseif type(_fn) ~= 'function' then
            error('${funcName} is not a function')
          else
            return ${callee}(${args})
          end
        end)()`
        // p(token)
        return token
      }
      case "MemberExpression": {
        const object = _ast2lua(ast.object)
        const key = _ast2lua(ast.property)
        if (key == 'length') {
          return '#' + object
        } else if (isKeyWords(key)) {
          return `${object}["${key}"]`
        } else if (ast.computed) {
          if (opts.index0To1 && ast.property?.type == 'NumericLiteral' && ast.property.value === 0) {
            return `${object}[1]`
          } else {
            return `${object}[${key}]`
          }
        } else {
          return `${object}.${key}`
        }
      }
      case "OptionalMemberExpression": {
        return getOptionalMemberExpression(ast)[0]
      }
      case "ExpressionStatement": {
        return `${_ast2lua(ast.expression)}`
      }
      case "AssignmentExpression": {
        if (ast.right.type == "FunctionExpression"
          && ast.left.type == "MemberExpression"
          && ast.left.object.type == "MemberExpression"
          && ast.left.object.property?.name == "prototype") {
          // Class.prototype.foo = function() {}
          const funcPrefixToken = getFunctionSnippet(ast.right.params)
          const funcName = `${_ast2lua(ast.left.object.object)}:${_ast2lua(ast.left.property)}`
          return `function ${funcName}(${(joinAst(ast.right.params))})
            ${funcPrefixToken} ${_ast2lua(ast.right.body)} end`
        } else if (opts.moduleExportsToReturn && ast.left.type == "MemberExpression" && _ast2lua(ast.left) == 'module.exports') {
          tailSnippets.push(`return ${_ast2lua(ast.right)}`)
          return ``
        } else if (ast.right.type == "AssignmentExpression") {
          // chain assignment: a = b = 1
          const left = _ast2lua(ast.left)
          const right = _ast2lua(ast.right)
          return `${right};
          local ${left} = ${_ast2lua(ast.right.left)}`
        } else {
          const op = ast.operator
          const left = _ast2lua(ast.left)
          const right = _ast2lua(ast.right)
          if (op == '+=') {
            return `${left} = ${left} + ${right}`
          } else if (op == '-=') {
            return `${left} = ${left} - ${right}`
          } else if (op == '*=') {
            return `${left} = ${left} * ${right}`
          } else if (op == '/=') {
            return `${left} = ${left} / ${right}`
          } else if (op == '%=') {
            return `${left} = ${left} % ${right}`
          } else if (op == '&&=') {
            return `${left} = ${left} and ${right}`
          } else if (op == '||=') {
            return `${left} = ${left} or ${right}`
          } else if (op == '&=') {
            return `${left} = bit.band(${left}, ${right})`
          } else if (op == '|=') {
            return `${left} = bit.bor(${left}, ${right})`
          } else if (op == '^=') {
            return `${left} = bit.bxor(${left}, ${right})`
          } else if (op == '**=') {
            return `${left} = math.pow(${left}, ${right})`
          } else if (op == '??=') {
            return `${left} = (function()
            if ${left} == nil then
              return ${right}
            else
              return ${left}
            end
          end)()`
          } else {
            return `${_ast2lua(ast.left)} ${op} ${_ast2lua(ast.right)}`
          }
        }
      }
      case "BreakStatement": {
        return `break`
      }
      case "ContinueStatement": {
        return `goto continue`
      }
      case "ThrowStatement": {
        if (ast.argument.type == 'NewExpression') {
          return `error(${joinAst(ast.argument.arguments)})`
        } else {
          return `error(${_ast2lua(ast.argument)})`
        }
      }
      case "NewExpression": {
        return `${_ast2lua(ast.callee)}(${joinAst(ast.arguments)})`
      }
      case "FunctionExpression": {
        const funcPrefixToken = getFunctionSnippet(ast.params)
        return `function(${joinAst(ast.params)}) ${funcPrefixToken} ${_ast2lua(ast.body)} end`
      }
      case "TryStatement": {
        if (opts.renameCatchError && ast.handler.param && _ast2lua(ast.handler.param) === 'error') {
          if (!hasIdentifier(ast.handler, '_err')) {
            renameIdentifier(ast.handler, 'error', '_err')
          }
        }
        return `local ok ${ast.handler.param ? ' ,' + _ast2lua(ast.handler.param) : ''} =
        pcall(function() ${_ast2lua(ast.block)} end);
        if not ok then ${_ast2lua(ast.handler.body)} end`
      }
      case "UpdateExpression": {
        const n = _ast2lua(ast.argument)
        const op = ast.operator == '++' ? '+' : '-'
        if (opts.selfOperatorToCallback) {
          return `(function () ${n} = ${n} ${op} 1; return ${n} end)()`
        } else {
          return `${n} = ${n} ${op} 1`
        }

      }
      case "WhileStatement": {
        const hasContinue = findNodeByType(ast, 'ContinueStatement')
        const clabel = hasContinue ? ';::continue::' : ''
        return `while ${_ast2lua(ast.test)} do ${_ast2lua(ast.body)} ${clabel} end`
      }
      case "ArrowFunctionExpression": {
        const funcPrefixToken = getFunctionSnippet(ast.params)
        return `function(${joinAst(ast.params)}) ${funcPrefixToken} ${ast.body.type == 'BlockStatement' ? '' : 'return'} ${_ast2lua(ast.body)} end`
      }
      case "RestElement": {
        return `...`
      }
      case "ConditionalExpression": {
        return `(function()
        if ${_ast2lua(ast.test)} then return ${_ast2lua(ast.consequent)};
        else return ${_ast2lua(ast.alternate)}; end end)()`
      }
      case "RegExpLiteral": {
        return `[=[${ast.pattern}]=]`
      }
      case "NullLiteral": {
        return `nil`
      }
      case "TemplateLiteral": {
        return `string.format([=[${ast.quasis.map(_ast2lua).join('%s')}]=], ${joinAst(ast.expressions)})`
      }
      case "TemplateElement": {
        return `${ast.value.cooked}`
      }
      case "ForStatement": {
        const hasContinue = findNodeByType(ast, 'ContinueStatement')
        const clabel = hasContinue ? ';::continue::' : ''
        return `do
  ${ast.init ? _ast2lua(ast.init) : ''}
  while ${ast.test ? _ast2lua(ast.test) : '1'} do
  ${_ast2lua(ast.body)} ${clabel} ${_ast2lua(ast.update)}
  end
end`
      }
      case "AssignmentPattern": {
        return `${_ast2lua(ast.left)}`
      } case "SpreadElement": {
        return `unpack(${_ast2lua(ast.argument)})`
      }
      case "Super": {
        return `super`
      }
      default:
        p('unknow node', ast.type, ast)
        return ""
    }
  }

  return `
  ${headSnippets.join(';')}
  ${_ast2lua(ast)}
  ${tailSnippets.join(';')}`
}

function js2lua(s, opts) {
  let luacode = "";
  luacode = ast2lua(js2ast(s), opts);
  p(luacode)
  return formatText(luacode)
  // try {
  //   js = ast2lua(js2ast(s), opts);
  //   return formatText(js)
  // } catch (error) {
  //   console.error(error)
  //   return `-- PARSE ERROR: ${error}\n\n${js}`;
  // }
}
export {
  js2lua,
  js2ast
}
<script setup>
import { ref, computed, watch, reactive } from "vue";
import { js2lua, js2ast } from "./js2lua.mjs";
import fs from "file-saver";
import packages from "../package.json";

const showjsAst = ref(false);
const optionNamesDict = {
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

const jscode = ref(`\
import a, { b as bAlias, c } from "bar"
const {k1, k2, ...rest} = {k1: 'k1', k2:'k2', k3:'k3', k4: 'k4'}
const [x, y, ...others] = [1, 2, 3, 4]
export {x, y, others}`);
const optionNames = Object.keys(optionNamesDict);
const selectNames = ref(
  Object.entries(optionNamesDict)
    .filter(([k, v]) => v)
    .map(([k, v]) => k)
);
const selectOptions = computed(() => Object.fromEntries(selectNames.value.map((e) => [e, true])));
const files = import.meta.glob("../test/*.mjs", { as: "raw", eager: false });
for (const [filePath, jscode] of Object.entries(files)) {
  files[filePath] = ref(jscode);
}
const tableHtmls = reactive([]);
for (const filePath in files) {
  const jscode = files[filePath];
  const luacode = computed(() => js2lua(jscode.value, selectOptions.value));
  const name = filePath.match(/\/(\w+)\.mjs$/)[1];
  tableHtmls.push({ name, jscode, luacode });
}

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
  fs.saveAs(new Blob([luacode.value]), "test11.lua");
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
    <h1 style="margin-bottom: 1em; text-align: center">
      <a href="https://github.com/xiangnanscu/js2lua" :title="packages.version"> {{ packages.name }}</a>
      - Writing LuaJIT with the expressiveness of JavaScript.
    </h1>
    <div class="row">
      <div class="col-2">
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
        <textarea rows="10" style="height: 500px" class="form-control" v-model="jscode"></textarea>
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
    <table class="table table-bordered">
      <thead>
        <tr>
          <th colspan="3">
            <h1>take a look at features:</h1>
            <template v-for="(e, i) in tableHtmls" :key="i">
              <a class="link-block" :href="`#${e.name}`">{{ e.name }}</a>
            </template>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(e, i) in tableHtmls" :key="i">
          <tr>
            <td colspan="3">
              <h3 :id="e.name">{{ e.name }}</h3>
            </td>
          </tr>
          <tr>
            <td class="td-wrap">
              <textarea class="td-textarea form-control" v-model="e.jscode"></textarea>
            </td>
            <td>
              <highlightjs language="javascript" :code="e.jscode" />
            </td>
            <td>
              <highlightjs language="lua" :code="e.luacode" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap.scss";
h2,
h3 {
  text-align: center;
}
.link-block {
  margin: 1em;
}
.td-wrap {
  padding: 0;
  height: 10em;
  width: 90em;
}
.td-textarea {
  display: block;
  height: 100%;
  width: 100%;
  border: 0;
  box-sizing: border-box;
}
span.hljs-string {
  color: #22863a;
}
.col {
  overflow: scroll;
}
</style>
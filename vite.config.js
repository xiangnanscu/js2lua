import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import requireT from 'vite-plugin-require-transform'
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.CLOUDFLARE ? "/" : "/js2lua/",
  plugins: [
    vue(),
    //   requireT({
    //   fileRegex: /.m?js$|.vue$/
    // })
  ],
});

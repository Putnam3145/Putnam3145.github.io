import Vue from 'vue'
import './app.scss'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import VueKatex from 'vue-katex';
import hljs from "highlight.js/lib/core.js";
import rust from 'highlight.js/lib/languages/rust'
import hljsVuePlugin from "@highlightjs/vue-plugin"

Vue.use(VueKatex, {
  globalOptions: {
  }
});

hljs.registerLanguage('rust', rust)

Vue.use(hljsVuePlugin);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

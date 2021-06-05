import Vue from 'vue'
import './app.scss'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import VueKatex from 'vue-katex';

Vue.use(VueKatex, {
  globalOptions: {
  }
});
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

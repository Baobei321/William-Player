import App from './App'
import * as Pinia from 'pinia';
// import { HFdebugging } from '@/uni_modules/HF-HF_debugging/common/next.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// new HFdebugging()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia());
  // new HFdebugging({app});
  return {
    app,
    Pinia
  }
}
// #endif
import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from '@/router/index'
import axios from 'axios'
import VueLazyload from 'vue-lazyload'
// import store from './store'
import fastclick from 'fastclick'
import 'common/stylus/index.styl'

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})
Vue.config.productionTip = false

fastclick.attach(document.body)
Vue.prototype.$axios = axios
new Vue({
  router,
  // store,
  render: h => h(App)
}).$mount('#app')

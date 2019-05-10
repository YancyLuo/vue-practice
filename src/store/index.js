import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import mutations from './mutation'
import * as getters from './getters'
import * as actions from './action'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'
export default new Vuex.Store({
  strict: debug,
  state,
  mutations,
  getters,
  actions,
})
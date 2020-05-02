import Vue from 'vue';
import Vuex from 'vuex';
import profile from '@/store/modules/profile';
import settings from '@/store/modules/settings';

Vue.use(Vuex);

const state = {
  notification: undefined
};

const mutations = {
  setNotification(state, payload = {}) {
    const {
      title = 'Возникла проблема',
      message = 'Повторите запрос позже.'
    } = payload;

    state.notification = {title, message};
  },
  removeNotification(state) {
    state.notification = undefined;
  }
};

const actions = {};

const getters = {
};

const modules = {
    profile,
    settings
};

export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions,
  modules
});
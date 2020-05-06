import Vue from 'vue';
import Vuex from 'vuex';
import active from '@/store/modules/active';
import profile from '@/store/modules/profile';
import settings from '@/store/modules/settings';

Vue.use(Vuex);

const state = {
};

const mutations = {
};

const actions = {};

const getters = {
};

const modules = {
    active,
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
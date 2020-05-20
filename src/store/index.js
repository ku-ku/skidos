import Vue from 'vue';
import Vuex from 'vuex';
import active from '@/store/modules/active';
import profile from '@/store/modules/profile';
import settings from '@/store/modules/settings';
import basket from '@/store/modules/basket';

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
    settings,
    basket
};

export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions,
  modules
});
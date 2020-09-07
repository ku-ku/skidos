import Vue from 'vue';
import Vuex from 'vuex';
import active from '@/store/modules/active';
import profile from '@/store/modules/profile';
import settings from '@/store/modules/settings';
import basket from '@/store/modules/basket';
import geo from '@/store/modules/geo';

Vue.use(Vuex);

const state = {
};

const mutations = {
};

const actions = {};

const getters = {
    is: state => q => {
        switch(q){
            case "cordova":
                return (typeof cordova === "object");
        }
    }
};

const modules = {
    active,
    profile,
    settings,
    basket,
    geo
};

export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions,
  modules
});
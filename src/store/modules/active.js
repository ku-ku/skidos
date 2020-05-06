const state = {
    store: null,
    action: null
};

const mutations = {
    setStore(state, payload = {}) {
        state.store = payload;
    },
    setAction(state, payload = {}) {
        state.action = payload;
    }
};

const actions = {};

const getters = {
    hasActiveStore(state){
        return (!!state.store) && !$utils.isEmpty(state.store.id);
    },
    hasActiveAction(state){
        return (!!state.action) && !$utils.isEmpty(state.action.id);
    }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
const state = {
  notifi: {
      fcmId: undefined
  }
};

const mutations = {
  setPush(state, payload) {
    const {fcmId, value} = payload;
    state.notifi.fcmId = fcmId;
  }
};


export default {
  namespaced: true,
  state,
  mutations
};
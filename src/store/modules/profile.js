const user = $utils.lsRead('auth') || {
  login: null,
  password: null,
  isAuthenticated: false
};

const state = {
  user
};

const mutations = {
  setFlag(state, payload) {
      state.user.isAuthenticated = payload.isAuthenticated;
  },
  setSubject(state, payload) {
    console.log('Subject:', payload);  
    state.user.id = payload.id;
    state.user.tenantId = payload.tenantId;
    state.user.login = payload.name;
    state.user.name  = payload.title;
    state.user.password = $utils.utf8ToB64(payload.password);
    state.user.isAuthenticated = true;
    
    var _user = Object.assign({}, state.user);
    _user.isAuthenticated = false;
    _user.lastAccess = (new Date()).getTime();
    $utils.lsSave('auth', _user);
  },
  removeCredentials(state) {
    state.user = {
      login: null,
      password: null,
      isAuthenticated: false
    };
  }
};

const actions = {
    login(store, payload) {
        const { commit } = store;
        const { user } = payload;
        const promise = (resolve, reject) => {
            /**
             * Action on success
             * @param {Object} res
             */
            function onSuccess(res) {
                if (res.result) {
                    res.result.password = user.password;
                    commit('setSubject', res.result);
                    resolve(res);
                } else {
                    reject(res.error);
                }
            }
            /**
             * Action on error
             * @param {Object} err
             */
            function onFail(err) {
                console.log('Fail on login:', err);
                reject(err);
            }
            const options = {
                type: 'auth',
                basicAuth: 'Basic ' + btoa(user.login + ':' + user.password)
            };
            const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
            $http
                .post(url, options)
                .then(onSuccess)
                .fail(onFail);
        };
        return new Promise(promise);
  },
  check: function(store) {
    const {commit} = store;
    console.log('chk: ', state.user);
    const promise = (resolve, reject) => {
        /**
         * Action on success
         * @param {Object} res
         */
        function onSuccess(res) {
            if ((res)&&(res.result)){
                commit('setSubject', res.result);
                commit('setFlag', {isAuthenticated:true});
                resolve(res);
            } else {
                reject(res.error);
            }
        }

        function onFail(err) {
          reject(err);
        }
      
        if ($utils.isEmpty(state.user.login) || 
            $utils.isEmpty(state.user.password)) {
            console.log('No user in store');
            reject({message: 'No user in store'});
            return;
        }
        const options = {
            type: 'auth',
            basicAuth: 'Basic ' + btoa(state.user.login + ':' + $utils.b64ToUtf8(state.user.password))
        };
        
        const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
        $http
             .post(url, options)
             .then(onSuccess)
             .catch(onFail);
    };
    return new Promise(promise);
  },
  logout(ctx) {
    const {commit} = ctx;

    const promise = (resolve, reject) => {
      /**
       *s Action on success
       * @param {Object} res
       */
      function onSuccess(res) {
        commit('removeCredentials');
        resolve(res);
      }

      /**
       * Action on error
       * @param {Object} err
       */
      function onFail(err) {
        reject(err);
      }

      const options = {
        type: 'logout'
      };

      const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
      $http.post(url, options).then(onSuccess).catch(onFail);
    };

    return new Promise(promise);
  }
};

const getters = {
  isAuthenticated(state) {
    return (state.user) ? state.user.isAuthenticated : false;
  },
  login(state) {
    return state.user.login
        ? state.user.login
        : '';
  },
  password(state) {
    return state.user.password ? $utils.b64ToUtf8(state.user.password) : '';
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
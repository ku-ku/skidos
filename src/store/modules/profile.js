const user = $utils.lsRead('auth') || {
  login: null,
  password: null,
  isAuthenticated: false
};

const state = {
  user,
  _hTimer: false
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
    if (!!state._hTimer){
        clearInterval(state._hTimer);
    }
    state._hTimer = setInterval(()=>{
        const opts = {
            type: 'auth'
        };
        const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc&user=ping&password='+(new Date()).getTime();
        (async ()=>{
            try {
                var resp = await $http.post(url, opts);
                if (!!resp.error){
                    throw resp.error;
                }
            }catch(e){
                window["app"].pingFail();
            }
        })();
    }, 10*60*1000);
    console.log('Ping timer set #', state._hTimer);
  },
  setAdds: function(state, adds){
      state.user.adds = adds;
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
        const { user } = payload;
        const promise = (resolve, reject) => {
            /**
             * Action on success
             * @param {Object} res
             */
            function onSuccess(res) {
                if (!!res.result) {
                    console.log('login-success:', res);
                    res.result.password = user.password;
                    store.commit('setSubject', res.result);
                    store.dispatch('readAdds');
                    if (resolve){
                        resolve(res);
                    }
                } else {
                    console.log('login-success.fail:', res.error);
                    if (reject){
                        reject(res.error);
                    }
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
  },    //login
  async readAdds(store){
        if ((!!store.state.user)&&(!!store.state.user.adds)){
            return;
        }
        const opts = {
              type: 'core-read',
              query: 'sin2:/v:b841fde1-394a-4ab1-8ca7-48446f58c27e?id=' 
                      + store.state.user.id + '&fields=sscusersadds.addrstring,sscusersadds.email,sscusersadds.phone'
        }, 
        url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
        try {
            var res = await $http.post(url, opts);
            if ((!!res.result)
                && (res.result.data.length>0)){
                store.commit('setAdds', $utils.sin2obj(res.result.columnIndexes, res.result.data[0]));
            } else {
                throw 'No user adds #' + store.state.user.id;
            }
        }catch(e){
            console.log('ERR on user', e);
        }
  },    //readAdds
  check: function(store) {
    const {commit, dispatch} = store;
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
                dispatch('readAdds');
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
        try {
            document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }catch(e){}
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
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
const state = () => ({
    at:    new Date(),  //for watch changes
    order: null,        //num-order
    error: null,
    confirmClear: false,
    basket: {
        prods: []
    }
});

const mutations = {
    fix(state, basket){
        state.at = new Date();
        state.basket = basket;
        //resetting
        state.error = null;
        state.order = null;
        state.confirmClear = false;
    },
    complete(state, n){
        state.at     = new Date();
        state.error  = null;
        state.order  = n;
        state.basket = {prods:[]};
    },
    error(state, e){
        state.at    = new Date();
        state.error = e;
    },
    confirm(state, mode){
        if (mode==='clear'){
            state.confirmClear = true;
        } else {    //TODO: for others
            
        }
    }
};

const actions = {
    add({ commit, state },  payload) {
        var basket = state.basket;
        if (!basket){
            basket = {};
        }
        if (!basket){
            basket = {prods:[]};
        }
        if (!basket.prods){
            basket.prods = [];
        }
        var found = false;
        basket.prods.map((prod)=>{
            if (prod.id===payload.id) {
                found = true;
                prod.num = payload.num;
                prod.total = payload.total;
                prod.self  = payload.self;
                prod.note  = payload.note;
            }
        });
        if (!found){
            basket.prods.push(payload);
        }
        commit('fix', basket);
    },
    rm({ commit, state },  payload){
        if ( (!state.basket)
           ||(!state.basket.prods)){
           return;
        }
        var i = 0,
            basket = state.basket;
        
        while (i < basket.prods.length) {
            if(basket.prods[i].id === payload.id) {
                basket.prods.splice(i, 1);
                break;
            } else {
                ++i;
            }
        }
        commit('fix', basket);
    },
    clear({commit}) {
        commit('fix',  {prods:[]});
    },
    save({ commit, state }){
        console.log('saving...');
        if ((!!state.basket)&&(!!state.basket.prods)&&(state.basket.prods.length>0)){
            var b = {
                "userid": app.$store.state.profile.user.id,
                "goods" : []
            };
            state.basket.prods.map( (p)=>{
                b.tenantid = p.store.id;
                b.goods.push({
                    "productid": p.id,
                    "amount":    p.num,
                    "opersum":   p.total,
                    "note":      p.note,
                    "self":      p.self,
                    "delivarydate": $utils.formatDate(p.at, 'yyyy-MM-dd HH:mm:ss')
                });
            });
              
            const opts = {
                type: 'query',
                query: '793a6cc2-b8f8-42bf-9936-dc8e0f2401c1.regOrder',
                params: {order: JSON.stringify(b)}
            };
            return new Promise( (resolve, reject)=>{
                (async () => { 
                    try {
                        var res = await $http.post(opts);
                        console.log(res);
                        if (!!res.result){
                            var order = res.result.data[0][0];
                            commit('complete', order);
                            resolve(order)
                        } else {
                            throw res.error || 'unknown error';
                        }
                    }catch(e){
                        commit('error',  e);
                        reject(e);
                    }
                })();
            } );
        }
    }   //save
};

const getters = {
    numof({basket}){
        if ((!!basket)&&(!!basket.prods)){
            return basket.prods.length;
        }
        return 0;
    },
    total({basket}){
        var _t = 0;
        if ((!!basket)&&(!!basket.prods)) {
            basket.prods.map((p)=>{
                _t += p.total;
            });
        }
        return _t;
    },
    has(state){
        return (id) => {
            var found = ((!!state.basket)&&(!!state.basket.prods)) 
                ? state.basket.prods.filter((p)=>{
                    return (p.id===id) 
                        || ((!!p.store)&&(p.store.id===id));
                })
                : [];
            return found.length;
        };
    },
    basket(state){
        return (storeId) => {
            return ((!!state.basket)&&(!!state.basket.prods)) 
                ? state.basket.prods.filter((p)=>{
                    return (p.store.id===storeId);
                })
                : [];
        };
    },
    self(state){
        return (storeId) => {
            var prods = ((!!state.basket)&&(!!state.basket.prods)) 
                            ? state.basket.prods.filter((p)=>{
                                return (p.store.id===storeId)&&(!!p.self);
                              })
                            : [];
            return prods.length > 0;
        };
    },
    at(state){
        return state.at;
    }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};

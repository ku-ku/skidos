const state = () => ({
    at: new Date(),  //for watch changes
    basket: {prods:[]}
});

const mutations = {
    fix(state, basket){
        state.at = new Date();
        state.basket = basket;
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
    save({commit}){
        console.log('saving...');
        commit('fix',  {prods:[]});
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

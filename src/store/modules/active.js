import geo from '@/utils/geo';

const state = {
    store: null,
    action: null,
    fills: null,
    fill: null
};

const mutations = {
    setStore(state, payload = {}) {
        state.store = payload;
        state.fills = null; //reset
        state.fill  = null;
    },
    setAction(state, payload = {}) {
        state.action = payload;
    },
    setStoreFills(state, payload) {
        state.fills = payload;
    },
    setStoreFill(state, payload) {
        state.fill = payload;
    }
};

const actions = {
    getFills(store){
        const dist = app.$store.getters["geo/distance"];
        const current = store.state.fill;
        const p = (resolve, reject) => {
            if (    (!!store.state.store)
                 && (!!store.state.fills) ){
                store.state.fills.map((fill, i)=>{
                    fill.current = (!!current) ? (current.id===fill.id) : (i===0);
                });
                resolve(store.state.fills);
            }
            const opts = {
                type: 'core-read',
                query: 'sin2:/v:2c697aa3-0ad1-4b0c-85ef-a3b7616167ee?filter=eq(field(".parentId"), param("' + store.state.store.id + '", "id"))'
            };
            opts.query += '&fields=ssctenants.id,ssctenants.title,ssctenantsadds.location,ssctenantsadds.lat,ssctenantsadds.lon,ssctenantsadds.phone';
            (async ()=>{
                try {
                    var res = await $http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    var fills = [],
                        ci    = res.result.columnIndexes;
                    res.result.data.map((fil)=>{
                        var _fil = $utils.sin2obj(ci, fil);
                            _fil.distance = dist(_fil);
                            _fil.address  = geo.a2s(_fil.location);
                            fills.push(_fil);
                    });
                    store.commit('setStoreFills', 
                                 fills.sort((_f1, _f2)=>{
                                        return (_f1.distance - _f2.distance);
                                 }));
                    resolve(store.state.fills);
                } catch(e) {
                    console.log('On fills read:', e);
                    reject();
                }
            })();
        };
        
        return new Promise(p);
    }
};

const getters = {
    hasActiveStore(state){
        return (!!state.store) && !$utils.isEmpty(state.store.id);
    },
    hasActiveStoreFills(state){
        if ((!!state.store) && !$utils.isEmpty(state.store.id)) {
            return (!!state.store.pointscount) && (Number(state.store.pointscount)>0);
        }
        return false;
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
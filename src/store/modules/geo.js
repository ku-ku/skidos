import geo from '@/utils/geo';

const API_URL = 'http://api.ipstack.com/';
const API_KEY = '739747a9f6f716d960608c3ee375b337';

const state = {
    ll: {
        lat: 45.035470, //Krd-center (city-sq)
        lon: 38.975313
    },
    addr: null,
    last: new Date()
};

const mutations = {
    setPos(state, payload = {}) {
        state.ll = payload;
        state.last = new Date();
        state.addr = null;
    },
    setAddr(state, payload = {}) {
        state.addr = payload;
    }
};

const actions = {
    addr(store){
        geo.addr(store.state.ll).then((data)=>{
            store.commit('setAddr', data);
        });
    },
    current(store){
        var ll = {};
        
        const p = (resolve, reject) => {
/*TODO: city pos
            const _by_ip = function(){
                $.getJSON(API_URL + 'check?access_key=' + API_KEY, (data)=>{
                    console.log('by ip:', data);
                    ll = {
                        lat: data.latitude,
                        lon: data.longitude
                    };
                    store.commit('setPos', ll);
                    store.dispatch('addr');
                    resolve(ll);
                }).fail((err)=>{
                    console.log('by ip error:', err );
                    reject(err);
                });
            };
*/            
            if(!!navigator.geolocation){
                var hTm = setTimeout(()=>{reject({message:'no gps avail'});}, 5050);
                navigator.geolocation.getCurrentPosition(
                    function(pos){
                        console.log('by geolocation:', pos.coords);
                        ll = {
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude
                        };
                        clearTimeout(hTm);
                        store.commit('setPos', ll);
                        store.dispatch('addr');
                        resolve(ll);
                    }, 
                    function(err){
                        console.log('ERR by geolocation:', err);
                        clearTimeout(hTm);
                        reject(err);
                        //_by_ip();
                    },
                    {maximumAge: 180000, timeout: 5000, enableHighAccuracy: true}
                );
            } else {
//                _by_ip();
                reject({message:'no gps avail'});
            }
        };
        
        return new Promise(p);
    }
};

const getters = {
    distance(state){
        return (ll) => {
            return geo.distance(state.ll, ll);
        };
    },
    city(state){
        if ((!!state.addr)&&(state.addr.address)){
            return state.addr.address.city || '';
        }
        return '';
    }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
const API_URL = 'http://api.ipstack.com/';
const API_KEY = '739747a9f6f716d960608c3ee375b337';

const state = {
    geo: null
};

const mutations = {
    setGeo(state, payload = {}) {
        state.geo = payload;
    }
};

const actions = {
    current(store){
        console.log('resolving current pos', store);
        const p = (resolve, reject) => {
            const _by_ip = function(){
                $.getJSON(API_URL + 'check?access_key=' + API_KEY, (data)=>{
                    console.log('by ip:', data);
                    resolve(data);
                }).fail((err)=>{
                    console.log('by ip error:', err );
                    reject(err);
                });
            };
            _by_ip();
            
            if(!!navigator.geolocation){
                navigator.geolocation.getCurrentPosition(
                    (pos)=>{
                        console.log('by geolocation:', pos.coords);
                        resolve(pos);
                    }, 
                    (err)=>{
                        console.log('ERR by geolocation:', err);
                        _by_ip();
                    },
                    {timeout: 2000, enableHighAccuracy: true}
                );
            } else {
                _by_ip();
            }
        };
        
        return new Promise(p);
    }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
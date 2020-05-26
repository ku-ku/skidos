<template>
  <v-app>
    <v-app-bar
      app
      v-if="showAppBar"
      >
    </v-app-bar>
    <v-content>
        <keep-alive include="ViewMain,ViewStore">
            <router-view />
        </keep-alive>
    </v-content>
    <splash v-if="splash" ref="splash" on:hide="splash=false" />
    <v-snackbar v-model="snackbar"
                :bottom="true"
                :color="snackbarColor"
                :multi-line="true"
                :timeout="snackbarTimeout">
            {{ snackbarText }}
      <v-btn
        dark
        text
        title="Закрыть"
        @click="snackbar = false">
          <svg viewBox="0 0 320 512"><use xlink:href="#close" /></svg>
      </v-btn>                    
    </v-snackbar>
  </v-app>
</template>

<script>
import Splash from '@/views/splash';
import PushController from '@/utils/push';

export default {
    name: 'App',

    components: {
        Splash
    },

    data: function(){
      return {
          splash: true,
          snackbar: false,
          snackbarColor: "primary",
          snackbarText: null,
          snackbarTimeout: 0,
          activeBtn: -1
      };
    },
    created: function(){
        window['app'] = this;
        window['app'].utils = $utils;
                
        var self = this;
        var _go = function(name){
            setTimeout(()=>{
                self.$refs.splash.hide();
                self.$router.replace({name: name});
            }, 2500);
        };
        this.$store.dispatch('profile/check')
            .then( ()=> {
                _go('main');
            })
            .catch( ()=> {
                _go('signin');
            });
    },
    beforeDestroy(){
        PushController.destroy();
    },
    computed: {
        showAppBar(){
            const {$route} = this;
            if (typeof $route.meta.showAppBar !== 'undefined') {
                return $route.meta.showAppBar;
            } else {
                return false;
            }
        },
        showNavi(){
            const {$route} = this;
            if (typeof $route.meta.showNavi !== 'undefined') {
                return $route.meta.showNavi;
            } else {
                return false;
            }
        },
        user(){
            return this.$store.state.profile.user.name;
        },
        prod(){
            return this.$store.state.active.store;
        },
        hasProd(){
            return (!!this.prod)&&(!$utils.isEmpty(this.prod.id));
        }
    },
    methods: {
        msg: function(e){
            if ($utils.isEmpty(e.text)){
                this.snackbar = false;
                return;
            }
            this.snackbarColor = (!!e.color) ?  e.color : "primary";
            this.snackbarTimeout = (!!e.timeout) ? e.timeout : 6000;
            this.snackbarText = e.text;
            this.snackbar = true;
        },
        onUser(user){
            //setup ping-timer
            if (!!this._hTimer){
                clearInterval(this._hTimer);
            }
            this._hTimer = setInterval(()=>{
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
                        this.pingFail();
                    }
                })();
            }, 10*60*1000);
            
            //init websock
            if(!!this.ws){
                this.ws.close();
            }
            
            try {
                var sock = new WebSocket(process.env.VUE_APP_BACKEND_WS);
                sock.onmessage = (e)=>{
                    console.log(e.data);
                };
                sock.onopen = ()=>{
                    this.ws = sock;
                    var info = {
                        uid: user.id
                    };
                    (async ()=>{
                        try {
                            info.regId = await PushController.init();
                        }catch(e){
                            console.log('No push initialized:', e);
                        }
                    })();
                    sock.send(JSON.stringify(info));
                };
            }catch(e){
                console.log('sock no opened:', e);
            }
        },  //onUser
        pingFail(){
            this.$router.replace({name: 'signin'});
        }
    }
};
</script>

<style lang="scss" scoped>
    .v-snack svg {
        width: 18px;
        height: 18px;
    }
    .v-bottom-navigation svg{
        width: 24px;
        height: 24px;
    }
</style>
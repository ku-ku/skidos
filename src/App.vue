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
    <splash v-if="splash" ref="splash" on:hide="hideSplash($event)" />
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
import {eventBus} from './main';

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
        this.$store.dispatch('geo/current');
    },
    beforeDestroy(){
        PushController.destroy();
        if(!!this.ws){
            this.ws.close();
        }
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
        hideSplash(e){
            console.log(e);
            this.splash = false;
        },
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
            const PING_TM = 10*60*1000;
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
            }, PING_TM);
            
            //init websock
            if(!!this.ws){
                this.ws.close();
            }
            
            if (!!this._hwsTimer){
                clearInterval(this._hwsTimer);
            }
            var _check_sock = function(){
                var sock = app.ws;
                if (!!sock){
                    try {
                        if (sock.readyState !== sock.OPEN){
                            sock.close();
                            throw 'sock closed';
                        }
                        sock.send('ping');  //TODO: reconnect
                    } catch(e) {
                        sock = null;
                        console.log('WS ping error:', e);
                    }
                }
                if (!sock){
                    sock = new WebSocket(process.env.VUE_APP_BACKEND_WS);
                    sock.onmessage = (e)=>{
                        console.log('MSG:', e.data);
                        try {
                            var msg = /^\{+/.test(e.data) ? JSON.parse(e.data) : null;
                            if ((!!msg) && !$utils.isEmpty(msg.type)){
                                switch(msg.type) {
                                    case 'chat':
                                        eventBus.$emit('chat', msg.text);
                                        break;
                                }
                            }
                        } catch(e) {
                            console.log('MSG err:', e);
                        }
                    };  //sock.onmessage
                    sock.onopen = ()=>{
                        app.ws = sock;
                        (async ()=>{
                            var info = {uid: user.id};
                            try {
                                sock.send(JSON.stringify(info));
                                info.regId = await PushController.init();
                                sock.send(JSON.stringify(info));
                            }catch(e){
                                console.log('No push initialized:', e);
                            }
                        })();
                    };
                }
            };  //_get_sock
            this._hwsTimer = setInterval(()=>{_check_sock();}, PING_TM);
            _check_sock();
            
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
<template>
  <v-app>
    <v-app-bar
      app
      v-if="showAppBar"
      >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
    <v-bottom-navigation
        app
        :value="activeBtn"
        color="primary"
        v-if="showNavi"
    >
        <v-btn to="/">
            <span>главный</span>
        </v-btn>
        <v-btn to="/cards">
          <span>мои карты</span>
        </v-btn>
        <v-btn to="/stores">
          <span>магазины</span>
        </v-btn>
        <v-btn to="/profile">
          <span>профиль</span>
        </v-btn>
    </v-bottom-navigation>  
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

export default {
  name: 'App',

  components: {
  },

  data: function(){
      return {
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
  },
  mounted: function(){
    var is_first = false;
    if (window.localStorage){
        var v = window.localStorage.getItem('first-show');
        is_first = !((v)&&("1"===v));
        localStorage.setItem('first-show', "1"); //TODO:
    }
    if (is_first) {
        this.$router.push({name: 'first'});
    }
    this.$router.push({name: 'signin'});
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
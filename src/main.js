import Vue from 'vue'
import jQuery from 'jquery'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import Router from '@/router';
import Store from '@/store';
import pushes from '@/utils/push';

Vue.config.productionTip = false;
Vue.config.performance = true

window.jQuery = jQuery;
window.$ = jQuery;
document.addEventListener('deviceready', function(){
  return true;
});
new Vue({
  vuetify,
  router: Router,
  store: Store,
  created: function(){
      pushes.init();
  },
  render: h => h(App)
}).$mount('#app');

export const eventBus = new Vue();
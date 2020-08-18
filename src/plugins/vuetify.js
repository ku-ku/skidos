import '@fortawesome/fontawesome-free/css/all.css';
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { Ripple } from 'vuetify/lib/directives'

Vue.use(Vuetify, {
        directives: {
            Ripple
        }
    }
);

export default new Vuetify({
    icons: {
        iconfont: 'fa'
    }
});

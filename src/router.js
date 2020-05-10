import Vue from 'vue';
import Router      from 'vue-router';
import ViewFirst   from '@/views/first';
import ViewSignIn  from '@/views/signin';
import ViewMain    from '@/views/main';
import ViewStores  from '@/views/stores';
import ViewStore   from '@/views/store';
import ViewProfile from '@/views/profile';
import ViewOrder   from '@/views/order';
import ViewOrders  from '@/views/orders';
import store from '@/store';

/**
 * Code below due
 * https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
 */ 
const originalPush = Router.prototype.push;
const originalReplace = Router.prototype.replace;

Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject);
  }
  return originalPush.call(this, location).catch((err) => err);
};

Router.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalReplace.call(this, location, onResolve, onReject);
  }
  return originalReplace.call(this, location).catch((err) => err);
};

Vue.use(Router);

const isAuth = function(to, from, next) {
    var res = store.getters['profile/isAuthenticated'];
    if (res) {
        next();
        return;
    }
    next('/login');
};

const router = new Router({
  mode: process.env.CORDOVA_PLATFORM ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes: [
      {
        path: '/',
        name: 'main',
        component: ViewMain,
        meta: {
            showAppBar: false,
            showNavi: false
        },
        beforeEnter: isAuth
      },
      {
        path: '/first',
        name: 'first',
        component: ViewFirst,
        meta: {
            showAppBar: false,
            showNavi: true
        }
      },
      {
        path: '/stores',
        name: 'stores',
        component: ViewStores,
        meta: {
            showAppBar: true,
            showNavi: true
        },
        beforeEnter: isAuth
      },
      {
        path: '/store/:id',
        name: 'store',
        component: ViewStore,
        props: true,
        meta: {
            showAppBar: false,
            showNavi: false
        },
        beforeEnter: isAuth
      },
      {
        path: '/store/:store/order/:order',
        name: 'order',
        component: ViewOrder,
        props: true,
        meta: {
            showAppBar: false,
            showNavi: false
        },
        beforeEnter: isAuth
      },
      {
        path: '/orders',
        name: 'orders',
        component: ViewOrders,
        meta: {
            showAppBar: false,
            showNavi: false
        },
        beforeEnter: isAuth
      },
      {
        path: '/signin',
        name: 'signin',
        component: ViewSignIn,
        meta: {
            showAppBar: false,
            showNavi: false
        }
      },
      {
        path: '/profile',
        name: 'profile',
        component: ViewProfile,
        meta: {
            showAppBar: false,
            showNavi: false
        }
      }
  ]
});

export default router;

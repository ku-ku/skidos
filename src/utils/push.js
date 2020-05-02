import Store from '@/store';

let PushController;

function onRegistration(data) {
  const {registrationId} = data;

  Store.commit('settings/setPush', {
    fcmId: registrationId,
    value: true
  });
}

/**
 * Handler on notification
 * @param {Object} data
 */
function onNotification(data) {
  // @todo
  console.log('PUSH.onNotification', data);
}

/**
 * Handler on error
 * @param {Object} err
 */
function onError(err) {
  // @todo
}

function onUnregisterSuccess() {
  // @todo
  console.log('PUSH.onUnregisterSuccess');
  Store.commit('settings/setPush', {
    fcmId: undefined,
    value: false
  });
}

function onUnregisterError(data) {
  console.log('PUSH.onUnregisterError', data);
}

function init() {
  if (typeof window.PushNotification !== 'undefined') {
    const options = {
      android: {},
      ios: {
        alert: 'true',
        badge: 'true',
        sound: 'true'
      }
    };

    PushController = window.PushNotification.init(options);

    PushController.on('registration', onRegistration);
    PushController.on('notification', onNotification);
    PushController.on('error', onError);
  }
}

function destroy() {
  if (PushController === undefined) return;

  PushController.unregister(onUnregisterSuccess, onUnregisterError);
}

export default {
  init,
  destroy,
  set enable(bool) {
    if (bool) {
      this.init();
    } else {
      this.destroy();
    }
  }
};

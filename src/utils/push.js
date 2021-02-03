import Store from '@/store';

var PushController;

function onNotification(data) {
  // @todo
  //app.msg({text:data, type:'warning'});
  console.log('PUSH.onNotification', data);
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
    const _p = (resolve, reject) => {
        if (typeof window.PushNotification === 'undefined') {
            reject({error:'No push`s available'});
        } else {
            const opts = {
                android: {
                    senderID: process.env.VUE_APP_SENDER_ID,
                    forceShow: 'true'
                },
                ios: {
                    senderID: process.env.VUE_APP_SENDER_ID,
                    gcmSandbox: 'false',
                    alert: 'true',
                    badge: 'true',
                    sound: 'true'
                }
            };
            PushController = window.PushNotification.init(opts);
            PushController.on('notification', onNotification);
            PushController.on('error', (err)=>{
                reject(err);
            });
            PushController.on('registration', (data)=>{
                const {registrationId} = data;
                Store.commit('settings/setPush', {
                  fcmId: registrationId,
                  value: true
                });
                resolve(registrationId);
            });
        }
    };
    return new Promise(_p);
}

function destroy() {
  if (PushController === undefined) return;

  PushController.unregister(onUnregisterSuccess, onUnregisterError);
}

export default {
  init,
  destroy
};

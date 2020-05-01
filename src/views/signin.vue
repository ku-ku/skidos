<template>
    <v-row class="fill-height flex-md-column" justify="center">
        <div class="v-banner sk-banner-signin">
            <img v-if="is('auth')" src="@/assets/imgs/family.png" />
            <img v-else-if="is('register')" src="@/assets/imgs/hands.png" />
            <div v-else class="d-flex align-center justify-space-between" style="padding:0 2rem;border-bottom: 1px solid #ccc;">
                <h2 style="font-weight:300;color:#5e6ff3;">моикарты.рф</h2>
                <div style="width:32px;height:32px;">
                    <v-img src="@/assets/imgs/my-logo.png" />
                </div>
            </div>
        </div>
        <v-col cols="10" sm="8" md="4" style="margin:0 auto;">
            <v-form v-on:submit="on_auth($event)" action="#" v-if="is('auth')" v-model="valid">
                <v-card class="elevation-2">
                    <v-card-text>
                        <v-text-field
                            label="Имя"
                            name="u"
                            type="text"
                            v-model="login"
                            required
                        >
                            <svg slot="prepend" viewBox="0 0 496 512"><use xlink:href="#ico-morda" /></svg>
                        </v-text-field>
                        <v-text-field
                            label="Пароль"
                            name="p"
                            type="password"
                            v-model="pwd"
                            required
                        >
                            <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-asterisk" /></svg>
                        </v-text-field>
                        <v-alert type="warning" class="my-5" v-show="!/^$/.test(error)">
                            {{ error }}
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn rounded type="submit" dark color="red darken-4">Войти</v-btn>
                        <v-btn text small class="ref-register" v-on:click="set('register')">зарегистрироваться</v-btn>
                        <v-btn text small v-on:click="set('forgot')">забыли пароль?</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
            <v-form v-else-if="is('register')" v-model="valid" v-on:submit="on_register($event)" action="#">
                <v-card class="elevation-4">
                    <v-card-text>
                        <v-text-field
                            label="Ваше имя"
                            name="u"
                            type="text"
                            v-model="login"
                            required
                            autofocus
                        >
                            <svg slot="prepend" viewBox="0 0 496 512"><use xlink:href="#ico-morda" /></svg>
                        </v-text-field>
                        <v-text-field
                            label="Пароль"
                            name="p1"
                            type="password"
                            v-model="pwd"
                            required
                        >
                            <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-asterisk" /></svg>
                        </v-text-field>
                        <v-text-field
                            label="Повторите пароль"
                            name="p2"
                            type="password"
                            v-model="pwd2"
                            required
                        >
                            <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-asterisk" /></svg>
                        </v-text-field>
                        <v-text-field
                            label="e-mail"
                            name="eml"
                            type="text"
                            v-model="eml"
                            required
                            :rules="emailRules"
                        >
                            <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-at" /></svg>
                        </v-text-field>
                        <v-text-field
                            label="Телефон"
                            name="tel"
                            type="tel"
                            v-model="tel"
                            required
                            :rules="telRules"
                        >
                            <svg slot="prepend" viewBox="0 0 320 512"><use xlink:href="#ico-mobile" /></svg>
                        </v-text-field>
                        <v-switch v-model="agree" hide-details>
                            <template v-slot:label>
                                <div style="text-align:justify;font-size:0.9rem;">
                                    Отправляя данную форму, я согласен  
                                </div>
                            </template>
                        </v-switch>
                        <a href='//моикарты.рф/static/terms_of_use.html' target="_blank">с правилами использования данного приложения</a>
                        <v-alert type="warning"  class="my-5" v-show="!/^$/.test(error)">
                            <div v-html="error"></div>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn type="submit" rounded dark color="red darken-4">Зарегистрироваться</v-btn>
                        <v-btn text small class="ref-auth" v-on:click="set('auth')">авторизоваться</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
            <v-form v-else-if="is('forgot')" v-on:submit="on_forgot($event)" action="#">
                <v-card class="elevation-4">
                    <v-card-text>
                        <v-text-field
                            label="e-mail"
                            name="eml"
                            type="text"
                            v-model="eml"
                            required
                            autofocus
                            messages="Введите e-mail, указанный Вами при регистрации"
                            :readonly="is('forgotted')"
                            :rules="emailRules"
                        >
                            <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-at" /></svg>
                        </v-text-field>
                        <div v-if="is('reset')" class="mt-3">
                            <v-text-field
                                label="код"
                                name="code"
                                type="text"
                                v-model="code"
                                required
                                autofocus
                                messages="Введите код, отправленный Вам на e-mail"
                                :rules="codeRules"
                                >
                                <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-envel-open" /></svg>
                            </v-text-field>
                            <v-text-field
                                label="Пароль"
                                name="p1"
                                type="password"
                                v-model="pwd"
                                required
                            >
                                <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-asterisk" /></svg>
                            </v-text-field>
                            <v-text-field
                                label="Повторите пароль"
                                name="p2"
                                type="password"
                                v-model="pwd2"
                                required
                            >
                                <svg slot="prepend" viewBox="0 0 512 512"><use xlink:href="#ico-asterisk" /></svg>
                            </v-text-field>
                        </div>
                        <v-alert :type="alert"  class="my-5" v-show="!/^$/.test(error)">
                            <div v-html="error"></div>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn type="submit" rounded dark width="14rem" color="red darken-4">Сбросить пароль</v-btn>
                        <v-btn text small class="ref-auth" v-on:click="set('auth')">авторизоваться</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-col>
    </v-row>
</template>

<script>
const modes = {
    AM_NONE:     0,
    AM_AUTH:     1,
    AM_REGISTER: 2,
    AM_FORGOT:   3,
    AM_RESET:    4
};

export default {
  name: 'ViewSignIn',
  data() {
    return {
        mode: modes.AM_NONE,
        valid: false,
        login: '',
        pwd: '',
        pwd2: '',
        tel: '',
        telRules: [
            v => /^[\+]?\d{2,}?[(]?\d{2,}[)]?[-\s\.]?\d{2,}?[-\s\.]?\d{2,}[-\s\.]?\d{0,9}$/im.test(v) || 'укажите Ваш телефон для связи'
        ],
        eml: '',
        emailRules: [
            v => ($utils.isEmpty(v) || /.+@.+/.test(v)) || 'укажите корректный e-mail адрес'
        ],
        code: '',
        codeRules: [
            v => /^(\d{5,})+$/.test(v) || 'укажите код, отправленный Вам на e-mail'
        ],
        error: '',
        agree: false,
        alert: 'warning'    //for messages, TODO:
    };
  },
  mounted: function(){
      this.mode = modes.AM_AUTH;
  },
  watch: {
        mode: function(val){
            this.valid = true;
            this.error = '';
            this.alert = 'warning';
            var inp = null;
            switch(val){
                case modes.AM_AUTH:
                    this.title = 'Авторизация';
                    break;
                case modes.AM_REGISTER:
                    this.title = 'Регистрация';
                    break;
                case modes.AM_FORGOT:
                    inp = 'input[name="eml"]';
                    break;
                case modes.AM_RESET:
                    inp = 'input[name="code"]';
                    break;
            }
            this.$nextTick(() => {
                $(this.$el).find(inp || 'input[name="u"]').trigger('focus');
            });
        }     //mode
  },
  methods: {
      is: function(mode){
          switch(mode){
              case 'auth':
                  return (this.mode === modes.AM_AUTH);
              case 'register':
                  return (this.mode === modes.AM_REGISTER);
              case 'forgot':
                  return (this.mode === modes.AM_FORGOT) 
                       ||(this.mode === modes.AM_RESET);
              case 'reset':
                  return (this.mode === modes.AM_RESET);
              default:
                  return false;
          }
      },
      set: function(mode){
          switch(mode){
              case 'auth':
                  this.mode = modes.AM_AUTH;
                  break;
              case 'register':
                  this.mode = modes.AM_REGISTER;
                  break;
              case 'forgot':
                this.mode = modes.AM_FORGOT;
                break;
              case 'reset':
                this.mode = modes.AM_RESET;
                break;
              default:
                  this.mode = modes.AM_AUTH;
          }
      },
      on_auth: function(e){
        e.preventDefault();
        const {login, pwd} = this;
        console.log('on_auth: ', login, pwd);
        if ($utils.isEmpty(login) || $utils.isEmpty(pwd)) {
            this.valid = false;
            this.error = 'Для входа необходимо ввести Ваши логин и пароль';
            $('input[name="u"]').trigger('focus');
            return false;
        }

        (async () => {
            try {
                var res = await this.$store.dispatch('profile/login', {user: { login: login, password: pwd }});
                console.log(res);
                this.$router.replace({name: 'main'});
            } catch(e) {
                console.log(e);
                this.error = 'Логин или пароль неверный';
            }
        })();
        
        return false;
      },     //on_auth
      on_register: function(e){
        e.preventDefault();
        if ( $utils.isEmpty(this.login) || 
             $utils.isEmpty(this.pwd)   ||
             $utils.isEmpty(this.tel)   ||
             $utils.isEmpty(this.eml)
            ) {
            this.valid = false;
            this.error = 'для регистрации необходимо заполнить все данные';
            $('input[name="u"]').trigger('focus');
            return false;
        }
        if (this.pwd!==this.pwd2){
            this.valid = false;
            this.error = 'пароли не совпадают';
            $('input[name="p1"]').trigger('focus');
            return false;
        }
        if (!this.agree){
            this.error = 'Вы должны согласиться с правилами использования нашего приложения';
            return false;
        }

        var self = this;

        const url = process.env.VUE_APP_BACKEND_API + '/skidosapi/reg-user';
        const options = {
            dataType:'json',
            method: 'POST',
            contentType:'application/json;charset=utf-8',
            data: JSON.stringify({client: 
                {   
                    "name": this.login,
                    "title": this.login,
                    "password": this.pwd,
                    "email": this.eml,
                    "phone":this.tel
                }
            })
        };

        (async () => {
            try {
                var res = await $.ajax(url, options);
                if ((!!res.id)&&("null"!==res.id)){
                    self.$store.dispatch('profile/login', {user: { login: self.login, password: self.pwd }})
                } else {
                    if ((!!res.success)&&(res.success==="user exists")){
                        throw {message:'пользователь уже существует'};
                    } else {
                        throw (res.error) ? res.error : res.success;
                    }
                }
            } catch(e){
                console.log(e);
                self.error = 'Возникла ошибка при регистрации - попробуйте повторить попытку позднее.<br />'
                            +'<small>Дополнительная информация: ' + e.message + '</small>';
            }
        })();
      },    //on_register
      async _get_code(){
        const url = process.env.VUE_APP_BACKEND_API + '/skidosapi/reset-pass';
        const opts = {
            dataType:'json',
            method: 'POST',
            contentType:'application/json;charset=utf-8',   
            data: JSON.stringify({"email": this.eml, "mode":"reset"})
        };
        try {
            var res = await $.ajax(url, opts);
            console.log('send forgot:', res);
            if (res.success){
                this.set('reset');
            } else {
                throw {message:'пользователь с указанным e-mail не существует'};
            }
        } catch(e){
            console.log('Error on get code:', e);
            this.valid = false;
            this.error = 'Возникла ошибка.<br />' 
                        + ((e)&&(e.message) 
                            ? '<small>Дополнительная информация: ' + e.message + '</small>' : 'Попробуйте еще раз.');
        }
      },    //_get_code
      async _reset_pw(){
        if ( $utils.isEmpty(this.pwd)
             || $utils.isEmpty(this.pwd2)
             || $utils.isEmpty(this.code)
            ) {
            this.valid = false;
            this.error = 'для регистрации необходимо заполнить все данные';
            $('input[name="code"]').trigger('focus');
            return false;
        }
        if (this.pwd!==this.pwd2){
            this.valid = false;
            this.error = 'пароли не совпадают';
            $('input[name="p1"]').trigger('focus');
            return false;
        }
        const url = process.env.VUE_APP_BACKEND_API + '/skidosapi/reset-pass';
        const opts = {
            dataType:'json',
            method: 'POST',
            contentType:'application/json;charset=utf-8',
            data: JSON.stringify({"mode":"newpass", "email": this.eml, "code": this.code, "password": this.pwd})
        };
        try {
            var res = await $.ajax(url, opts);
            console.log('send pass:', res);
            if (!!res.success){
                this.alert = 'success';
                this.error = 'Пароль успешно изменен. Вы можете авторизоваться с новым паролем.';
                setTimeout(()=>{
                    this.set('auth');
                }, 3000);
            } else {
                throw {message: 'Неверный код подтверждения'};
            }
        } catch(e){
            console.log('Error on get code:', e);
            this.valid = false;
            this.error = 'Возникла ошибка.<br />' 
                        + ((e)&&(e.message) 
                            ? '<small>Дополнительная информация: ' + e.message + '</small>' : 'Попробуйте еще раз.');
        }
      },    //_reset_pw
      on_forgot(e){
        e.preventDefault();
        if ( $utils.isEmpty(this.eml) ) {
            this.valid = false;
            this.error = 'для регистрации необходимо заполнить все данные';
            $('input[name="eml"]').trigger('focus');
            return false;
        }
        switch( this.mode ) {
            case modes.AM_FORGOT:
                this._get_code();
                break;
            case modes.AM_RESET:
                this._reset_pw();
                break;
        }
        return false;
      }
  }
};
</script>

<style lang="scss" scoped>
    .sk-banner-signin{
        width:100%;
        max-width: 900px;
        margin: 0 auto;
        text-align: center;
        padding: 1rem;
        & img{
            width: 100%;
            height: auto;
        }
    }
    .v-card {
        & .v-card__actions{
            text-align: center;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            & .v-btn{
                width:14rem;
                margin-bottom: 1rem;
            }
        }
    }
    
    .v-input{
        & svg{
            width: 16px;
            height: 16px;
            color: #bdbdbd;
        }
    }
</style>
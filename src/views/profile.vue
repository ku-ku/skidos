<template>
    <v-row class="fill-height flex-md-column" align="center" justify="center">
        <div class="v-banner sk-banner-signin"> 
            <img src="@/assets/imgs/hands.png" />
        </div>
        <v-col cols="10" sm="8" md="4">
            <v-form v-model="valid" v-on:submit="on_profile($event)" action="#">
                <v-card class="elevation-4 pb-5">
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
                        <v-switch v-model="agree">
                            <template v-slot:label><div style="text-align:justify;font-size:0.9rem;">Отправляя данную форму, я согласен с <a href='#'>правилами использования приложения</a></div></template>
                        </v-switch>
                        <v-alert type="warning"  class="my-5" v-show="!/^$/.test(error)">
                            <div v-html="error"></div>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn type="submit" rounded dark width="14rem" color="red darken-4">Изменить данные</v-btn>
                        <div class="d-flex mt-3 justify-space-between" style="width:14rem;">
                            <v-btn type="button" small text to="/">На главную</v-btn>
                            <v-btn type="button" small text v-on:click.stop="signout">
                                <svg style="width:18px;height:18px;" viewBox="0 0 512 512"><use xlink:href="#ico-signout" /></svg>
                            </v-btn>
                        </div>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-col>
    </v-row>
</template>

<script>

export default {
  name: 'ViewProfile',
  data() {
    return {
        valid: false,
        login: '',
        pwd: 'stub',
        pwd2: 'stub',
        tel: '',
        telRules: [
            v => /^[\+]?\d{2,}?[(]?\d{2,}[)]?[-\s\.]?\d{2,}?[-\s\.]?\d{2,}[-\s\.]?\d{0,9}$/im.test(v) || 'укажите Ваш телефон для связи'
        ],
        eml: '',
        emailRules: [
            v => /.+@.+/.test(v) || 'укажите корректный e-mail адрес'
        ],
        error: '',
        agree: false
    };
  },
  computed: {
        userId(){
            return this.$store.state.profile.user.id;
        }
  },
  mounted: function(){
        this.load();
        this.$nextTick(() => {
            $('input[name="u"]').trigger('focus');
        });
  },
  methods: {
    async load(){
        const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc',
              opts = {
                    type: 'core-read',
                    query: 'sin2:/v:b841fde1-394a-4ab1-8ca7-48446f58c27e?id=' + this.userId
                };
        this.loading = true;
        try{
            var resp = await $http.post(url, opts);
            if (resp.error){
                throw resp.error;
            }
            console.log('Profile:', resp);
        } catch(e){
            app.msg({text:'Ошибка получения данных профиля, попробуйте получить позднее.', type:'warning'});
            console.log('ERR on profile read:', e);
        }
        this.loading = false;
    },
    on_profile: function(e){
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
      },    //on_profile
      signout(e){
          e.preventDefault();
          this.$store.dispatch('profile/logout').then(()=>{
              this.$router.go('/signin');
          });
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
            flex-direction: column;
            align-items: center;
            & .ref-auth, & .ref-register{
                font-size: 0.75rem;
                color: #777;
                text-decoration: none;
                margin: 1.5rem auto;
                &:hover{
                    color: blue;
                }
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

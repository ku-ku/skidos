<script>
import { 
        VCard,
        VCardText,
        VCardTitle,
        VCardSubtitle,
        VCardActions,
        VImg,
        VBtn,
        VSubheader,
        VSkeletonLoader,
        VTextField
       } from 'vuetify/lib';
const modes = {
    OM_ERROR: -1,
    OM_NONE: 0,
    OM_LOADING: 1,
    OM_READY: 2,
    OM_ORDER: 3
};
const times = {
    TM_AM: 0,
    TM_PM: 1,
    TM_EV: 2
};

export default {
    name: 'ViewOrder',
    components: {
        VCard,
        VCardText,
        VCardTitle,
        VCardSubtitle,
        VCardActions,
        VImg,
        VBtn,
        VSubheader,
        VSkeletonLoader,
        VTextField
    },
    props: {
        order: {
            type: String,
            required: true
        },
        store: {
            type: String,
            required: true
        }
    },
    data(){
        return {
            state: modes.OM_NONE,
            valid: true,
            n: 1,
            today: true,
            time: times.TM_AM
        };
    },
    computed: {
        user(){
            return this.$store.state.profile.user;
        },
        prod(){
            return this.$store.state.active.action;
        },
        magaz(){
            return this.$store.state.active.store;
        },
        totals(){
            var p = parseFloat(this.prod.newprice);
            return this.n * p;
        }
    },
    mounted(){
        this.$nextTick(()=>{
            var i = $(this.$el).find('.sk-choice input');
            i.css({'text-align': 'center'});
            this.state = modes.OM_READY;
        });
    },
    methods: {
        back(){
            this.$router.go(-1);
        },
        pm(add){
            var n = this.n + ((add) ? 1 : -1);
            if (n < 1){
                n = 1;
            }
            this.n = n;
        },
        day(today){
            this.today = today;
        },
        do_order(){
            this.valid = !isNaN(parseFloat(this.n));
            if (!this.valid){
                return;
            }
            this.state = modes.OM_ORDER;
            setTimeout(()=>{
                this.state = modes.OM_READY;
                app.msg({'text':'Эта функция еще не реализована',color:'warning'});
            }, 1000);
        }
    },
    render(h){
        const prod = this.prod,
              accent = 'red darken-4';
        return h('v-card', {
            key: 'ord-' + prod.id,
            class: {'sk-order': true /*, 'fill-height': true*/},
            props: {flat: true, tile: true}
        },[
            h('v-card-title', {class:{"headline":true}}, [
                h('div', {class:{'sk-top-bar': true}}, [
                    h('v-btn', {props: {
                                    dark: true,
                                    icon: true,
                                    small: true,
                                    tile: true
                                }, on: {
                                    click: this.back
                                }}, [
                        h('svg', {attrs: {viewBox:"0 0 192 512"}, domProps:{innerHTML: '<use xlink:href="#ico-left" />'}})
                    ]),
                    h('h3', prod.mainorgname)
                ]),
                /* h('v-img', {
                    props: {
                        src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + this.magaz.brandlogo.ref,
                        width: 96,
                        'max-width': 96,
                        height: 96,
                        'max-height': 96
                    }, class: {'sk-logo': true}
                }),*/
                h('v-img', {props: {
                        'max-height': 240,
                        contain: true,
                        src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + prod.promoimage.ref
                }})
            ]),
            h('v-card-subtitle', [
                h('h1', {class: {'sk-name': true}}, prod.promogoods),
                h('h2', {class: {'sk-prod': true}}, prod.promoproducer)
            ]),
            h('v-card-actions', [
                h('div', {class:{'sk-choice':true}}, [
                    h('v-btn',  {props: {
                                            'x-small': true,
                                            rounded: true,
                                            color:'grey darken-1',
                                            outlined: true
                                        },
                                 on: {click: ()=>{this.pm(false);}}
                    }, '-'),
                    h('v-text-field', {props: {
                        value: this.n,
                        color: 'default',
                        error: !this.valid
                    }}),
                    h('v-btn',  {props: {
                                            'x-small': true,
                                            rounded: true,
                                            color:'grey darken-1',
                                            outlined: true
                                        },
                                 on: {click: ()=>{this.pm(true);}}
                    }, '+')
                ]),
                h('div', {class:{'sk-price': true}}, this.totals + ' руб.'),
                h('div', {class:{'sk-days': true}}, [
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'small': true,
                                            width: '8rem', color: this.today ? accent : 'default', 'input-value': this.today
                                       },
                                class: {'mr-3': true},
                                on: {click: ()=>{this.day(true);}}
                                }, 'сегодня'),
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'small': true,
                                            width: '8rem', color: this.today ? 'default' : accent, 'input-value': !this.today
                                       },
                                on: {click: ()=>{this.day(false);}}
                                }, 'завтра')
                ]),
                h('div', {class:{'sk-times': true}}, [
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: 'auto', 
                                            color: (this.time===times.TM_AM) ? accent : 'default', 
                                            'input-value': (this.time===times.TM_AM)
                                       },
                                class: {'mr-3': true},
                                on: {click: ()=>{this.time = times.TM_AM;}}
                                }, '8:00 - 12:00'),
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: 'auto', 
                                            color: (this.time===times.TM_PM) ? accent : 'default', 
                                            'input-value': (this.time===times.TM_PM)
                                       },
                                class: {'active': this.today, 'mr-3': true},
                                on: {click: ()=>{this.time = times.TM_PM;}}
                                }, '12:00 - 18:00'),
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: 'auto', 
                                            color: (this.time===times.TM_EV) ? accent : 'default', 
                                            'input-value': (this.time===times.TM_EV)
                                       },
                                class: {'active': this.today},
                                on: {click: ()=>{this.time = times.TM_EV;}}
                                }, '18:00 - 21:00')
                ]),
                h('div', {class:{'sk-addr':true}}, [
                    h('svg', {attrs: {viewBox:"0 0 384 512"}, domProps:{innerHTML: '<use xlink:href="#ico-map-marker" />'}}), 
                    'Адрес доставки: ', 
                    ((this.user.adds)&&!$utils.isEmpty(this.user.adds.addrstring))
                        ? this.user.adds.addrstring 
                        : h('span', [
                                        'Вы можете указать в',
                                        h('v-btn', {props:{text: true, small: true, to:{name:'profile'}}}, 'настройках профиля')
                            ])
                ]),
                h('v-btn',  {props: {
                                        rounded: true,
                                        dark: true,
                                        outlined: true,
                                        color: 'red darken-4',
                                        width: '12rem',
                                        loading: (this.state === modes.OM_ORDER)
                                    },
                             on: {click: this.do_order},
                             class: {'mt-5': true}
                }, 'заказать')
            ])
        ]);
    }
};
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";
    
    .sk-order{
        color: $gray-color;
        padding: 1rem;
        height: 100%;
        & .sk-top-bar{
            padding: 1rem;
            position: absolute;
            z-index: 4;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            & .v-btn{
                border-radius: 50%;
                background: rgba(0,0,0, 0.18);
                width: 32px;
                height: 32px;
                line-height: 32px;
                text-align: center;
                color: #fff;
                margin-right: 1rem;
                & .v-btn__content{
                    display: inline;
                }
                & svg{
                    width: 18px;
                    height: 18px;
                    opacity: 0.75;
                }
            }
            & h3{
                font-weight: 400;
                font-size: 1.5rem;
                white-space: nowrap;
                overflow: hidden; 
                text-overflow: ellipsis;
            }
        }
        & .sk-logo{
            border: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.18);
            border-radius: 0 0 0 500px;
            position: absolute;
            right: 0;
            top: 0;
            & .v-image__image{
                background-size: cover;
            }
        }
        & .v-card__title{
            padding-top: 48px;
        }
        & .sk-name {
            color: #000;
            font-size: 1.125rem;
            font-weight: 400;
        }
        & .sk-prod{
            font-size: 0.85rem;
            font-weight: 400;
        }
        & .v-card__actions{
            flex-direction: column;
            & .sk-choice{
                display: flex;
                align-items: center;
                justify-content: center;
                & .v-btn{
                    width: 46px;
                    height: 46px;
                    min-width: 46px;
                    line-height: 46px;
                    font-size: 1.75rem;
                    border-radius: 500px;
                    padding: 0;
                    box-shadow: 0 0 4px rgba(0,0,0,0.18);
                }
                & .v-text-field{
                    width: 4rem;
                    max-width: 4rem;
                    margin: 0 2rem;
                    & input{
                        text-align: center;  
                    }
                }
            }
            & .sk-price{
                font-size: 2rem;
                font-weight: 300;
                text-align: center;
                margin: 0 auto 1rem auto;
                color: $red-color;
            }
            & .sk-days, & .sk-times{
                margin-bottom: 1.5rem;
                display: flex;
                flex-wrap: nowrap;
                flex-direction: row;
                justify-content: space-around;
            }
            & .sk-addr{
                & svg{
                    width: 18px;
                    height: 18px;
                    margin-right: 0.25rem;
                }
            }
        }
    }
</style>
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
            i.trigger('focus');
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
        const prod = this.prod;
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
                    h('h3', prod.mainorgname),
                    h('v-img', {
                        props: {
                            src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + this.magaz.brandlogo.ref,
                            width: 48,
                            'max-width': 48,
                            height: 48,
                            'max-height': 48
                            
                        }
                    })
                ]),
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
                                            color:'default',
                                            outlined: true
                                        },
                                 on: {click: ()=>{this.pm(false);}}
                    }, '-'),
                    h('v-text-field', {props: {
                        autofocus: true,
                        value: this.n,
                        color: 'default',
                        error: !this.valid
                    }}),
                    h('v-btn',  {props: {
                                            'x-small': true,
                                            rounded: true,
                                            color:'default',
                                            outlined: true
                                        },
                                 on: {click: ()=>{this.pm(true);}}
                    }, '+')
                ]),
                h('div', {class:{'sk-price': true}}, this.totals + ' руб.'),
                h('div', {class:{'sk-days': true}}, [
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: '8rem', color: 'default', 'input-value': this.today
                                       },
                                class: {'mr-3': true},
                                on: {click: ()=>{this.day(true);}}
                                }, 'сегодня'),
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: '8rem', color: 'default', 'input-value': !this.today
                                       },
                                on: {click: ()=>{this.day(false);}}
                                }, 'завтра')
                ]),
                h('div', {class:{'sk-times': true}}, [
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: 'auto', color: 'default', 'input-value': (this.time===times.TM_AM)
                                       },
                                class: {'mr-3': true},
                                on: {click: ()=>{this.time = times.TM_AM;}}
                                }, '8:00 - 12:00'),
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: 'auto', color: 'default', 'input-value': (this.time===times.TM_PM)
                                       },
                                class: {'active': this.today, 'mr-3': true},
                                on: {click: ()=>{this.time = times.TM_PM;}}
                                }, '12:00 - 18:00'),
                    h('v-btn', {props: {
                                            outlined: true, rounded: true, 'x-small': true,
                                            width: 'auto', color: 'default', 'input-value': (this.time===times.TM_EV)
                                       },
                                class: {'active': this.today},
                                on: {click: ()=>{this.time = times.TM_EV;}}
                                }, '18:00 - 21:00')
                ]),
                h('v-btn',  {props: {
                                        rounded: true,
                                        dark: true,
                                        outlined: true,
                                        color: 'red darken-4',
                                        width: '12rem',
                                        loading: (this.state === modes.OM_ORDER)
                                    },
                             on: {click: this.do_order}
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
        & .sk-top-bar{
            padding: 1rem;
            position: absolute;
            z-index: 4;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: space-between;
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
                font-size: 1.125rem;
                white-space: nowrap;
                overflow: hidden; 
                text-overflow: ellipsis;
            }
            & .v-image{
                border: #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.18);
                border-radius: 50%;
                & .v-image__image{
                    background-size: cover;
                }
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
                    width: 36px;
                    height: 36px;
                    min-width: 36px;
                    line-height: 36px;
                    font-size: 1.25rem;
                    border-radius: 500px;
                    padding: 0;
                    box-shadow: 0 0 4px rgba(0,0,0,0.18);
                }
                & .v-text-field{
                    width: 3rem;
                    max-width: 3rem;
                    margin: 0 1rem;
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
            }
        }
    }
</style>
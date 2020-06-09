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
        VTextField,
        VTextarea,
        VSwitch,
        VAlert,
        VBadge,
        VBottomSheet
       } from 'vuetify/lib';
import SkSvg from '@/components/SkSvg';
import SkBottom from '@/components/SkBottom';
import SkMap from '@/components/map';
import geo from '@/utils/geo';

const modes = {
    OM_ERROR:  -1,
    OM_NONE:    0,
    OM_LOADING: 1,
    OM_READY:   2,
    OM_ORDER:   3,
    OM_ADDED:   4,
    OM_SUCCESS: 5
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
        VTextField,
        VTextarea,
        VSwitch,
        VAlert,
        VBadge,
        VBottomSheet,
        SkBottom,
        SkSvg,
        SkMap
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
            note: null,
            today: true,
            time: times.TM_AM,
            adding: false,
            self: false,
            showMap: false
        };
    },
    computed: {
        user(){
            return this.$store.state.profile.user;
        },
        hasUserAddr(){
            const u = this.user;
            return ((!!u.adds) && !$utils.isEmpty(u.adds.addrstring));
        },
        prod(){ /*Product*/
            return this.$store.state.active.action;
        },
        magaz(){
            return this.$store.state.active.store;
        },
        total(){
            var p = parseFloat(this.prod.newprice);
            return this.n * p;
        },
        at(){
            var dt = new Date();
            dt.setMilliseconds(0);
            dt.setSeconds(0);
            dt.setMinutes(0);
            if (!this.today){
                dt.setDate(dt.getDate() + 1);
            }
            switch(this.time){
                case times.TM_AM:
                    dt.setHours(12);
                    break;
                case times.TM_PM:
                    dt.setHours(18);
                    break;
                case times.TM_EV:
                    dt.setHours(21);
                    break;
            }
            return dt;
        },
        distance(){
            var dist = 0;
            if (!!this.fill){
                dist = this.fill.distance;
            } else {
                var ll = null;
                if ((!!this.magaz.lat)&&(!!this.magaz.lat)){
                    ll = {
                        lat: this.magaz.lat,
                        lon: this.magaz.lon
                    };
                } else try {
                    (async ()=>{
                        ll = await geo.lookup(this.magaz.location);
                    })();
                } catch(e){
                    console.log(e);
                }
                dist = this.$store.getters["geo/distance"](ll);
            }
            if (dist < 0){
                return '';
            } else if (dist < 1000){
                return Math.floor(dist) + ' м.';
            } else {
                return Math.floor(dist/1000) + ' км.';
            }
        },
        fill: {
            get(){
                return this.$store.state.active.fill;
            },
            set(fill){
                this.$store.commit('active/setStoreFill', fill);
                this.$forceUpdate();
            }
        },
        addr(){
            return (!!this.fill) 
                    ? this.fill.address 
                    : geo.a2s(this.magaz.location) || '';
        }
    },
    mounted(){
        this.self = !(!!this.magaz.hasdelivery) 
                    || this.$store.getters['basket/self'](this.magaz.id);
        var d = new Date();
        if (d.getHours()<12){
            this.time = times.TM_AM;
        } else if (d.getHours()<18){
            this.time = times.TM_AM;
        } else {
            this.time = times.TM_EV;
        }
        this.$nextTick(()=>{
            var i = $(this.$el).find('.sk-choice input');
            i.css({'text-align': 'center', 'max-height': '3rem'});
            this.state = modes.OM_READY;
            $([document.documentElement, document.body]).animate({scrollTop: 0}, 100);
        });
        console.log('order (mnt)' + this);
        
    },
    activated(){
        console.log('order (active)' + this);
    },
    watch: {
        prod(val){
            console.log('order (prod)' + val);
        }
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
        in_cart(){
            return this.$store.getters["basket/has"](this.prod.id);
        },
        to_basket(){
            const tenantId = (!!this.fill) 
                                ? this.fill.id
                                : $utils.isEmpty(this.prod.orgid) 
                                    ? this.prod.mainorgid 
                                    : this.prod.orgid;
            var p = Object.assign({}, this.prod);
            
            p.store = {id: tenantId};
            p.num   = this.n;
            p.total = this.total;
            p.at    = this.at;
            p.note  = this.note;
            p.self  = (!!this.self) ? 1 : 0;
            this.$store.dispatch('basket/add', p);
            this.mode = modes.OM_ADDED;
            this.adding = true;
            setTimeout(()=>{this.adding = false;}, 600);
        },
        from_basket(){
            this.$store.dispatch('basket/rm', {id: this.prod.id});
            this.n = 1;
            this.mode = modes.OM_ORDER;
            this.$forceUpdate();
        },
        gomap(){
            this.showMap = (new Date()).getTime();
            const self = this;
            this.$nextTick(()=>{
                if (self.$store.getters["active/hasActiveStoreFills"]){
                    self.$store.dispatch("active/getFills").then((fills)=>{
                        self.$refs.storeMap.addPoints(fills);
                    });
                } else {
                    //self.$refs.storeMap.toCenter(self.magaz);
                    self.$refs.storeMap.addPoints([self.magaz]);
                }
            });
        }
    },
    
    render(h){
        const prod = this.prod,
              accent = 'red darken-4',
              gray   = 'grey darken-1',
              inCart = this.in_cart(),
              hasDeliv = this.magaz.hasdelivery;
        const isService = !(!!prod.isproduct);
      
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
                h('v-img', {props: {
                        'max-height': 280,
                        contain: true,
                        eager: true,
                        src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + prod.promoimage.ref
                }}),
                h('h1', {class: {'sk-name': true}}, prod.promogoods)
            ]),
            h('v-card-subtitle', [
                h('h2', {class: {'sk-prod': true}}, prod.promoproducer)
            ]),
            h('v-card-actions', [
                isService 
                    ? null
                    : h('div', {class:{'sk-choice':true}}, [
                        h('v-btn',  {props: {
                                                'x-small': true,
                                                rounded: true,
                                                color: gray,
                                                outlined: true
                                            },
                                     on: {click: ()=>{this.pm(false);}}
                        }, '-'),
                        h('v-text-field', {props: {
                            value: this.n,
                            color: 'default',
                            error: !this.valid,
                            'hide-details': true,
                            'single-line': true
                        }, style: {
                            'font-size': '2rem',
                            'height': '2.5rem'
                        }}),
                        h('v-btn',  {props: {
                                                'x-small': true,
                                                rounded: true,
                                                color: gray,
                                                outlined: true
                                            },
                                     on: {click: ()=>{this.pm(true);}}
                        }, '+')
                    ]), //sk-choice
                h('div', {class:{'sk-price': true}}, [
                    this.total + ' руб.',
                    $utils.isEmpty(prod.unitname) 
                        ? null
                        : h('div', {class:{'sk-units': true}}, prod.unitname)
                ]),
                $utils.isEmpty(prod.promodesc) ? null : h('div', {class:{'sk-descr': true}}, prod.promodesc),
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
                ]), //.sk-days
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
                ]), //.sk-times
                h('v-textarea', {props: {
                    "value": this.note,
                    "full-width": true,
                    "rows": 1,
                    "auto-grow": true,
                    "messages": 'комментарий к заказу'
                    }, class:{'sk-comments':true},
                    on: {input: (e)=>{this.note = e;}
                }}),
                isService 
                    ? null
                    : hasDeliv 
                        ? h('v-switch', {
                            props: {'input-value': this.self, inset: true, label:'заберу самостоятельно', disabled: !hasDeliv}, 
                            style: {"align-self":"flex-start", display: (hasDeliv) ? '' : 'none'},
                            on: {click: (e)=>{
                                    this.self = !this.self;
                        }}})
                        : h('div',{class:{'mt-3':true, 'mb-3':true}}, 'магазин не осуществляет доставку'),
                h('div', {class:{'sk-addr':true}}, 
                        (this.self || !hasDeliv || isService)
                            ? [h('div', {class:{'sk-self': true}}, [
                                this.addr,
                                h('v-btn', {
                                        props: {small: true, outlined: true, rounded: true, color: gray}, 
                                        on:    {click: this.gomap},
                                        style: {'align-self': 'center'}
                                    }, [
                                            h('sk-svg', {props: {xref:"#ico-planet"}}), 
                                            'на карте - ' + this.distance
                                       ]
                                )
                            ])]
                        : hasDeliv 
                            ? [
                                h('sk-svg', {props: {xref:"#ico-map-marker"}}), 
                                'Адрес доставки: ', 
                                (!!this.hasUserAddr)
                                    ? this.user.adds.addrstring
                                    : h('span', [
                                                    'Вы можете указать в',
                                                    h('v-btn', {props:{text: true, small: true, to:{name:'profile'}}}, 'настройках профиля')
                                       ])
                            ] 
                            : null
                ),      //.sk-addr
                (this.state === modes.OM_SUCCESS) 
                    ? h('v-alert', {props: {
                                        width: '100%',
                                        dense: true,
                                        dark: true,
                                        color: 'primary'
                                    },  
                                        class: {'mt-5': true},
                                        ref: "alert"
                                    }
                                , [
                        h('svg', {attrs: {viewBox:"0 0 512 512"}, domProps:{innerHTML: '<use xlink:href="#ico-chk-circle" />'}}),
                        'ВАШ ЗАКАЗ ОФОРМЛЕН, ',
                        h('div', {class:{'small':true, 'my-3': true}}, 'ожидайте сообщение о его готовности'),
                        h('div', {class:{'text-center':true}}, [
                            h('v-btn', {
                                props: {
                                            dense: true,
                                            dark: true,
                                            color: 'primary',
                                            small: true,
                                            rounded: true

                                }, on: {
                                    click: ()=>{this.$router.go(-1);}
                                }
                            }, [
                                h('svg', {attrs: {viewBox:"0 0 192 512"}, domProps:{innerHTML: '<use xlink:href="#ico-left" />'}}),
                                ' назад к списку'
                            ]),
                            h('div', {class:{'small':true, 'my-3': true}}, [
                              'историю заказов Вы можете посмотреть в разделе',
                                h('v-btn', {
                                    props: {
                                                'x-small': true,
                                                text: true,
                                                to: '/orders'
                                            }
                                        }, '«мои заказы»'
                                )
                            ])
                        ])
                    ])
                    : h('v-btn',  {props: {
                                        rounded: true,
                                        dark: true,
                                        outlined: true,
                                        color: 'red darken-4',
                                        width: '12rem',
                                        loading: this.adding
                                    },
                             on: {click: this.to_basket},   //do_order
                             class: {'mt-5 sk-to-cart': true}
                        }, [
                            inCart
                                ? h('div', {class:{'sk-in-cart': true}, style:{'background-color':'red darken-4'}}, [
                                     h('svg', {attrs: {viewBox:"0 0 576 512"}, domProps:{innerHTML: '<use xlink:href="#ico-check" />'}})
                                ])
                                : null,
                            inCart ? 'в корзине' : 'заказать'
                        ]),
                inCart
                    ? h('v-btn', {
                            props: {text:true, tile:true, width:'12rem'}, 
                            on:    {click: this.from_basket},
                            class: {'mt-3': true}
                        }, 'убрать')
                    : null
            ]),
            inCart 
                ? null
                : h('sk-bottom',  {
                        key: 'sk-bottom-map-' + this.prod.orgid,
                        props: {show: this.showMap}}, [
                        !!this.showMap
                            ? h('sk-map', {
                                    props: {
                                        center: this.magaz
                                    },
                                    ref: 'storeMap',
                                    on: {'click': (_fill)=>{
                                            if (typeof _fill === "string"){
                                                _fill = JSON.parse(_fill);
                                            }
                                            this.fill = _fill;
                                            this.showMap = false;
                                        }}
                                })
                            : null
                ])
        ]);
    }   //render
};
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";
    
    .sk-order{
        color: $gray-color;
        padding: 0;
        margin-bottom:  180px;
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
                background: rgba(0,0,0,0.33);
                width: 32px;
                height: 32px;
                line-height: 32px;
                text-align: center;
                color: #fff;
                margin-right: 1rem;
                border: 1px solid rgba(255,255,255,0.5);
                box-shadow: 0 2px 4px rgba(0,0,0,0.33);
                & .v-btn__content{
                    display: inline;
                }
                & svg{
                    width: 18px;
                    height: 18px;
                    opacity: 0.9;
                }
            }
            & h3{
                white-space: nowrap;
                overflow: hidden; 
                text-overflow: ellipsis;
                font-size: 1.125rem;
                font-weight: 400;
                color: #fff;
                text-shadow: 0 0 2px rgba(0,0,0,0.75);
                padding: 0.25rem 0.5rem;
            }
        }
        & .v-card__subtitle{
            margin-top: 1rem !important;
            padding: 1rem;
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
            padding: 0 !important;
            position: relative;
            &  .sk-name {
                left: 0;
                bottom: 0;
                z-index: 4;
                background: rgba(0,0,0,0.18);
                position: absolute;
                width: 100%;
                color: #fff;
                text-shadow: 0 0 4px rgba(0,0,0,0.75);
                white-space: nowrap;
                overflow: hidden; 
                text-overflow: ellipsis;
                font-size: 1.125rem;
                font-weight: 400;
                padding: 0.5rem;
            }
        }
        & .sk-prod{
            font-size: 0.85rem;
            font-weight: 400;
        }
        & .sk-descr{
            font-size: 0.85rem;
            color: $gray-color;
            margin-bottom: 1rem;
            line-height: 1.115;
        }
        & .v-card__actions{
            flex-direction: column;
            padding: 1rem;
            & .sk-choice{
                display: flex;
                align-items: baseline;
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
                line-height: 1.125;
                & .sk-units{
                    font-size: 1rem;
                }
            }
            & .sk-days, & .sk-times{
                margin-bottom: 1.5rem;
                display: flex;
                flex-wrap: nowrap;
                flex-direction: row;
                justify-content: space-around;
            }
            & .sk-comments{
                width: 100%;
            }
            & .sk-addr{
                margin-bottom: 1rem;
                margin-top: 1rem;
                & svg{
                    width: 16px;
                    height: 16px;
                    margin-right: 0.25rem;
                    vertical-align: middle;
                }
                & .sk-self{
                    display: flex;
                    flex-direction: column;
                    font-size: 0.8rem;
                    text-align: center;
                    justify-content: center;
                    & .v-btn{
                        margin-top: 1rem;
                        width: 12rem;
                    }
                }
            }
        }
        & .sk-in-cart{
            width: 36px;
            height: 36px;
            line-height: 44px;
            position: absolute;
            left: -9px;
            top: -10px;
            border-radius: 500px;
            border: 1px solid;
            padding: 0;
            text-align: center;
            & svg{
                width: 20px;
                height: 20px;
                margin: 0 auto;
            }
        }
        & .v-alert{
            svg{
                width: 18px;
                height: 18px;
                margin-right: 0.5rem;
            }
            & .v-alert__wrapper{
                display: block;
                & .v-btn{
                   margin: 0.5rem auto;
                }
                & .small{
                    font-size: 0.7rem;
                }
            }
        }
    }
</style>
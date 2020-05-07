<script>
import { 
        VCard,
        VCardText,
        VCardTitle,
        VImg,
        VBtn,
        VList,
        VSubheader,
        VListItem,
        VListItemGroup,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VSkeletonLoader,
        VTextField
       } from 'vuetify/lib';
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';
import moment from 'moment';

    
export default {
    name: 'SkActions',
    props: {
        store: {
            type: Object,
            required: true,
            default: function(){
                    return {id: '00'};
            }
        }
    },
    components: {
        VCard,
        VCardText,
        VCardTitle,
        VImg,
        VBtn,
        VList, 
        VSubheader,
        VListItem,
        VListItemGroup,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VSkeletonLoader,
        Swiper,
        SwiperSlide,
        VTextField
    },
    data(){
        return {
            loading: false,
            acts: null,
            skidos: null
        };
    },
    computed: {
        numOf(){
            return (this.acts) && (this.acts.data) ? this.acts.data.length : 0;
        },
        hasActs(){
            return (this.acts) && (this.acts.data) && (this.acts.data.length>0);
        },
        hasSkidos(){
            return (this.skidos) && (this.skidos.data) && (this.skidos.data.length>0);
        }
    },
    directives: {
        swiper: directive
    },    
    methods: {
        async load(){
            var url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc',
                opts = {
                    type: 'core-read',
                    query: 'sin2:/v:c1de84bd-de9a-45cb-b775-5e8b233e25e8?filter=eq(field(".mainOrgId")'
                           + ',param("' + this.store.id + '", "id"))'
                };
            this.loading = true;
            try{
                var res = await $http.post(url, opts);
                if (!!res.error){
                    throw res.error;
                }
                this.acts = res.result;
                
                opts.query = 'sin2:/v:9d6c4649-cf13-45b6-9b6a-b1af97513204?filter=eq(field(".mainOrgId")'
                           + ',param("' + this.store.id + '", "id"))';
                res = await $http.post(url, opts);
                if (!!res.result){
                    this.skidos = res.result;
                }
                
                this.$nextTick(()=>{
                    this.$emit('actions', this.numOf);
                    if ( this.$refs.swiper ){
                        this.$refs.swiper.updateSwiper();
                        this.$refs.swiper.swiperInstance.slideTo(0, 200, false);
                    }
                
                });
            }catch(e){
                console.log('Error:', e);
            }
            this.loading = false;
        },
        month(m){
            const MONTHS = {
                1: 'янв.',
                2: 'фев.',
                3: 'мар.',
                4: 'апр.',
                5: 'мая',
                6: 'июн.',
                7: 'июл.',
                8: 'авг.',
                9: 'сен.',
                10: 'окт.',
                11:'ноя.',
                12:'дек.'
            };
            return (!!m) ? MONTHS[Number(m)] : '';
        },
        on_order(a){
            const ci = this.skidos.columnIndexes;
            const keys = Object.keys(ci);
            var s, n, _a = {};
            keys.map((key)=>{
                n = key.lastIndexOf('.');
                s = (n < 0) ? key : key.substr(n + 1);
                _a[s] = a[ci[key]];
            });
            this.$store.commit('active/setAction', _a);
            this.$router.push({
                                name: 'order',
                                params: {store: this.store.id, order: _a.id}
            });
        }
    },
    mounted(){
        this.load();
    },
    render: function(h){
        var childs = [];
        if (this.hasActs){
            const ci = this.acts.columnIndexes;
            var items = [];
            this.acts.data.map((a) => {
                const img = a[ci["userpromotions.promoimage"]],
                      title = a[ci["userpromotions.promoname"]];
                if (!!img) {
                    items.push( h('swiper-slide', {
                        key: 'a-' + a[ci["userpromotions.id"]],
                        style: {width: 'auto'}
                    }, [
                        h('img',{
                                    attrs: {src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + img.ref, width:'100%', height:'auto'}
                        })
                    ]) );
                }
            });
           
            childs.push( h('swiper', {
                            class: {swiper: true, 'swiper-container': true},
                            ref: 'swiper',
                            props: {'auto-update': true,
                                    'auto-destroy': true,
                                    options: { 
                                        slidesPerView: 'auto',
                                        //centeredSlides: true,             
                                        spaceBetween: 12,
                                        loop: true
                            }}
                        }, items
            ));
        } if (this.hasSkidos){
            const ci = this.skidos.columnIndexes;
            childs.push( h('v-list', {class:{'sk-skidos':true}}, [
                this.skidos.data.map((a) => {
                    const id = a[ci["userpromoactions.id"]],
                          img = a[ci["userpromoactions.promoimage"]];
                    var dates = '';
                    if (!$utils.isEmpty(a[ci["userpromoactions.enddt"]])){
                        var d = new Date(a[ci["userpromoactions.enddt"]]);
                        dates = 'до ' + d.getDate() + ' ' + this.month(d.getMonth());
                    }
                    
                    return h('v-list-item', {
                                key: 'sk-' + id,
                                on: {click: ()=>{
                                    (!!this.store.hasonline) ? this.on_order(a) : void(0);
                                }}
                            }, [
                                h('v-list-item-icon', {class:{"mr-3": true}}, [
                                    (!!img) 
                                        ? h('v-img',{props: {
                                                                src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + img.ref,
                                                                'max-height': 86,
                                                                contain: true
                                                            }})
                                        : null,
                                    ($utils.isEmpty(dates))
                                        ? null
                                        : h('div', {class: {'sk-dates': true}}, dates)
                                ]),
                                h('v-list-item-content', [
                                    h('div',{class:{'sk-name': true}}, [
                                        a[ci["userpromoactions.promogoods"]]
                                    ]),
                                    h('div',{class:{'sk-price': true}}, [
                                        h('div',
                                            $utils.isEmpty(a[ci["userpromoactions.newprice"]])
                                                ? null
                                                : a[ci["userpromoactions.newprice"]],
                                            $utils.isEmpty(a[ci["userpromoactions.oldprice"]])
                                                ? null
                                                : h('span', {class:{'sk-old':true}}, a[ci["userpromoactions.oldprice"]])
                                        )]),
                                        $utils.isEmpty(a[ci["userpromoactions.promoproducer"]])
                                            ? null
                                            : h('div', {class: {'sk-produ': true}}, a[ci["userpromoactions.promoproducer"]])
                                ]),
                                (!!this.store.hasonline) 
                                        ? h('v-list-item-action', [
                                            h('svg', {attrs: {viewBox:"0 0 192 512"}, domProps:{innerHTML: '<use xlink:href="#ico-right" />'}})
                                        ])
                                        : null
                    ]);
                })
            ]));
        } else if (this.loading) {
            for (var i=0; i<3; i++){
                childs.push(
                        h('v-skeleton-loader', 
                            { key: 'sk-loader-'+i,
                              props: {type:'article', tile: true, boilerplate: false},
                              class: {'mb-5': true}
                            })
                );
            }
        }
        
        return h('div', {
            key: 'sk-acts-' + this.store.id,
            class: {'sk-actions': true}
        }, childs);
    }
}
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";
    .sk-actions{
        padding-bottom: 5rem;
        & .v-card__title {
            & h3{
                font-weight: 300;
            }
        }
    }
    .swiper {
        margin-top: 2rem;
        padding: 0 1rem;
        & .swiper-slide {
            width: auto;
            & img{
                border-radius: 6px;
                box-shadow: 2px 2px 6px rgba(0,0,0,0.18);
                height: 156px;
                width: auto;
            }
        }
    }

    .sk-skidos{
        margin-top: 2rem;
        & .v-list-item{
            border-top: 1px solid #ccc;
        }
        & .v-list-item__icon{
            flex-direction: column;
            margin: 0 16px 0 0 !important;
            align-self: center !important;
            justify-content: space-around;
        }
        & .v-image{
            width: 48px;
            height: auto;
        }
        & .sk-dates{
            font-size: 0.6rem;
            color: $red-color;
            margin-top: 0.5rem;
        }
        & .sk-price{
            font-size: 1.25rem;
            color: $red-color;
            display: flex;
            align-items: center;
            justify-content: space-between;
            & .sk-old {
                font-size: 0.85rem;
                display: inline-block;
                margin-left: 0.5rem;
                text-decoration: line-through;
                color: $gray-color;
            }
        }
        & .sk-produ{
            font-size: 0.75rem;
            color: $gray-color;
        }
        & .sk-order-now{
            font-size: 0.75rem;
            color: $gray-color;
            display: flex;
            align-items: center;
            justify-content: space-around;
            & .v-input {
                margin: 0 0.5rem;
                & input{
                    text-align: right !important;
                }
            }
        }
        & .v-list-item__action{
            & svg{
                color: lighten($gray-color, 20%);
                width: 24px;
                height: 24px;
            }
        }
    }
</style>

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
        VSkeletonLoader
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
        SwiperSlide
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
                console.log('Banners: ', res);
                if (!!res.error){
                    throw res.error;
                }
                this.acts = res.result;
                
                opts.query = 'sin2:/v:9d6c4649-cf13-45b6-9b6a-b1af97513204?filter=eq(field(".mainOrgId")'
                           + ',param("' + this.store.id + '", "id"))';
                res = await $http.post(url, opts);
                console.log('Actions: ', res);
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
                0: 'янв.',
                1: 'фев.',
                2: 'мар.',
                3: 'апр.',
                4: 'мая',
                5: 'июн.',
                6: 'июл.',
                7: 'авг.',
                8: 'сен.',
                9: 'окт.',
                10:'ноя.',
                11:'дек.'
            };
            return (!!m) ? MONTHS[Number(m)] : '';
        }
    },
    mounted(){
        console.log('A:', this);
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
                            props: {options: { 
                                        slidesPerView: 'auto',
                                        centeredSlides: true,             
                                        spaceBetween: 12,
                                        loop: true
                            }}
                        }, items
            ));
        } if (this.hasSkidos){
            const ci = this.skidos.columnIndexes;
            childs.push( h('v-list', {class:{'sk-skidos':true}}, [
                this.skidos.data.map((a) => {
                    const img = a[ci["userpromoactions.promoimage"]];
                    var dates = '';
/*                    
                    if (!$utils.isEmpty(a[ci["userpromoactions.startdt"]])){
                        dates = moment(new Date(a[ci["userpromoactions.startdt"]])).format('DD.MM');
                        if (!$utils.isEmpty(a[ci["userpromoactions.enddt"]])){
                            dates += '-' + moment(new Date(a[ci["userpromoactions.enddt"]])).format('DD.MM');
                        }
                    }
*/
                    if (!$utils.isEmpty(a[ci["userpromoactions.enddt"]])){
                        var d = new Date(a[ci["userpromoactions.enddt"]]);
                        dates = 'до ' + d.getDay() + ' ' + this.month(d.getMonth());
                    }
                    
                    return h('v-list-item', {
                                key: 'sk-' + a[ci["userpromoactions.id"]]
                            }, [
                                h('v-list-item-icon', {class:{"mr-3": true}}, [
                                    (!!img) 
                                        ? h('v-img',{props: {src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + img.ref}})
                                        : null
                                ]),
                                h('v-list-item-content', [
                                    h('div',{class:{'sk-name': true}}, [
                                        h('div', {class: {'sk-dates': true}}, dates),
                                        a[ci["userpromoactions.promogoods"]]
                                    ]),
                                    h('div',{class:{'sk-price': true}}, [
                                        $utils.isEmpty(a[ci["userpromoactions.newprice"]])
                                            ? null
                                            : a[ci["userpromoactions.newprice"]],
                                        $utils.isEmpty(a[ci["userpromoactions.oldprice"]])
                                            ? null
                                            : h('span', {class:{'sk-old':true}}, a[ci["userpromoactions.oldprice"]])
                                    ]),
                                    $utils.isEmpty(a[ci["userpromoactions.promoproducer"]])
                                        ? null
                                        : h('div', {class: {'sk-produ': true}}, a[ci["userpromoactions.promoproducer"]])
                                ])
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
            margin: 0 16px 0 0 !important;
            align-self: center !important;
        }
        & .v-image{
            width: 48px;
            height: auto;
        }
        & .sk-dates{
            font-size: 0.6rem;
            color: $gray-color;
            text-align: right;
            width: auto;
            margin-left: 0.25rem;
            float: right;
            color: $red-color;
        }
        & .sk-price{
            font-size: 1.25rem;
            color: $red-color;
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
    }
</style>

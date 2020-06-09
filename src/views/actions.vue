<script>
import { 
        VCard,
        VCardText,
        VCardTitle,
        VCardActions,
        VImg,
        VBadge,
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
        VTextField,
        VBottomSheet,
        VAlert,
        VChipGroup,
        VChip
       } from 'vuetify/lib';
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
import SkBasket from '@/views/basket';
import 'swiper/css/swiper.css';
import SkSvg from '@/components/SkSvg';
    
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
        VCardTitle,
        VCardText,
        VCardActions,
        VImg,
        VBadge,
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
        VTextField,
        VChipGroup,
        VChip,
        SkBasket,
        SkSvg
    },
    data(){
        return {
            loading: false,
            acts: null,
            skidos: null,
            cats: [],
            basket: false   /* show/hide basket pane */
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
        },
        hasBasket(){
            return this.$store.getters["basket/has"](this.store.id);
        },
        basketAt(){
            return this.$store.getters["basket/at"];
        }
    },
    directives: {
        swiper: directive
    },    
    methods: {
        async load(id){
            id = $utils.isEmpty(id) ? this.store.id : id;
            var url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc',
                opts = {
                    type: 'core-read',
                    query: 'sin2:/v:c1de84bd-de9a-45cb-b775-5e8b233e25e8?filter=eq(field(".mainOrgId")'
                           + ',param("' + id + '", "id"))'
                };
            this.loading = true;
            try{
                var res = await $http.post(url, opts);
                if (!!res.error){
                    throw res.error;
                }
                this.acts = res.result;
                
                opts.query = 'sin2:/v:9d6c4649-cf13-45b6-9b6a-b1af97513204?filter=eq(field(".mainOrgId")'
                           + ',param("' + id + '", "id"))';
                res = await $http.post(url, opts);
                if (!!res.result){
                    this.skidos = res.result;
                    this.sorting();
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
        sorting(){
            if (!this.hasSkidos){
                return;
            }
            const ci = this.skidos.columnIndexes;
            const idIdx = ci["userpromoactions.id"],
                  nmIdx = ci["userpromoactions.promogoods"],
                  knId  = ci["userpromoactions.kindid"],
                  knIdx = ci["userpromoactions.kindname"];
            var n1, n2, k, in1, in2, data;
            if (this.cats.length < 1){
                var _cats = [];
                data = this.skidos.data;
                data.map( (sk1)=>{
                    if (!$utils.isEmpty(sk1[knId])){
                        n1 = _cats.filter((sk2)=>{
                            return ( sk2.id === sk1[knId]);
                        });
                        if (n1.length < 1){
                            _cats.push({id: sk1[knId], name: sk1[knIdx]});
                        }
                    }
                });
                this.cats = _cats.sort((c1, c2)=>{
                    return c1.name.localeCompare(c2.name);
                });
            }
          
            data = this.skidos.data.sort((sk1, sk2) => {
                n1  = sk1[nmIdx];
                n2  = sk2[nmIdx];
                k  = ($utils.isEmpty(sk1[knIdx]) ? 'xxx' : sk1[knIdx]).localeCompare($utils.isEmpty(sk2[knIdx]) ? 'xxx' : sk2[knIdx]);
                in1 = this.$store.getters["basket/has"](sk1[idIdx]);
                in2 = this.$store.getters["basket/has"](sk2[idIdx]);
                return ((!!in1)&&(!!in2)) 
                        ? 0 : (!!in1)&&(!in2) 
                            ? -1 : (!in1)&&(!in2) 
                                ? (k===0) ? n1.localeCompare(n2) : k : 1;
            });
            this.skidos.data = data;
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
        },
        from_basket(e, id){
            e.preventDefault();
            e.stopPropagation();
            this.$store.dispatch('basket/rm', {id: id});
            var n = this.$store.getters["basket/numof"];
            if (n < 1){
                this.basket = false;
            }
            
            return false;
        },
        go_cat(id){
            var h = $(this.$el).find('.v-subheader[data-cat-id="' + id + '"]');
            $([document.documentElement, document.body]).animate({
                scrollTop: h.offset().top
            }, 800);
        }
    },
    created(){
        this.load();
    },
    watch:{
        store(val){
            if (!!val){
                this.load(val.id);
            }
        },
        basketAt(val){
            this.sorting();
            this.$nextTick(()=>{
                var n = this.$store.getters["basket/numof"];
                if ( n > 0 ){
                    $(".v-bottom-sheet").css({display: ''});
                }
            });
        }
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
                            class: {swiper: true, 'swiper-container': true, 'd-none': this.basket},
                            ref: 'swiper',
                            props: {'auto-update': true,
                                    'auto-destroy': true,
                                    options: { 
                                        slidesPerView: 'auto',
                                        spaceBetween: 12,
                                        loop: true
                            }}
                        }, items
            ));
        } if (this.hasSkidos){
            const ci = this.skidos.columnIndexes,
                  data = this.skidos.data;
            var   kind = 'xxx', numOf = 0;
            if ((this.cats)&&(this.cats.length>1)){
                childs.push( h('v-chip-group', {
                    class: {'sk-cats': true, 'd-none': this.basket}, 
                    props: {'show-arrows': false, 'prev-icon': 'fas fa-chevron-left', 'next-icon': 'fas fa-chevron-right'} //TODO:
                }, [
                        this.cats.map( (c)=>{
                            return h('v-chip', {
                                key: 'chip-' + c.id,
                                attrs: {'data-cat-id': c.id},
                                props: {color: this.store.brandcolor || 'orange', 'outlined': true},
                                on: {click: ()=>{this.go_cat(c.id);}}
                            }, c.name);
                        } )
                ]));
            }
            
            childs.push( h('v-list', {class:{'sk-skidos':true}, props:{subheader: true}},
                data.map((a) => {
                    const id = a[ci["userpromoactions.id"]],
                          img = a[ci["userpromoactions.promoimage"]];
                    const inCart = this.$store.getters["basket/has"](id);
                    if ((this.basket)&&(!inCart)){
                        return null;
                    }
                    var res = [],
                        dates = '';
                    if (!$utils.isEmpty(a[ci["userpromoactions.enddt"]])){
                        var d = new Date(a[ci["userpromoactions.enddt"]]);
                        dates = 'до ' + d.getDate() + ' ' + this.month(d.getMonth());
                    }
                    if ((!inCart)&&(!$utils.isEmpty(a[ci["userpromoactions.kindname"]]))){
                        if (kind!==a[ci["userpromoactions.kindname"]]){
                            kind = a[ci["userpromoactions.kindname"]];
                            res.push(h('v-subheader', {
                                props: {inset: true},
                                attrs: {'data-cat-id': a[ci["userpromoactions.kindid"]]}
                            }, kind));
                        }
                    }
                    
                    res.push(h('v-list-item', {
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
                                        $utils.isEmpty(a[ci["userpromoactions.newprice"]])
                                            ? null
                                            : a[ci["userpromoactions.newprice"]],
                                        $utils.isEmpty(a[ci["userpromoactions.oldprice"]])
                                            ? null
                                            : h('span', {class:{'sk-old': true}}, a[ci["userpromoactions.oldprice"]]),
                                        $utils.isEmpty(a[ci["userpromoactions.unitname"]])
                                            ? null
                                            : h('span', {class:{'sk-units': true}}, '(' + a[ci["userpromoactions.unitname"]] + ')')
                                    ]),
                                    $utils.isEmpty(a[ci["userpromoactions.promoproducer"]])
                                            ? null
                                            : h('div', {class: {'sk-produ': true}}, a[ci["userpromoactions.promoproducer"]]),
                                    inCart 
                                        ? h('div', {class: {'sk-from-basket': true}}, [
                                            h('v-btn', {
                                                        props: {outlined: true, color: 'default', 'x-small': true, rounded: true},
                                                        on: {
                                                            click: ()=>{this.from_basket(event, id);}
                                                        }
                                                    }, 
                                                        'убрать из корзины'
                                                    )
                                            ])
                                        : null
                                ]),
                                (!!this.store.hasonline) 
                                        ? h('v-list-item-action',  
                                            [inCart ? 
                                                h('div', {class:{'sk-in-cart':true}}, [
                                                    h('sk-svg', {props:{xref: "#ico-cart"}})
                                                ])
                                            : h('sk-svg', {props:{xref: "#ico-right"}})
                                            ])
                                        : null
                    ]));
                    numOf++;
                    return res;
                })
            ));
            childs.push( h('sk-basket', {
                on: {'show-basket': (b)=>{
                    console.log(b);
                    this.basket = ((typeof b === 'boolean') && (!!b)) ? true : !this.basket;
                }}
            }) );
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
            class: {'sk-actions': true},
            attrs: {'data-store-id': this.store.id}
        }, childs);
    }
}
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";
    .sk-actions{
        margin-bottom: 180px;
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
        & .v-subheader{
            font-weight: 600;
            font-style: italic;
            justify-content: flex-end;
        }
        & .v-list-item{
            border-top: 1px solid #ccc;
        }
        & .v-list-item__icon{
            flex-direction: column;
            margin: 0 16px 0 0 !important;
            align-self: center !important;
            justify-content: space-around;
            width: 72px;
            & .v-image{
                width: 72px;
                height: auto;
            }
            & .sk-dates{
                font-size: 0.6rem;
                color: $red-color;
                margin-top: 0.15rem;
                text-align: center;
            }
        }
        & .sk-price{
            font-size: 1.25rem;
            color: $red-color;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            & .sk-old, & .sk-units {
                font-size: 0.85rem;
                display: inline-block;
                margin-left: 0.5rem;
                color: $gray-color;
            }
            & .sk-old{
                text-decoration: line-through;
            }
        }
        & .sk-produ{
            font-size: 0.75rem;
            color: $gray-color;
        }
        & .sk-from-basket{
            text-align: center;
            margin-top: 0.5rem;
            & .v-btn{
                border-color: $gray-color;
                color: $gray-color;
                text-transform: lowercase !important;
                & .v-btn__content{
                    color: $gray-color;
                }
            }
        }
        & .v-list-item__action{
            & svg{
                color: lighten($gray-color, 20%);
                width: 24px;
                height: 24px;
            }
            & .sk-in-cart{
                width: 32px;
                height: 32px;
                line-height: 38px;
                text-align: center;
                border-radius: 50%;
                border: 2px solid #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.18);
                background: $main-color;
                & svg{
                    width: 18px;
                    height: 18px;
                    margin: 0 auto;
                    color: #fff;
                }
            }
        }
    }
    .sk-cats{
        margin-top: 1rem;
        padding: 0 1rem;
    }
</style>
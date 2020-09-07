<script>
import { VBtn,
         VImg,
         VList, 
         VListItem,
         VListItemIcon,
         VListItemContent,
         VListItemTitle,
         VListItemSubtitle,
         VListItemAction,
         VBadge,
         VCard,
         VCardText,
         VToolbar,
         VToolbarTitle,
         VSpacer,
         VDivider
    } from 'vuetify/lib';
import SkSvg from '@/components/SkSvg';

const BS_MODE = {
    'show': 0,
    'saving': 1
};

export default {
    name: 'SkBasket',
    components: {
        VBtn,
        VImg,
        VList, 
        VListItem,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VBadge,
        VCard,
        VCardText,
        VToolbar,
        VToolbarTitle,
        VSpacer,
        VDivider,
        SkSvg
    },
    data(){
        return {
            mode: BS_MODE.show
        };
    },
    computed: {
        magaz(){
            return app.$store.state.active.store;
        },
        prods(){
            return app.$store.state.basket.basket.prods;
        }
    },
    methods: {
        from_basket(e, prod){
            e.preventDefault();
            e.stopPropagation();
            this.$store.dispatch('basket/rm', {id: prod.id});
            var n = this.$store.getters["basket/numof"];
            if (n < 1){
                this.basket = false;
            }
            return false;
        },
        pm(prod, add){
            var n = prod.num + ((add) ? 1 : -1);
            if (n < 1){
                n = 1;
            }
            prod.num = n;
            prod.total = n*prod.newprice;
            this.$store.dispatch('basket/add', prod);
        }
    },
    render(h){
        const color = this.magaz.brandcolor || 'yellow lighten-4';
                
        var card = h('v-card', {props:{flat: true}}, [
            h('v-list', [
                (this.prods.length > 0)
                    ? this.prods.map((prod)=>{
                        return [h('v-list-item', {key: 'sk-prod-' + prod.id}, [
                                    h('v-list-item-icon', {class:{"mr-3": true}}, [
                                        (!!prod.promoimage)
                                            ? h('v-img',{props: {
//                                                                    src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + prod.promoimage.ref,
                                                                    src: process.env.VUE_APP_BACKEND_RPC + '/static/model/view/' + prod.promoimage.id,
                                                                    'max-height': 86,
                                                                    contain: true
                                                                }})
                                            : h('sk-svg', {props:{xref:"#ico-box-full"}, style:{color:color}})
                                    ]),
                                    h('v-list-item-content', [
                                        h('div',{class:{'sk-name': true}}, prod.promogoods), 
                                            $utils.isEmpty(prod.total)
                                                ? null
                                                : h('div',{class:{'sk-price': true}}, [
                                                    h('span', '(' + prod.newprice + ')'),
                                                    prod.total + ' р.'
                                                  ]),
                                        $utils.isEmpty(prod.promoproducer)
                                                ? null
                                                : h('div', {class: {'sk-produ': true}}, prod.promoproducer),
                                        h('div', {class: {'sk-from-basket': true}}, [
                                                h('v-btn', {
                                                            props: {outlined: true, color: 'default', 'x-small': true, rounded: true},
                                                            on: {
                                                                click: ()=>{this.from_basket(event, prod);}
                                                            }
                                                        }, 
                                                            'убрать из корзины'
                                                        )
                                                ])
                                    ]),
                                    h('v-list-item-action', [
                                        h('v-btn', {
                                                        props:{icon: true, 'small': true},
                                                        on:{click:()=>{this.pm(prod, true);}}
                                                }, '+'),
                                        prod.num,
                                        $utils.isEmpty(prod.unitname)
                                            ? null
                                            : h('div', {class:{'sk-units': true}}, prod.unitname),
                                        h('v-btn', {
                                                        props:{icon: true, 'small': true},
                                                        on:{click:()=>{this.pm(prod, false);}}
                                                    }, '-')
                                    ])
                                ]),
                                h('v-divider')
                            ];
                        })
                    : h('v-list-item', {key: 'sk-prod-empty'}, [
                        h('v-list-item-icon', {class:{"mr-3": true}}, [
                            h('sk-svg', {props:{xref:"#ico-empty"}, style:{color:color}})
                        ]),
                        h('v-list-item-content', [
                            h('v-list-item-title', 'В корзине ничего нет'),
                            h('v-list-item-subtitle', 'нажмите кнопку "назад", чтобы вернуться к покупкам')
                        ])
                    ])
            ])
        ]);
        
        return h('div', {class:{'sk-backet-conte': true}}, [
                    h('v-toolbar', {
                        props: {color: color, dark: true, absolute: true, tile: true}
                    }, [
                        h('v-btn', {props: {icon: true}, on:{click: ()=>{this.$router.go(-1);}}}, [
                            h('sk-svg', {props:{xref:'#ico-left', width:16, height: 16}})
                        ]),
                        h('v-toolbar-title', this.magaz.title),
                        h('v-spacer'),
                        h('sk-svg', {props:{xref:'#ico-cart', width:28, height: 28}})
                    ]),
                    card
        ]);
    }
}
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";
    .sk-backet-conte{
        & .v-toolbar{
            width: 100%;
        }
        & .v-card {
            padding-top: 64px;
            & .v-list{
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
                    & svg{
                        width: 48px;
                        height: auto;
                    }
                }
                & .sk-price{
                    font-size: 1.25rem;
                    color: $red-color;
                    span{
                        font-size: 0.9rem;
                        color: $gray-color;
                        margin-right: 0.5rem;
                    }
                }
                & .v-list-item__action{
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    & .v-btn{
                        background-color: #efefef;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.18);
                        border: 1px solid #ccc;
                    }
                }
            }
        }
    }
        
</style>


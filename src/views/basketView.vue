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
         VSpacer
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
        }
    },
    render(h){
        const color = this.magaz.brandcolor || 'yellow lighten-4';
                
        var card = h('v-card', {props:{flat: true}}, [
            h('v-list', [
                (this.prods.length > 0)
                    ? this.prods.map((prod)=>{
                        return h('v-list-item', {
                                    key: 'sk-prod-' + prod.id
                                }, [
                                    h('v-list-item-icon', {class:{"mr-3": true}}, [
                                        (!!prod.promoimage)
                                            ? h('v-img',{props: {
                                                                    src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + prod.promoimage.ref,
                                                                    'max-height': 86,
                                                                    contain: true
                                                                }})
                                            : h('sk-svg', {props:{xref:"#ico-box-full"}, style:{color:color}})
                                    ]),
                                    h('v-list-item-content', [
                                        h('div',{class:{'sk-name': true}}, prod.promogoods),
                                        h('div',{class:{'sk-price': true}}, [
                                            $utils.isEmpty(prod.newprice)
                                                ? null
                                                : prod.newprice + ' р.'
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
                                        prod.num,
                                        $utils.isEmpty(prod.unitname)
                                            ? null
                                            : h('div', {class:{'sk-units': true}}, prod.unitname)
                                        
                                    ])
                                ]);
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
                }
            }
        }
    }
        
</style>


<script>
import { 
        VCard,
        VCardText,
        VCardTitle,
        VCardActions,
        VImg,
        VBadge,
        VBtn,
        VBtnToggle,
        VBottomSheet
    } from 'vuetify/lib';
import SkSvg from '@/components/SkSvg';

export default {
        name: 'SkBasket',
        props: {
            
        },
        components:{
            VCard,
            VCardText,
            VCardTitle,
            VCardActions,
            VImg,
            VBadge,
            VBtn,
            VBtnToggle,
            VBottomSheet,
            SkSvg
        },
        data(){
            return {};
        },
        computed: {
            numof(){
                return this.$store.getters["basket/numof"];
            },
            total(){
                return this.$store.getters["basket/total"];
            },
            error(){
                return this.$store.state.basket.error;
            },
            order(){
                return this.$store.state.basket.order;
            }
        },
        methods: {
            async do_order(){
                console.log("basket/save");
                try{
                    var res = await this.$store.dispatch("basket/save");
                    setTimeout(()=>{
                        this.$store.dispatch('basket/clear');
                    }, 6000);
                } catch(e){
                    setTimeout(()=>{
                        this.$store.commit('basket/error', null);
                    }, 6000);
                }
            },   //do_order
            show(e){
                var from_basket = ("order"===this.$router.currentRoute.name);
                this.$emit('show-basket', from_basket);
                if (from_basket){
                    this.$router.go(-1);
                }
            }
        },
        render(h){
            var card = null;
            if (!$utils.isEmpty(this.error)){
                card = h('v-card', {class: {"sk-basket": true, "sk-error": true}, props:{flat:true,tile:true}}, [
                            h('v-card-text', [
                                h('sk-svg', {props:{xref:'#ico-warn', width:28, height: 28}}),
                                'Произошла ошибка при оформлении заказа - попробуйте отправить еще раз или сообщите нам о проблеме.'
                            ])
                ]);
            } else if (!$utils.isEmpty(this.order)){
                card = h('v-card', {class: {"sk-basket": true, "sk-success": true}, props:{flat:true,tile:true}}, [
                            h('v-card-text', [
                                h('sk-svg', {props:{xref:'#ico-chk-circle', width:28, height: 28}}),
                                'Ваш заказ № ',
                                h('strong', this.order),
                                ' успешно оформлен! Ожидайте дальнейших сообщений о его готовности.'
                            ])
                ]);
            } else if (this.numof > 0) {
                card = h('v-card', {class: {"sk-basket": true}, props:{flat:true,tile:true}}, [
                        h('v-card-text', [
                            h('v-badge',{props:{content: this.numof, value: this.numof, dark: true, color: "#ffa41b"}}, [
                                h('sk-svg', {props:{xref:'#ico-cart', width:28, height: 28}})
                            ]),
                            h('div', {class:{'sk-total':true}}, this.total + ' руб.')
                        ]),
                        h('v-card-actions', [
                            h('v-btn', {
                                props: {small:true, dark: true, color: "orange lighten-1"},
                                on: {click: this.do_order}
                            }, 'оформить'),
                            h('v-btn', {
                                props: {small:true, dark: true, color: "orange lighten-1"},
                                on: {click: this.show}
                            }, [
                                    h('sk-svg', {props:{xref:'#ico-eye', width:18, height: 18}})
                                ])
                        ])
                ]);
            }
            if (!!card){
                return h('v-bottom-sheet', {
                    key: 'sk-bottom-basket',
                    props: {"hide-overlay": true, value: true, persistent: true}
                }, [ card ]);
            } else {
                return null;
            }
        }
    }
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";
    .sk-basket{
        padding-top: 1.5rem;
        padding-bottom: 1rem;
        background-color: #fafafa;
        border-top: 2px solid $main-color;
        border-radius: 0;
        & .v-card__text{
            padding: 0 !important;
            display: flex;
            justify-content: center;
            & svg{
                width: 28px;
                height: 28px;
                color: $main-color;
            }
            & .sk-total{
                margin-left: 2rem;
                font-size: 1.5rem;
                font-weight: 300;
                color: #000;
            }
        }
        & .v-card__actions{
            justify-content: flex-end;
            padding-right: 1rem;
        }
        &.sk-error{
            & .v-card__text{
                padding: 1rem !important;
                display: block !important;
                & svg{
                    color: $red-color;
                    margin-right: 0.5rem;
                }
            }
        }
        &.sk-success{
            & .v-card__text{
                padding: 1rem !important;
                display: block !important;
                & svg{
                    color: #2196f3;
                    margin-right: 0.5rem;
                }
            }
        }
    }
</style>
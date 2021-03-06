<script>
import { 
        VAlert,
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
        components:{
            VAlert,
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
            return {
                disabled: false
            };
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
            },
            confirmClear(){
                return this.$store.state.basket.confirmClear;
            },
            brandColor(){
                const def = 'orange lighten-1',
                      store = this.$store.state.active.store;
                return (!!store) 
                            ? $utils.isEmpty(store.brandcolor) ? def : store.brandcolor
                            : def;
            },
            mustPoint(){
                const store = this.$store.state.active.store;
                if ((!!store.pointscount) && (Number(store.pointscount)>0)){
                    return !(!!store.fill);
                }
                return false;
            }
        },
        methods: {
            async do_order(){
                console.log("basket/save");
                this.disabled = true;
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
                this.disabled = false;
            },   //do_order
            show(e){
                this.$router.push({name: 'basket'});
            },
            clear(){
                this.$store.dispatch('basket/clear');
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
                card = h('v-card', {
                                        class: {"sk-basket": true, "sk-success": true},
                                        props: {flat:true, tile: true},
                                        style: {"border-top": "2px solid " + this.brandColor}
                                    }, [
                            h('v-card-text', [
                                h('sk-svg', {props:{xref:'#ico-chk-circle', width:28, height: 28}}),
                                'Ваш заказ № ',
                                h('strong', this.order),
                                ' успешно оформлен! Ожидайте дальнейших сообщений о его готовности.'
                            ])
                ]);
            } else if (this.numof > 0) {
                card = h('v-card', {
                                        class: {"sk-basket": true}, 
                                        props: {flat: true, tile: true},
                                        style: {"border-top": "2px solid " + this.brandColor}
                                   }, [
                        h('v-card-text', [
/** TODO:
                            this.mustPoint 
                                ? h('v-alert', {props: {
                                            border: "left",
                                            "colored-border": true,
                                            color: "error",
                                            elevation: 2
                                        }, 
                                        style: {width: '95%', margin: '-16px auto 2rem auto'}
                                    }, [
                                    h('sk-svg', {props: {xref:'#ico-warn', color: "error"}}),
                                        'Для оформления заказа необходимо выбрать одну из точек сети!'
                                ])
                                : null,
* 
*/
                            h('v-badge',{props:{content: this.numof, value: this.numof, dark: true, color: this.brandColor}}, [
                                h('sk-svg', {
                                                props:{xref:'#ico-cart', width:28, height: 28},
                                                style: {"color": this.brandColor}
                                            })
                            ]),
                            h('div', {class:{'sk-total':true}}, this.total + ' руб.'),
                            this.confirmClear
                                ? h('div', {class: {'sk-confirm': true}}, 'корзина не пуста!')
                                : null
                        ]),
                        h('v-card-actions', [
                                    h('v-btn', {
                                        props: {small:true, dark: true, color: this.brandColor, width: "10rem", disabled: this.disabled},
                                        on: {click: this.do_order}
                                    }, 'оформить'),
                                    this.confirmClear 
                                        ? h('v-btn', {
                                            props: {small:true, dark: true, color: this.brandColor},
                                            on: {click: this.clear}
                                            }, 'очистить')
                                        : null,
                                    ("basket" == this.$route.name) 
                                        ? null
                                        : h('v-btn', {
                                            props: {small:true, dark: true, color: this.brandColor},
                                            on: {click: this.show}
                                            }, [
                                                h('sk-svg', {props:{xref:'#ico-eye', width:18, height: 18}})
                                        ])
                                ]
                        )
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
        border-radius: 0;
        & .v-card__text{
            padding: 0 !important;
            display: block;
            text-align: center;
            & svg{
                width: 28px;
                height: 28px;
            }
            & .sk-total{
                margin-left: 2rem;
                font-size: 1.5rem;
                font-weight: 300;
                color: #000;
            }
            & .sk-confirm{
                font-size: 1.25rem;
                font-weight: 400;
                color: $main-color;
                margin: 1rem 0;
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
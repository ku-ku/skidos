<script>
import { 
        VCard,
        VCardText,
        VCardTitle,
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
    OM_READY: 2
};
export default {
    name: 'ViewOrder',
    components: {
        VCard,
        VCardText,
        VCardTitle,
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
            n: 1
        };
    },
    computed: {
        prod(){
            return this.$store.state.active.action;
        }
    },
    mounted(){
        this.$nextTick(()=>{
            $(this.$el).find('.sk-choice input').css({'text-align': 'right'});
        })
    },
    render(h){
        const prod = this.prod;
        return h('v-card', {
            key: 'ord-' + prod.id,
            class:{'sk-order': true /*, 'fill-height': true*/}
        },[
            h('v-card-title', {class:{"headline":true}}, [
                h('v-img', {props: {
                        'max-height': 240,
                        contain: true,
                        src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + prod.promoimage.ref
                }})
            ]),
            h('v-card-subtitle', [
                h('div', {class:{'sk-name': true}}, prod.promogoods),
                h('div', {class:{'sk-prod': true}}, prod.promoproducer)
            ]),
            h('v-card-actions',[
                h('div', {class:{'sk-choice':true}}, [
                    h('v-btn',  {props: {
                                            'x-small': true,
                                            rounded: true,
                                            dark: true,
                                            color:'#ad0900',
                                            outlined: true
                                        }
                    }, '+'),
                    h('v-text-field', {props: {
                        autofocus: true,
                        value: this.n,
                        error: !this.valid
                    }}),
                    h('v-btn',  {props: {
                                            'x-small': true,
                                            rounded: true,
                                            dark: true,
                                            color:'#ad0900',
                                            outlined: true
                                        }
                    }, '-')
                ]),
                h('v-btn',  {props: {
                                        small: true,
                                        rounded: true,
                                        dark: true,
                                        color:'#ad0900',
                                        outlined: true
                                    }
                }, 'заказать')
            ])
        ]);
    }
};
</script>
<style lang="scss" scoped>
    .sk-order{
        padding: 1rem;
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
                    text-align: right;  
                }
            }
        }
    }
</style>
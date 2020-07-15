<script>
import { VBtn,
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
    
export default {
    name: 'SkShare',
    props: {
        parent: {
            type: Object,
            required: true
        }
    },
    components: {
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
    },
    data(){
        return {
            loading: false
        };
    },
    watch: {
        parent(val){
            console.log(val);
        }
    },
    created(){
        if ($("ya-share-script").length < 1){
            var s = $(document.createElement('script'));
            s.attr("src", "https://yastatic.net/share2/share.js");
            s.attr("id", "ya-share-script");
            s.appendTo('body');
        }
    },
    render: function(h){
        var childs = [];
        if (this.loading){
            childs.push(h('v-list-item', [
                h('v-skeleton-loader', {props:{type:'list-item-three-line'}})
            ]));
        } else {
            childs.push(h('v-list-item', {key:'item-share-stub'}, [
                h('v-list-item-content', [
                    h('div', {
                        class:{'ya-share2':true}, 
                        attrs: {
                            "data-services":"telegram,whatsapp,viber,vkontakte,facebook,odnoklassniki",
                            "data-title": "моикарты.рф",
                            "data-url": "Google: https://play.google.com/store/apps/details?id=skidos.my.ru \n\n\n\n Apple: https://apps.apple.com/ru/app/%D0%BC%D0%BE%D0%B8%D0%BA%D0%B0%D1%80%D1%82%D1%8B-%D1%80%D1%84/id1510411658 \n\n\n\n"
                    }})
                ])
            ]));
        }
        return h('v-list', {}, childs);
    }
}
</script>
<style lang="scss">
    .ya-share2__container{
        margin-top: 2rem;
        & ul{
            display: flex;
            padding: 0;
            width: 100%;
            justify-content: space-around;
            flex-wrap: wrap;
            & .ya-share2__item{
                margin: 0 0.5rem 2rem 0 !important;
                text-align: center;
                width: 30%;
                & .ya-share2__link{
                    box-shadow: 0 2px 6px rgba(0,0,0,0.22);
                    border: 1px solid #fff;
                }
            }
            & .ya-share2__icon {
                height: 56px !important;
                width: 56px !important;
                background-size: 56px 56px !important;
            }
        }
    }
</style>
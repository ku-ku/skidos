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
                            "data-services":"vkontakte,facebook,odnoklassniki,viber,whatsapp,telegram",
                            "data-title": "моикарты.рф",
                            "data-url": "https://play.google.com/store/apps/details?id=skidos.my.ru"
                    }})
                ])
            ]));
        }
        return h('v-list', {}, childs);
    }
}
</script>
<style lang="scss">
    .ya-share2__container_size_m {
        & .ya-share2__icon {
            height: 42px !important;
            width: 42px !important;
            background-size: 42px 42px !important;
            border-radius: 4px;
        }
    }
</style>
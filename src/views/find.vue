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
         VListItemAction
       } from 'vuetify/lib';
    
export default {
    name: 'SkFind',
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
        VListItemAction
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
    render: function(h){
        var childs = [];
        if (this.loading){
            childs.push(h('v-list-item', [
                h('v-progress-linear',{props:{indeterminate:true}})
            ]));
        } else {
            childs.push(h('v-list-item', {key:'item-share-stub'}, [
                h('v-list-item-icon', [
                    h('svg',{
                                attrs:{viewBox:'0 0 448 512'}, 
                                domProps:{innerHTML:'<use xlink:href="#ico-search" />'},
                                style: {width: '22px', height: '22px', color: '#ccc'}
                            })
                ]),
                h('v-list-item-content', 'Раздел поиска товаров и услуг скоро откроется')
            ]));
        }
        return h('v-list', {
            
        }, childs);
    }
}
</script>

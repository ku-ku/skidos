<script>
import { VBtn,
         VBadge,
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

var StoreItem = {
    props: {
        info: {
            type: Array,
            required: true
        }
    },
    components: {
        VBtn,
        VListItem,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction
    },
    data: function(){
        return {
        };
    },
    created: function(){
    },
    computed:{
        short: function(){
            return $utils.short(this.info[this.ci["ssctenants.title"]]);
        },      //short
        owner: function(){
            var _p = this.$parent;
            while (_p){
                if (!!_p.stores){
                    return _p;
                }
                _p = _p.$parent;
            }
        },       //owner
        ci(){
            return this.owner.stores.columnIndexes;
        }
    },
    render: function(h){
        const addr = this.info[this.ci["ssctenantsadds.location"]];
        const bc   = this.info[this.ci["ssctenantsadds.brandcolor"]];
        const hasA = this.info[this.ci["ssctenantsadds.hasaccount"]];
        return h('v-list-item', {
                key: this.info[this.ci["ssctenants.id"]],
                props: {
                            to:  {name:'store', params:{id: this.info[this.ci["ssctenants.id"]]}}
                       }
            }, [
            h('v-list-item-icon',[
                h('div', {
                            class: {'sk-short':true},
                            style: $utils.isEmpty(bc) ? null : {'background-color': bc}
                          }, 
                  this.short
            )]),
            h('v-list-item-content',[
                h('v-list-item-title', [
                    this.info[this.ci["ssctenants.title"]]
                ]),
                (!!addr)&&(addr.city) ? h('v-list-item-subtitle', addr.city.name) : null
            ]),
            h('v-list-item-action', [
                (!!hasA) ? h('svg',{class: {'sk-star': true}, domProps: {innerHTML:'<use xlink:href="#ico-star" />'}, attrs: {viewBox:'0 0 576 512'}}) : null,
                h('svg',{class: {'sk-arr': true}, domProps:{innerHTML:'<use xlink:href="#ico-right" />'},attrs:{viewBox:'0 0 192 512'}})
            ])
        ]);
    }
};

export default {
  name: 'ViewStores',
  data() {
    return {
        stores: null
    };
  },
  components: {
        VList,
        VBadge,
        VSubheader,
        VListItemGroup,
        StoreItem
  },
  mounted(){
    this._stores_ready();
  },        //mounted
  methods: {
      _stores_ready: function(){
        const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
        const options = {
            type: 'core-read',
            query: 'sin2:/v:c2d6f08c-974a-4ff8-904a-57dab6b976cb?sort=ssctenants.name'
        };
        $http.post(url, options)
            .then((resp) => {
                if (resp.result){
                    this.stores = Object.freeze(resp.result);
                } else {
                    console.log('Stores error', resp.error);
                }
            })
            .catch((err) => {
                console.log('Stores error', err);
            });
      }    //_stores_ready
  },
  render:function(h){
    if (!!this.stores){
        return h('main',{}, [
                h('v-list',{},[
                    h('v-subheader',[
                        h('v-badge', {props:{content:this.stores.data.length}}, 'ОРГАНИЗАЦИИ')
                    ]),
                    h('v-list-item-group',{props:{color:"primary"}}, [
                        this.stores.data.map(function(item){
                            return h('store-item',{props:{info:item}});
                        })
                    ])
                ])
        ]);
    } else {
        return h('main');
    }
  }         //render
};
</script>

<style lang="scss">
    .v-list-item{
        & .sk-short {
            border: 1px solid transparent;
            border-radius: 50%;
            text-align: center;
            font-size: 0.75rem;
            width: 2.25rem;
            height: 2.25rem;
            line-height: 2.2rem;
            color: #fff;
            text-shadow: 0 1px 3px rgba(0,0,0,0.44);
        }
        & .v-list-item__action{
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
            & svg{
                width: 1.25rem;
                height: 1.25rem;
                &.sk-star{
                    color: #F57F17;
                }
            }
        }
    }

    $group-size: 5;
    $step: 360/10;

    @mixin colors(){
      @for $i from 1 through $group-size {
        .v-list-item:nth-child(#{$group-size}n + #{$i}) .sk-short {
          $color: hsl(($i - 1)*$step, 80%, 60%);
          background-color: $color;
        }
      }
    }
    @include colors;    
    
</style>    
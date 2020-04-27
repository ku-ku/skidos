<script>
import { 
        VBtn,
        VCard,
        VCardTitle, 
        VCardSubtitle, 
        VCardText,
        VCardActions,
        VTextField,
        VList,
        VListItem,
        VListItemIcon,
        VListItemAvatar,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VImg,
        VProgressLinear,
        VCol
} from 'vuetify/lib';

export default {
  name: 'ViewMain',
  data() {
    return {
        cards: null,
        loading: false,
        stores: null
    };
  },
  components: {
        VBtn,
        VCard,
        VCardTitle, 
        VCardSubtitle, 
        VCardActions,
        VTextField,
        VCardText,
        VList,
        VListItem,
        VListItemIcon,
        VListItemAvatar,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VImg,
        VProgressLinear,
        VCol
  },
  computed: {
      name: function(){return this.$store.state.profile.user.name;},
      isAllow: function(){return this.$store.state.profile.user.isAuthenticated;},
      allBonuces: function(){
          var totals = 0;
          if ( (this.cards)&&(this.cards.data) ){
              var ci = this.cards.columnIndexes;
              this.cards.data.map((item)=>{
                  totals += Number(item[ci["accounts.amount"]]);
              });
          }
          return totals;
      }
  },
  mounted() {
    if (!this.cards){
        this._cards_ready();
    }
  },        //mounted
  methods: {
      tod: function(){
          var s, h = (new Date()).getHours();
          if (((h >= 21)&&(h<24)) || ((h >= 0)&&(h<5))){
              s = 'Доброй ночи';
          } else if ((h>=5) && (h<12)){
              s = 'Доброго утра';
          } else if ((h>=12) && (h<18)){
              s = 'Доброго дня';
          } else if ((h>=18) && (h<21)){
              s = 'Доброго вечера';
          }
          return s;
      },
      _cards_ready: async function() {
        var url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc',
            options = {
                type: 'core-read',
                query: 'sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee?sort=ssctenants.name'
            };
        this.loading = true;
        try {
            var res = await $http.post(url, options);
            if (!!res.error){
                throw res.error;
            }
            this.cards = Object.freeze(res.result);
            
            /* All others */    
            options.query = 'sin2:/v:c2d6f08c-974a-4ff8-904a-57dab6b976cb?sort=ssctenants.name&filter=eq(field("sscTenantsAdds.hasAccount"), param(false, "boolean"))';
            res = await $http.post(url, options);
            if (res.result){
                this.stores = Object.freeze(res.result);
            }
            this.loading = false;
        } catch(err) {
            this.loading = false;
            console.log('Cards error', err);
            app.msg({text:'Ошибка чтения списка карт', type:'warning'});
        }
      },    //_cards_ready
      use_card: function(item, item_type){
        var id, ci;
        switch (item_type){
            case 'card':
              ci = this.cards.columnIndexes;
              id = item[ci["accounts.tenantid"]];
              break;
            case 'store':
              ci = this.stores.columnIndexes;
              id = item[ci["ssctenants.id"]];
              break;
        }
        this.$router.push({ name: 'store', params: { id: id } });
      }
  },
  render: function(h){
      var ci, data, childs = [];
      if ( this.loading ){
          childs.push(h('v-progress-linear',{props:{indeterminate:true}}));
      } else if ( (!!this.cards)&&(this.cards.data.length>0) ){
        /** 
         * list of all accounts 
         * */
        data = this.cards.data;
        ci   = this.cards.columnIndexes;
        /**
         * Title
         */
        childs.push(
                    h('v-card',{
                        class: {'sk-card-user': true},
                        props: {flat: true}
                    }, [
                        h('v-card-title', {class:{'d-flex':true}}, [
                            h('div', {class: {'sk-name': true}}, [
                                this.tod(),
                                ', ',
                                h('strong', this.name + '!')
                            ]),
                            h('img', {attrs: {src: require('@/assets/imgs/my-logo.png'), viewBox:"0 0 512 512"}, class:'sk-logo'})
                        ]),
                        h('v-card-text',[
                            (data.length > 0) 
                                ? 'у Вас ' + data.length + ' карт'
                                : 'у Вас нет зарегистрированных карт',
                            h('div',{class:{'sk-bonuces':true}},[
                                (this.allBonuces > 0) 
                                ? 'накоплено всего ' + this.allBonuces + ' бонусов'
                                : 'нет накопленных бонусов'
                            ])
                        ])
                    ]
        ));
        /**
         * Own list
         */
        childs.push(
                    h('v-card', {
                        class: {'sk-card-list': true, 'sk-my-cards': true}
                    },[
                        h('v-card-title', [
                            h('h3','Мои карты'),
                            h('svg',{ domProps: {innerHTML:'<use xlink:href="#ico-star" />'}, attrs: {viewBox:'0 0 576 512'}})
                        ]),
                        h('v-card-text', [
                            h('v-list', [
                                data.map((item)=>{
                                    const id    = item[ci["accounts.id"]],
                                          title = item[ci["accounts.tenantid.title"]],
                                          bc    = item[ci["ssctenantsadds.brandcolor"]], 
                                          loytt = item[ci["ssctenantsadds.shortloyalty"]];
                                  
                                    return h('v-list-item', {
                                        props: {key: id},
                                        style: {'background-color': (!bc) ? '' : bc},
                                        on: {click:()=>{this.use_card(item, 'card');}}
                                    }, [
                                        h('v-col',{props:{colls:4}, class:{'sk-title':true}},title),
                                        h('v-col',{props:{colls:8}, class:{'sk-loytt': true}},loytt)
                                    ]);
                                })
                            ])
                        ])
                ])
        );

        /**
         * Other's
         */
        if (
                (!!this.stores)
              &&(this.stores.data.length>0)
            ){
            data = this.stores.data;
            ci   = this.stores.columnIndexes;
            childs.push(
                    h('v-card', {
                        class: {'sk-card-list': true, 'sk-stores': true}
                    },[
                        h('v-card-title', [
                            h('h3','Все организации'),
                            h('svg',{ domProps: {innerHTML:'<use xlink:href="#ico-store" />'}, attrs: {viewBox:'0 0 640 512'}})
                        ]),
                        h('v-card-text', [
                            h('v-list', [
                                data.map((item)=>{
                                    const id    = item[ci["ssctenants.id"]],
                                          title = item[ci["ssctenants.title"]],
                                          bc    = item[ci["ssctenantsadds.brandcolor"]], 
                                          loytt = item[ci["ssctenantsadds.shortloyalty"]];
                                  
                                    return h('v-list-item', {
                                        props: {key: id},
                                        style: {'background-color': (!bc) ? '' : bc},
                                        on: {click:()=>{this.use_card(item, 'store');}}
                                    }, [
                                        h('v-col',{props:{colls:4}, class:{'sk-title':true}},title),
                                        h('v-col',{props:{colls:8}, class:{'sk-loytt': true}},loytt)
                                    ]);
                                })
                            ])
                        ])
                ])
            );
        }
      } else {
          childs = [h('h1',{}, this.tod() + ', ' + this.name)];
          childs.push(h('p',{class:{'fill-height':true, 'pa-2': true}},[
              'Список карт и магазинов недоступен, попробуйте позже.'
          ]));
      }
      return h('main', {class:{'fill-height': true}}, childs);
  }
};
</script>
<style lang="scss" scoped>
    $main-color: #ffa41b;
    main{
    }
    .sk-logo{
        width: 38px;
        height: 38px;
    }
    .sk-card-user{
        background-color: $main-color;
        padding-bottom: 3rem;
        margin-bottom: -2.5rem;
        & .v-card__title{
            color: #fff;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.18);
            justify-content: space-between;
            align-items: flex-start;
            & strong{
                display: block;
                font-size: 2.5rem;
                font-weight: 300;
            }
        }
        & .v-card__text{
            text-align: center;
            font-size: 1.5rem;
            color: #fff;
            line-height: 1.115;            
            & .sk-bonuces{
                font-size: 1.75rem;
            }
        }
    }
    
    $brd-rrr: 18px 18px 0 0;
    .theme--light.v-card{
        border-color: transparent;
        box-shadow: none;
        &.sk-card-list{
            border-radius: $brd-rrr;
            background-color: #fff;
            padding-bottom: 3rem;
            &.sk-my-cards{
                margin-bottom: -1.5rem;
            }
            &.sk-stores{
                background-color: #ECEFF1;
                & .v-list{
                    background-color: #ECEFF1 !important;
                }
            }
            & .v-card__title{
                justify-content: space-between;
                & h3{
                    font-size: 1rem;
                    font-weight: 400;
                    padding:0;
                    margin:0;
                }
                & svg{
                    width: 22px;
                    height: 22px;
                    color: $main-color;
                }
            }
            & .v-btn{
                & svg{
                    width:22px;
                    height:22px;
                    color: #fff;
                }
            }
            
            $group-size: 5;
            $step: 360/10;
            @mixin colors(){
                @for $i from 1 through $group-size {
                    & .v-list-item:nth-child(#{$group-size}n + #{$i}){
                        $color: hsl(($i - 1)*$step, 80%, 60%);
                        background-color: $color;
                        border: 1px solid darken($color, 20%);
                    }
                }
            }
            @include colors;
            
            & .v-list-item {
                font-size: 0.85rem;
                color: #fff !important;
                line-height: 1.115;
                border-radius: 0.5rem;
                margin-bottom: 0.5rem;
                box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.18);
                min-height: 4rem;
                & .sk-title{font-size:1.125rem;}
            }
        }   /*sk-card-list*/
    }
    
</style>    
        
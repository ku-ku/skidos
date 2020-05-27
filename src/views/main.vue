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
import color from 'color';

function num2str(n, text_forms) {  
    n = Math.abs(n) % 100; var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 === 1) { return text_forms[0]; }
    return text_forms[2];
}

export default {
  name: 'ViewMain',
  data() {
    return {
        cards: null,
        loading: false,
        stores: null,
        branding: null
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
      },
      hasCards(){
        return ((!!this.cards)&&(this.cards.data.length>0)); 
      },
      hasStores(){
        return ((!!this.stores)&&(this.stores.data.length>0));
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
            
            var brands = [],
                ci     = this.cards.columnIndexes["ssctenantsadds.brandlogo"];
            this.cards.data.map((c)=>{
                if (!$utils.isEmpty(c[ci])){
                    brands.push(c[ci]);
                }
            });
            ci = this.stores.columnIndexes["ssctenantsadds.brandlogo"];
            this.stores.data.map((c)=>{
                if (!$utils.isEmpty(c[ci])){
                    brands.push(c[ci]);
                }
            });
            if (brands.length>0){
                var randomIndex = Math.floor(Math.random() * brands.length);
                this.branding = brands[randomIndex];
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
      },
      _short: function(title){
            var res;
            var n = title.indexOf(' ');
            if ( n > 0 ){
                res = title.charAt(0) + title.charAt(n + 1);
            } else if (title.length > 2){
                res = title.substr(0, 2);
            } else {
                res = title;
            }
            return res.toUpperCase();            
      }  //_short
      
      
  },
  render: function(h){
      var ci, data, childs = [];
      if ( this.loading ){
          childs.push(h('v-progress-linear',{props:{indeterminate:true}}));
      } else if ( this.hasCards || this.hasStores ){
        /** 
         * list of all accounts 
         * */
        data = this.cards.data;
        ci   = this.cards.columnIndexes;
        /**
         * Title
         */
        var my_branding = (!!this.branding);
        if (my_branding){
            childs.push(h('div', {
                class: {'sk-my-brand': true},
                style: {'background-image':'url("' + process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + this.branding.ref + '")'}
            }));
        }
        childs.push(
                    h('v-card',{
                        class: {'sk-card-user': true},
                        props: {flat: true},
                        style: {'background-color': my_branding ? 'transparent' : ''}
                    }, [
                        h('v-card-title', {class:{'d-flex':true}}, [
                            h('div', {class: {'sk-name': true}}, [
                                this.tod(),
                                ', ',
                                h('div', {class:{'sk-go-profile':true}}, [
                                    h('v-btn', {props:{text:true, to:{name:'profile'}, dark:true, 'x-large': true}}, this.name + '!')
                                ])
                            ]),
                            h('img', {attrs: {src: require('@/assets/imgs/my-logo.png'), viewBox:"0 0 512 512"}, class:'sk-logo'})
                        ]),
                        h('v-card-text',[
                            (this.hasCards)
                                ? 'у Вас ' + data.length + num2str(data.length, [' подписка', ' подписки', ' подписок'])
                                : 'у Вас еще нет подписок'
                        ])
                    ])
        );
        /**
         * Own list
         */
        if ( this.hasCards ){
            childs.push(
                    h('v-card', {
                        class: {'sk-card-list': true, 'sk-my-cards': true}
                    },[
                        h('v-card-title', [
                            h('h3','Мои подписки'),
                            h('svg',{ domProps: {innerHTML:'<use xlink:href="#ico-star" />'}, attrs: {viewBox:'0 0 576 512'}})
                        ]),
                        h('v-card-text', [
                            h('v-list', [
                                data.map((item)=>{
                                    const id    = item[ci["accounts.id"]],
                                          title = item[ci["accounts.tenantid.title"]],
                                          bc    = $utils.isEmpty(item[ci["ssctenantsadds.brandcolor"]]) ? '' : item[ci["ssctenantsadds.brandcolor"]], 
                                          loytt = item[ci["ssctenantsadds.shortloyalty"]];
                                    
                                    return h('v-list-item', {
                                        props: {key: id},
                                        on: {click:()=>{this.use_card(item, 'card');}}
                                    }, [
                                        h('v-list-item-content', [
                                            h('div', {
                                                    class: {'sk-short': true}, 
                                                    style: {'background-color': bc}
                                                }, this._short(title)),
                                            h('div', {class:{'sk-title':true}}, title),
                                            h('div', {class:{'sk-loytt': true}}, loytt)
                                        ])
                                    ]);
                                })
                            ])
                        ])
                ])
            );
        }

        /**
         * Other's
         */
        if ( this.hasStores ){
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
                                        on: {click:()=>{this.use_card(item, 'store');}}
                                    }, [
                                        h('v-list-item-content', [
                                            h('div', {class: {'sk-title': true}}, title),
                                            h('div', {class: {'sk-loytt': true}}, loytt)
                                        ])
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
    @import "@/assets/styles/index";

    main{
    }
    .sk-logo{
        width: 38px;
        height: 38px;
    }
    .sk-my-brand{
        position: absolute;
        top: 0;
        width: 100%;
        height: 280px;
        filter: blur(6px);
        -webkit-filter: blur(6px);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;        
    }
    .sk-card-user{
        background-color: $main-color;
        padding-bottom: 3rem;
        margin-bottom: -2.5rem;
        & .v-card__title{
            color: #fff;
            text-shadow: 1px 2px 3px rgba(0,0,0,0.666);
            justify-content: space-between;
            align-items: flex-start;
        }
        & .v-card__text{
            text-align: center;
            font-size: 1.5rem;
            color: #fff;
            line-height: 1.115;
            text-shadow: 1px 2px 3px rgba(0,0,0,0.666);
            & .sk-bonuces{
                font-size: 1.75rem;
            }
            & .sk-no-cards{
                font-size: 1rem;
            }
        }
        & .sk-go-profile{
            & .v-btn{
                font-size: 2rem;
                font-weight: 300;
                padding-left: 0;
                text-shadow: 1px 2px 3px rgba(0,0,0,0.666);
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
            & .v-list {
                & .v-list-item{
                    font-size: 0.75rem;
                    color: $gray-color !important;
                    line-height: 1.115;
                    & .sk-title{
                        font-size:1.125rem;
                        color: #000;
                    }
                }
            }
            
            &.sk-my-cards{
                margin-bottom: -1.5rem;
                & .v-list {
                    margin-left: 20px;
                    & .v-list-item{
                        border: 1px solid #d7d9dc;
                        border-radius: 0.5rem;
                        margin-bottom: 0.85rem;
                        box-shadow: 0 2px 6px #d7d9dc;
                        min-height: 4rem;
                        padding-left: 28px;
                        & .sk-short{
                            display: block;
                            border-radius: 8px;
                            align-self: center;
                            position: absolute;
                            left: -22px;
                            width: 44px;
                            height: 38px;
                            line-height: 38px;
                            text-align: center;
                            color: #fff;
                            box-shadow: 0 2px 4px rgba(0,0,0, 0.18);
                            border: 1px solid #fff;
                        }
                    }
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
            &.sk-stores{
                & .v-list{
                    & .v-list-item{
                        border-top: 1px solid #ccc;
                         & .sk-title{
                             font-size: 1rem;
                         }
                    }
                }
                & .v-card__title svg{
                    color: $gray-color;
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
                    $color: hsl(($i - 1)*$step, 80%, 60%);
                    & .v-list-item:nth-child(#{$group-size}n + #{$i}){
                        & .sk-short{
                            background-color: $color;
                            border: 1px solid darken($color, 20%);
                        }
                    }
                }
            }
            @include colors;
            
        }   /*sk-card-list*/
    }
    
</style>    
        
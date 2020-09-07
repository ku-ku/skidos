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
        VSkeletonLoader,
        VLazy,
        VCol
} from 'vuetify/lib';
import { Ripple } from 'vuetify/lib/directives';
import color from 'color';
import { eventBus } from '@/main';
import SkSvg from '@/components/SkSvg';

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
        VSkeletonLoader,
        VCol,
        VLazy,
        SkSvg
  },
  computed: {
      name: function(){
          return this.$store.getters["profile/name"];
      },
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
      },
      userId(){
        return (!!this.$store.state.profile.user) ? this.$store.state.profile.user.id : 'xxx000xxx';
      },
      isAnon(){
        return this.$store.getters["profile/isAnonymous"];
      },
      isopt(){
          return this.$store.getters["profile/is"]("trader");
      }
  },
  mounted() {
    if (!this.cards){
            const self = this;
        this._cards_ready().then(()=>{
            eventBus.$on('new-store', self._cards_ready);  
        });
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
      _cards_ready: async function(onlyStores) {
        var fullRead = (typeof onlyStores === "undefined") ? true : !onlyStores;
        
        var url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc',
            options = {
                type: 'core-read',
                query: 'sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee?sort=ssctenants.name'
            },
            brands = [],
            res;
        this.loading = true;
        try {
            var _fill = function(i, data){
                data.map((c)=>{
                    if (!$utils.isEmpty(c[i])){
                        brands.push(c[i]);
                    }
                });
            };
            
            /* My-cards (for non-anonymous) */
            if (this.$store.getters["profile/isAnonymous"]){
                //empty for anonymous
                this.cards = {data:[], columnIndexes:{}};
            } else {
                if (fullRead){
                    res = await $http.post(url, options);
                    if (!!res.error){
                        throw res.error;
                    }
                    this.cards = res.result;
                    _fill(this.cards.columnIndexes["ssctenantsadds.brandlogo"], this.cards.data);
                }
            }
            
            /* All others */
            var fltr = 'and(eq(field("sscTenantsAdds.hasAccount"), param(false, "boolean")),' 
                      + '   eq(field("sscTenantsAdds.isTrader"), param(' + ((this.isopt) ? 'true' : 'false') + ', "boolean")))';
            options.query = 'sin2:/v:c2d6f08c-974a-4ff8-904a-57dab6b976cb?sort=ssctenants.name' + 
                            '&filter=' + fltr; //eq(field("sscTenantsAdds.hasAccount"), param(false, "boolean"))';
            res = await $http.post(url, options);
            if (res.result){
                this.stores = res.result;
                _fill(this.stores.columnIndexes["ssctenantsadds.brandlogo"], this.stores.data);
            } else {
                console.log('ERR on stores: ', res.error);
                this.stores = {data:[], columnIndexes:{}};
            }
            
            if (brands.length > 0){
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
      }     //_short
  },        //methods
  watch: {
    isAnon(val){
        this._cards_ready();
    }
  },
  render: function(h){
      const isAnon = this.isAnon,
            name = isAnon ? "" : this.$store.getters["profile/get"]("name");

      var ci, data, childs = [];
      if ( this.loading ){
            childs.push(h('v-skeleton-loader', {props: {type:'card-avatar'}}));
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
//                style: {'background-image':'url("' + process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + this.branding.ref + '")'}
                style: {'background-image':'url("' + process.env.VUE_APP_BACKEND_RPC + '/static/model/view/' + this.branding.id + '")'}
                
            }));
        }
        childs.push(
                    h('v-card', {
                        key: 'sk-brand-' + this.userId,
                        class: {'sk-card-user': true},
                        props: {flat: true},
                        style: {'background-color': my_branding ? 'transparent' : ''}
                    }, [
                        h('v-card-title', {class:{'d-flex':true}}, [
                            h('div', {class: {'sk-name': true}}, [
                                this.tod(),
                                isAnon ? '!' : ', ',
                                isAnon ? null : h('div', {class:{'sk-go-profile': true}}, [
                                    h('v-btn', {props:{text:true, to:{name:'profile'}, dark:true, 'x-large': true}}, name + '!')
                                ])
                            ]),
                            h('img', {attrs: {src: require('@/assets/imgs/my-logo.png'), viewBox:"0 0 512 512"}, class:'sk-logo'})
                        ]),
                        isAnon 
                            ? null
                            : h('v-card-text',[
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
                            h('sk-svg', {props: {xref:"#ico-star"}})
                        ]),
                        h('v-card-text', [
                            h('v-list', [
                                data.map((item)=>{
                                    const id    = item[ci["accounts.id"]],
                                          title = item[ci["accounts.tenantid.title"]],
                                          bc    = $utils.isEmpty(item[ci["ssctenantsadds.brandcolor"]]) ? '' : item[ci["ssctenantsadds.brandcolor"]], 
                                          loytt = item[ci["ssctenantsadds.shortloyalty"]],
                                          img   = $utils.isEmpty(item[ci["ssctenantsadds.brandavatar"]]) 
                                                    ? item[ci["ssctenantsadds.brandlogo"]] 
                                                    : item[ci["ssctenantsadds.brandavatar"]];
                                    
                                    return h('v-list-item', {
                                        props: {key: id},
                                        on: {click:()=>{this.use_card(item, 'card');}}
                                    }, [
                                        h('v-list-item-content', [
                                            h('div', {
                                                    class: {'sk-short': true}, 
                                                    style: {'background-color': bc}
                                                }, 
                                                (!!img) 
                                                    ? [h('v-img', {props: {
//                                                            src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + img.ref, width:'100%', height:'auto', eager: true
                                                            src: process.env.VUE_APP_BACKEND_RPC + '/static/model/view/' + img.id, width:'100%', height:'auto', eager: true
                                                        }})]
                                                    : this._short(title)),
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
        data = this.stores.data||[];
        ci   = this.stores.columnIndexes||{};
//        if ( this.hasStores ){
            childs.push(
                    h('v-card', {
                        class: {'sk-card-list': true, 'sk-stores': true}
                    },[
                        h('v-card-title', {
                            props: {tile: true}
                        }, [
                            h('h3', [
                                'Все организации',
                                h('div', {class: {'sk-small': true}}, this.isopt ? 'оптовики' : 'розничные предложения')
                            ]),
                            h('sk-svg', {props: {xref: "#ico-store"}})
                        ]),
                        h('v-card-text', [
                            h('v-list', [
                                data.map((item)=>{
                                    const id    = item[ci["ssctenants.id"]],
                                          title = item[ci["ssctenants.title"]],
                                          bc    = item[ci["ssctenantsadds.brandcolor"]], 
                                          loytt = item[ci["ssctenantsadds.shortloyalty"]],
                                          img   = $utils.isEmpty(item[ci["ssctenantsadds.brandavatar"]]) 
                                                    ? item[ci["ssctenantsadds.brandlogo"]] 
                                                    : item[ci["ssctenantsadds.brandavatar"]];
                                  
                                    return h('v-list-item', {
                                            props: {key: id},
                                            on: {click:()=>{this.use_card(item, 'store');}}
                                        }, [
                                            h('v-list-item-content', [
                                                h('div', {class: {'sk-title': true}}, title),
                                                h('div', {class: {'sk-loytt': true}}, loytt)
                                            ]),
                                            (!!img)
                                                ? h('v-list-item-icon', [h('v-img', {props: {
//                                                    src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + img.ref, width:'100%', height:'auto', eager: true
                                                    src: process.env.VUE_APP_BACKEND_RPC + '/static/model/view/' + img.id, width:'100%', height:'auto', eager: true
                                                }})])
                                                : null
                                    ]);
                                })
                            ])
                        ])
                ])
            );
        }
/*        
        } else {
            childs = [h('h1',{}, this.tod() + ', ' + this.name)];
            childs.push(h('p',{class:{'fill-height':true, 'pa-2': true}},[
                'Список карт и магазинов недоступен, попробуйте позже.'
            ]));
        }
* 
*/
      return h('main', {key: 'main-'+this.userId, class: {'fill-height': true}}, childs);
  }
};
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";

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
                            border-radius: 6px;
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
                    font-size: 1.125rem;
                    font-weight: 400;
                    padding:0;
                    margin:0;
                    line-height: 1.125;
                }
                & svg{
                    width: 22px;
                    height: 22px;
                    color: $main-color;
                }
                & .sk-small{
                    font-size: 0.75rem;
                    color: $gray-color;
                }
            }
            
            &.sk-stores{
                & .v-list{
                    & .v-list-item{
                        border-top: 1px solid #ccc;
                         & .sk-title{
                             font-size: 1rem;
                         }
                         &__icon{
                             & .v-image{
                                 width: 42px !important;
                                 height: 42px !important;
                                 border-radius: 500px;
                                 border: 1px solid #fff;
                                 box-shadow: 0 2px 4px rgba(0,0,0,0.18);
                             }
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
<style lang="scss">
    .sk-short{
        border-radius: 6px;
        & .v-image__image,
        & .v-responsive__content{
            border-radius: 4px !important;
        }
    }
</style>

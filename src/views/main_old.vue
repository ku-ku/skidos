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
        VProgressLinear
} from 'vuetify/lib';
    
export default {
  name: 'ViewMain',
  data() {
    return {
        card: null,
        cards: null,
        loading: false,
        qr_bin_data: null,
        s: null
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
        VProgressLinear
  },
  computed: {
      name: function(){return this.$store.state.profile.user.name;},
      isAllow: function(){return this.$store.state.profile.user.isAuthenticated;}
  },
  mounted() {
    console.log('MAIN:', this);
    this._cards_ready();
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
                query: 'sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee'
            },
            qrId = null;
        this.loading = true;
        try {
            var res = await $http.post(url, options);
            if (!!res.error){
                throw res.error;
            }
            this.cards = res.result;
            this.loading = false;
        } catch(err) {
            this.loading = false;
            console.log('Cards error', err);
            app.msg({text:'Ошибка чтения списка карт', type:'warning'});
        }
      },    //_cards_ready
      use_card: function(card){
          $(this.$el).find('.sk-accounts, .sk-account').fadeOut({
              duration: 400,
              done: ()=>{
                  this.card = card;
              }
          });
      }
  },
  watch: {
      card: function(val){
          if (!!val){
            const ci = this.cards.columnIndexes,
                  url = process.env.VUE_APP_BACKEND_API + '/skidosapi/get-qr',
                  qrId = this.card[ci['accounts.id']];
            $http.post(url, {
                    method: 'POST',
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'text',
                    processData: false,
                    cache: false,
                    data: JSON.stringify({id: qrId})
                }).then((resp)=>{
                    this.qr_bin_data = 'data:image/png;base64,'+ resp; 
                }).catch((err)=>{
                    app.msg({text:'Ошибка получения QR-кода: ' + err.message, type:'warning'});
                    console.log(err);
                });
            }
      }     //card
  },
  render: function(h){
      var ci, childs = [];
      if ( this.loading ){
          childs.push(h('v-progress-linear',{props:{indeterminate:true}}));
      } else if (!!this.card) {
      /**
       * One selected account
       */
        ci = this.cards.columnIndexes;
        var logo= this.card[ci["ssctenantsadds.brandlogo"]],
            bc  = this.card[ci["ssctenantsadds.brandcolor"]], 
            addr= this.card[ci["ssctenantsadds.location"]],
            title=this.card[ci["accounts.tenantid.title"]],
            loytt=this.card[ci["ssctenantsadds.loyalty"]];
        if (!$utils.isEmpty(loytt)){
            loytt = loytt.replace(/;/g, '<br />');
        }
        childs.push(h('v-card',
                        {
                            key: this.card[ci["accounts.id"]],
                            class:{'sk-account': true, 'fill-height': true},
                            props: {flat: true}
                        },
                        [
                            h('v-card-title', {
                                style: {'background-color': (!!bc) ? bc : '#fff'}
                            }, [
                                h('v-btn',{
                                    props: {flat: true, icon: true, absolute: true, title: 'к списку'},
                                    class: {'sk-back': true},
                                    on: {click:()=>{this.use_card(null);}}
                                },[
                                    h('svg', {domProps:{innerHTML:'<use xlink:href="#ico-left" />'},attrs:{viewBox:'0 0 192 512'}})
                                ]),
                                (!!logo) 
                                        ? h('v-img', {props: {src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + logo.ref, width:'100%', height:'auto'}})
                                        : null,
                                (!!logo) ? null : title
                            ]), /*v-card-title*/
                            h('v-card-text', {class:{'d-flex':true,'flex-column':true,'justify-center':true,'align-self-center':true}},[
                                h('h3', {
                                    class: {'sk-loyalty': true},
                                    style: {color: $utils.isEmpty(bc) ? 'inherit' : bc},
                                    domProps: {'innerHTML': loytt}
                                }),
                                (!!this.qr_bin_data) 
                                    ? h('img', {
                                        attrs: {
                                                    src: this.qr_bin_data,
                                                    id:  'img-' + this.card[ci["accounts.id"]]
                                                },
                                        class: {'sk-qr': true}
                                    }) 
                                    : null,
                                h('h3',{
                                        class:{'sk-ammount':true},
                                        style: {color: $utils.isEmpty(bc) ? 'inherit' : bc}
                                    }, 'Бонусов - ' + (
                                    $utils.isEmpty(this.card[ci["accounts.amount"]]) 
                                    ? 'не накоплено' 
                                    : this.card[ci["accounts.amount"]])) 
                            ]),
                            h('v-card-actions', [
                                (this.card[ci["ssctenantsadds.phone"]])
                                    ? h('a', {attrs:{href:'tel://' + this.card[ci["ssctenantsadds.phone"]], target: '_blank'}}, [
                                            h('svg', {domProps:{innerHTML:'<use xlink:href="#ico-phone" />'},attrs:{viewBox:'0 0 512 512'}}),
                                            this.card[ci["ssctenantsadds.phone"]]
                                        ])      
                                    : null,
                                (this.card[ci["ssctenantsadds.uri"]])
                                    ? h('a', {attrs:{href: 'http://' + this.card[ci["ssctenantsadds.uri"]], target: '_blank'}}, [
                                            h('svg', {domProps:{innerHTML:'<use xlink:href="#ico-planet" />'},attrs:{viewBox:'0 0 496 512'}}),
                                            this.card[ci["ssctenantsadds.uri"]]
                                        ])
                                    : null
                            ])
                        ]
        ));
      } else if ((!!this.cards)&&(this.cards.data.length>0)){
        /** 
         * list of all accounts 
         * */
        var data = this.cards.data,
            re   =  $utils.isEmpty(this.s) ? null : new RegExp(this.s, 'gi');

        ci   = this.cards.columnIndexes;
        var _short = function(title){
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
        };  //_short
        childs.push(
                h('v-card', {
                    key:'card-accounts',
                    class:{'sk-accounts':true},
                    props: {flat: true}
                }, [
                h('v-card-title', {}, [
                    this.tod(),
                    ', ',
                    h('strong', this.name + '!')
                ]), /*v-card-title*/
                h('v-card-text', [
                    h('v-text-field', {
                        props: {
                                    label:'поиск', dense: true, clearable: true,
                                    value: this.s
                        },
                        on: {input: (s) => {
                                this.s = s;
                            }}
                    }),
                    h('v-list', {
                        props: {nav: true, avatar: true}
                    }, [
                        this.cards.data.map( (store)=>{
                            const title=store[ci["accounts.tenantid.title"]];
                            if ((!!re) && (!re.test(title))){
                                return null;
                            }
                            const ava = store[ci["ssctenantsadds.brandavatar"]],
                                  bc  = store[ci["ssctenantsadds.brandcolor"]], 
                                  addr= store[ci["ssctenantsadds.location"]],
                                  loytt=store[ci["ssctenantsadds.shortloyalty"]];
                                  
                            return h('v-list-item',{
                               key: store[ci["accounts.id"]],
                               on: {click: ()=>{ this.use_card( store );} }
                            }, [
                                h('v-list-item-avatar', [
                                    (!!ava) 
                                    ? h('v-img',{props: {src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + ava.ref, width:'100%', height:'auto'}})
                                    : h('div', {
                                            class: {'sk-short':true},
                                            style: $utils.isEmpty(bc) ? null : {'background-color': bc}
                                        }, _short(title))
                                ]),
                                h('v-list-item-content', [
                                    h('v-list-item-title', title),
                                    h('v-list-item-subtitle', [
                                        (!!addr)&&(addr.city) ? h('v-list-item-subtitle', addr.city.name) : null,
                                        $utils.isEmpty(bc) ? null : loytt
                                    ])
                                ])
                            ]);     /* v-list-item's */
                        } )
                    ])              /* v-list */
                    ]) /* v-card-text */
                ])
        );
      } else {
          childs = [h('h1',{}, this.tod() + ', ' + this.name)];
          childs.push(h('p',{class:{'fill-height':true, 'pa-2': true}},[
              'У Вас еще не оформлено ни одной карты, пожалуйста выберите из списка для дальнейшего использования.',
              h('v-btn',{props:{to:'/stores'}},'выбрать')
          ]));
      }
      return h('main', childs);
  }
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
    }
    .sk-accounts{
        & .v-card__title{
            flex-flow: column;
            align-items: flex-start;
            & strong{
                display: block;
                font-size: 2.5rem;
                font-weight: 300;
            }
        }
        & .v-list-item__title{
            font-size: 1.25rem;
        }
    }   /* .sk-accounts */
    .sk-account{
        & .v-card__title{
            padding:0;
        }
        & .v-btn{
            &.sk-back{
                top: 0.75rem;
                left: 0.75rem;
                z-index: 999;
                background-color: rgba(0,0,0,0.5);
                border: 1px solid rgba(0,0,0,0.24);
                opacity: 0.9;
                & svg{
                    width: 28px;
                    height: 28px;
                    color: #fff;
                }
            }
        }
        & .sk-qr{
            width: 75%;
            max-width: 240px;
            height: auto;
            margin: 0 auto;
        }
        & .v-card__actions{
            font-size: 0.75rem;
            & > a{
                margin: 0 0.85rem;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                text-decoration: none;
                color: #757575;
            }
            text-align: right;
            justify-content: flex-end;
            & svg{
                width: 0.7rem;
                height: 0.7rem;
                margin-right: 0.5rem;
            }
        }
        & .sk-loyalty{
            font-size: 0.9rem;
        }
        & .sk-ammount{
            text-align: center;
            font-size: 1.25rem;
        }
    }
</style>    
        
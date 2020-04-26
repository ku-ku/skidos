<script>
import { VBtn,
         VImg,
         VCard,
         VCardTitle, 
         VCardSubtitle, 
         VCardText,
         VCardActions,
         VProgressLinear,
         VBottomNavigation,
         VContainer,
         VRow,
         VCol,
         VFabTransition
       } from 'vuetify/lib';

import SkFilials from '@/views/fils';
import SkFind from '@/views/find'; 
import SkShare from '@/views/share'; 
import SkActions from '@/views/actions'; 

const ST_MODE = {
    'none': -1,
    'def':   0, /* actions */
    'qr' :   1,
    'info':  2,
    'fils':  3,
    'find':  4,
    'share': 5
};

export default {
  name: 'ViewStore',
  props: {
      id: {
          type: String,
          required: true
      }
  },
  components: {
        VBtn,
        VImg,
        VCard,
        VCardTitle, 
        VCardSubtitle, 
        VCardText,
        VCardActions,
        VProgressLinear,
        VBottomNavigation,
        VContainer,
        VRow,
        VCol,
        VFabTransition,
        SkFilials,
        SkFind,
        SkShare,
        SkActions
  },
  data() {
    return {
        store: null,
        store_branding: null,
        card: {},           /* empty for button's hide */
        loading: false,
        qr_bin_data: null,
        error: null,
        mode: ST_MODE.def
    };
  },
  mounted: function(){
      this.refresh();
  },
  computed: {
        iStore(){
            var o = {};
            if ( (this.store) && (this.store.data) && (this.store.data.length>0) ){
                const data = this.store.data[0],
                      ci = this.store.columnIndexes;
                o.id = data[ci["ssctenants.id"]];
                o.title = data[ci["ssctenants.title"]];
            } else {
                o.id = '00';
            }
            return o;
        },
        hasStore(){
            return this.iStore.id !== "00";
        },
        hasCard(){
            return ((this.card)&&(this.card.data)&&(this.card.data.length>0));
        },   //hasCard
        cardId(){
            if (this.hasCard){
                var ci = this.card.columnIndexes;
                return this.card.data[0][ci["accounts.id"]];
            }
            return null;
        },
        cardNum(){
            if (this.hasCard){
                var ci = this.card.columnIndexes;
                return this.card.data[0][ci["accounts.regnum"]] || '-';
            }
            return '';
        },
        cardDt(){
            if (this.hasCard){
                var ci = this.card.columnIndexes;
                var d  = this.card.data[0][ci["accounts.regdt"]];
                return (!!d) ? $utils.formatDate(d) : '';
            }
            return '';
        },
        bonuces(){
            if (this.hasCard){
                var ci = this.card.columnIndexes;
                return this.card.data[0][ci["accounts.amount"]];
            }
            return null;
        }
  },
  methods: {
      refresh: async function(){
        this.loading = true;
        const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
        var options = {
            type: 'core-read',
            query: 'sin2:/v:c4e208aa-a355-49bf-8c00-4175a9ed5006/?id=' + this.id
        };
        try {
            var resp = await $http.post(url, options);
            if (resp.error){
                throw resp.error;
            }
            this.store = resp.result;
            var ci = resp.result.columnIndexes;
            await this.card_by(this.store.data[0][ci["ssctenants.id"]], 'store');
        } catch(e){
            console.log('Err on store:', e);
            this.error = {error: e};
        }
        //this.mode = ST_MODE.def;
        this.loading = false;
      },    //refresh
      card_by: async function(id, that){
        const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
        var options = {
            type: 'core-read',
            query: null
        };
        switch(that){
            case 'id':
                options.query = 'sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee?filter=eq(field(".id"), param("' + id + '", "id"))';
                break;
            case 'store':
            case 'tenant':
                options.query = 'sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee?filter=eq(field(".tenantId"), param("' + id + '", "id"))';
                break;
        }
        try{
            var resp = await $http.post(url, options);
            if (!!resp.result) {
                this.card = (resp.result.data.length>0) ? resp.result : null;
            } else {
                throw resp.error;
            }
        } catch(e){
            console.log('Err on get card:', e);
        }
      },
      qr_load_image: function(e){
          const i = $(e.target);
          i.animate({opacity:1});
      },
      take_card: async function(){
        var url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc',
            id_to_take = $utils.uuidv4();
      
        const options = {
            type: 'core-create',
            query: 'sin2:/v:e4737054-e251-44ff-8fc7-9eba56dd1faf',
            params: [
                {id: 'id', type:'id', value: id_to_take},
                {id: 'userID', type:'id', value: this.$store.state.profile.user.id},
                {id: 'tenantID', type:'id', value: this.id},
                {id: 'regDt', type: 'dateTime', value: new Date()},
                {id: 'Blocked', type: 'boolean', value: false}
            ]
        };
        this.loading = true;
        try{
            var resp = await $http.post(url, options);
            if (resp.error){
                throw resp.error;
            }
            this.card_by(id_to_take, 'id');
        } catch(e){
            app.msg({text:'Ошибка регистрации карты, попробуйте получить позднее.', type:'warning'});
            console.log('ERR on reg card:', e);
        }
        this.loading = false;
      },     //take_card
      unuse_card: async function(){
        const url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
      
        const options = {
            type: 'core-update',
            query: 'sin2:/v:e4737054-e251-44ff-8fc7-9eba56dd1faf',
            params: [
                {id: 'id', type:'id', value: this.cardId},
                {id: 'Blocked', type: 'boolean', value: true}
            ]
        };
        this.loading = true;
        try{
            var resp = await $http.post(url, options);
            if (resp.error){
                throw resp.error;
            }
            this.card = null;
           
        } catch(e){
            app.msg({text: 'Ошибка удаления карты, попробуйте выполнить позднее.', type:'warning'});
            console.log('ERR on reg card:', e);
        }
        this.loading = false;
      },
      show_info(){
          this.info = !this.info;
      }
  },
  watch: {
        card: function(val){
            if (!val){
                this.qr_bin_data = null;
                return;
            }
            const url = process.env.VUE_APP_BACKEND_API + '/skidosapi/get-qr',
                  ci  = this.card.columnIndexes;
            $http.post(url, {
                    method: 'POST',
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'text',
                    processData: false,
                    cache: false,
                    data: JSON.stringify({id: this.card.data[0][ci["accounts.id"]]})
            }).then((resp)=>{
                this.qr_bin_data = 'data:image/png;base64,'+ resp; 
            }).catch((err)=>{
                app.msg({text:'Ошибка получения QR-кода: ' + err.message, type:'warning'});
                console.log(err);
            });
        }   //card
  },
  render: function( h ){
        var childs = [];
        if (!this.store){
            childs.push(
                h('v-card',{class:{'store-loading':true},key:'store-loading'},[
                    h('v-progress-linear',{props:{indeterminate:true}})   //TODO: when card register
                ])
            );
        } else if (this.error){
            childs.push(
                h('v-card',{class:'store-error',key:'store-error'},[
                    //TODO: error
                ])
            );
        } else {
            const ci = this.store.columnIndexes,
                  data = this.store.data;
            if (data.length < 1){
                childs.push(
                        h('v-card',{class:'store-no-data',key:'store-no-data'},[
                            //TODO: no store data
                        ])
                );
            } else {    //NORMAL
                const title = data[0][ci["ssctenants.title"]],
                      bg = data[0][ci["ssctenantsadds.brandcolor"]],
                      bc = data[0][ci["ssctenantsadds.balancecolor"]],
                      bi = data[0][ci["ssctenantsadds.brandlogo"]],
                      tel= data[0][ci["ssctenantsadds.phone"]],
                      web= data[0][ci["ssctenantsadds.uri"]],
                      short=data[0][ci["ssctenantsadds.shortloyalty"]];
              
                var ly = data[0][ci["ssctenantsadds.loyalty"]];
                if (!$utils.isEmpty(ly)){
                    ly = ly.replace(/;/g, '<br />');
                }
                
                var titleVNodes = [];
                titleVNodes.push( 
                    h('div', {class: {'sk-top-bar': true}}, [
                        h('v-btn', {
                            props: {dark: true, icon: true, small: true, tile: true},
                            on: {click: ()=>{this.$router.go(-1);}}
                        }, [
                            h('svg',{attrs:{viewBox:'0 0 192 512'}, domProps:{innerHTML:'<use xlink:href="#ico-left" />'}})
                        ]),
                        h('v-btn', {props: {dark: true, icon: true, small: true, tile: true, to: '/profile'}}, [
                            h('svg',{attrs:{viewBox:'0 0 512 512'}, domProps:{innerHTML:'<use xlink:href="#ico-cog" />'}})
                        ])
                    ])
                );
                if (!!bi){
                    titleVNodes.push(
                        h('v-img',{props: {src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + bi.ref, width:'100%', height:'auto'}})
                    );
                } else {
                    titleVNodes.push( h('h1', title) );
                }
                if (this.hasCard){
                    titleVNodes.push( h('h3', {
                                    class: {'sk-bonuces': true},
                                    style: {'color': $utils.isEmpty(bc) ? '' : bc},
                                    domProps: {
                                        innerHTML: ( this.bonuces > 0 ) 
                                                    ? 'накоплено <b>' + this.bonuces + '</b> бонусов'
                                                    : '<b>0</b> бонусов'
                                    }
                                })
                        );
                }
        
                childs.push(
                    h('v-card', {
                        key:'store-brand-' + data[0][ci["ssctenants.id"]],
                        class:{'sk-store-brand': true},
                        props: {flat: true, tile: true}
                    }, [
                        h('v-card-title', {
                            style: {'background-color': $utils.isEmpty(bg) ?  '#00897B' : bg}
                        },  titleVNodes), /*v-card-title*/
                        h('v-card-text', [
                            h('div', {class:{'sk-store-nav': true, 'd-flex':true,'justify-space-around':true,'align-center':true,'flex-nowrap':true}}, [
                                h('v-btn',{props:{outlined: true}, on:{click:()=>{this.mode=ST_MODE.fils;}}},[
                                    h('svg',{attrs:{viewBox:'0 0 576 512'},domProps:{innerHTML:'<use xlink:href="#ico-home" />'}})
                                ]),
                                h('v-btn',{props:{outlined: true}, on:{click:()=>{this.mode=ST_MODE.find;}}},[
                                    h('svg',{attrs:{viewBox:'0 0 512 512'},domProps:{innerHTML:'<use xlink:href="#ico-search" />'}})
                                ]),
                                h('v-btn', {props:{outlined: true}, on: {click: ()=>{
                                                    this.mode = (this.mode===ST_MODE.qr) ? ST_MODE.def : ST_MODE.qr;
                                                }
                                            } },[
                                    h('svg', {attrs:{viewBox:'0 0 448 512'},domProps:{innerHTML:'<use xlink:href="#ico-qrcode" />'}})
                                ]),
                                h('v-btn',{props:{outlined: true}, on:{click:()=>{this.mode=ST_MODE.share;}}},[
                                    h('svg',{attrs:{viewBox:'0 0 448 512'},domProps:{innerHTML:'<use xlink:href="#ico-share" />'}})
                                ]),
                                h('v-btn',{props:{outlined: true}, on:{click:()=>{this.mode=ST_MODE.info;}}},[
                                    h('svg',{attrs:{viewBox:'0 0 192 512'},domProps:{innerHTML:'<use xlink:href="#ico-info" />'}})
                                ])
                            ])
                        ])
                    ])
                );  //branding
                var links = [];
                if ( !$utils.isEmpty(tel) ){
                    links.push( h('a', {attrs: {href:'tel:'+tel, target:'_blank'}, style:{color: (!!bg) ? bg : '' }}, [
                                    h('svg',{domProps: {innerHTML:'<use xlink:href="#ico-phone" />'}, attrs: {viewBox:'0 0 512 512'}}),
                                    tel
                    ]));
                }
                if ( !$utils.isEmpty(web) ){
                    links.push( h('a', {attrs: {href:'tel:'+tel, target:'_blank'}, style:{color: (!!bg) ? bg : '' }}, [
                                    (h('svg',{ domProps: {innerHTML:'<use xlink:href="#ico-planet" />'}, attrs: {viewBox:'0 0 496 512'}})),
                                    web 
                    ]));
                }
                
                var conte = [];
                switch( this.mode ){
                    case ST_MODE.info:
                        if ( !$utils.isEmpty(ly) ){     /* =================== store & card additional info =================== */
                            conte.push(h('h3', {class: {'sk-loyalty': true}, domProps: {innerHTML: ly}}));
                        }
                        if (this.hasCard){
                            conte.push( h('h3', {class: {'sk-card-inf': true}},
                                'карта № ' + this.cardNum  + ' оформлена ' + this.cardDt
                            ));
                        }
                        if ( links.length > 0 ) {
                            conte.push( h('div', {class:{'sk-links': true}}, [
                                            'Вы можете связаться с нами:',
                                            links
                            ]) );
                        }
                        break;
                    case ST_MODE.fils:
                        conte.push( h('sk-filials', {props: {parent:this.iStore}}, []) );
                        break;
                    case ST_MODE.find:
                        conte.push( h(SkFind, {props:{parent:this.iStore}}) );
                        break;
                    case ST_MODE.share:
                        conte.push( h(SkShare, {props:{parent:this.iStore}}) );
                        break;
                    case ST_MODE.qr:                        /* =================== QR & card  =================== */
                        if ( this.hasCard ){
                            if (!!this.qr_bin_data) {
                                conte.push( h('div', {class:{'sk-qr-place': true}}, [
                                        h('img', {
                                                    attrs: {
                                                                src: this.qr_bin_data,
                                                                id: this.cardId
                                                            },
                                                    class: {'sk-qr': true},
                                                    style: {'opacity': 0},
                                                    on: {'load': this.qr_load_image}
                                        }),
                                        h('div', {style:{'text-align':'right', 'margin': '-1rem 0 1.5rem'}}, [
                                            h('v-btn', {
                                                props: {'x-small': true, text: true},
                                                on: {click: this.unuse_card}
                                            }, 'отказаться')
                                        ])
                                ]));
                            }
                        } else {
                            if (!$utils.isEmpty(short)){
                                conte.push( h('h3', {class: {'sk-loyalty': true}, domProps: {innerHTML: short}}) );
                            }
                            conte.push( h('div', {class: {'sk-takes': true}}, [
                                    h('v-btn', {
                                                    class: {'sk-take': true},
                                                    props: {outlined: true, loading: this.loading},
                                                    on:    {click: this.take_card}
                                                }, 'Получить карту'),
                                    h('v-btn', {
                                                    class: {'sk-link': true},
                                                    props: {outlined: true, disabled: true}
                                               },
                                    'Привязать')
                            ]));
                        }
                        links.push( h('div', {
                            style: {'text-align':'right', 'font-size': '0.7rem', width: '100%', 'margin-right':'0.5rem'}
                        },[
                            h('span',{domProps: {innerHTML:'*подробная информация в <b><i>i</i></b>'}})
                        ]));
                        conte.push ( h('div', {class:{'sk-links': true}}, links) );
                        break;
                    default:
                        //none
                }   //switch( this.mode...
                
                if ( conte.length > 0 ){
                    childs.push(
                        h('v-card', {
                            key:'card-conte-' + data[0][ci["ssctenants.id"]],
                            class: {'sk-card-conte': true},
                            props: {flat: true, tile: true}
                        }, [
                            h('v-card-text', conte)
                        ])
                    );
                }
            }
        }
        
        if (this.mode !== ST_MODE.def){
            childs.push(h('v-fab-transition', [
                h('v-btn', {props: {
                                fab: true,
                                light: true,
                                bottom: true,
                                left: true,
                                to: '/'
                }}, [
                    h('img', {class:{'sk-logo': true}, attrs: {viewBox:'0 0 512 512', src: require('@/assets/imgs/logo.svg')}})
                ])
            ]));
        }
/*        
        childs.push(
            h('v-container', {class:'sk-go-my'}, [
                    h('v-row', {class: {'justify-center': true}}, [
                        h('v-col', {props: {cols: 7}}, [
                            h('v-btn', {props: {outlined: true, block: true, to: '/'}}, 'мои карты')
                        ])
                    ])
            ])
        );
 */     if (this.hasStore){
            childs.push( h('sk-actions', {
                    props: {store: this.iStore},
                    class: {'d-none': !((this.mode === ST_MODE.def) || (this.mode === ST_MODE.qr))},
                    on: {actions: (n) => {
                            if ( n < 1 ){
                                this.$nextTick(()=>{this.mode = ST_MODE.qr;});
                            }
                    }}
            }) );
        }
        
        return h('main', {class: {
                                    'sk-store-main': true, 
                                    'sk-has-qr':    (this.mode === ST_MODE.qr),
                                    'sk-has-info':  (this.mode === ST_MODE.info),
                                    'sk-has-fils':  (this.mode === ST_MODE.fils),
                                    'sk-has-find':  (this.mode === ST_MODE.find),
                                    'sk-has-share': (this.mode === ST_MODE.share),
                                    'sk-has-card' : (this.hasCard),
                                    'sk-no-card':   (!this.hasCard)
                         }}, childs);
            
    } //render
}     //export
</script>

<style lang="scss" scoped>
    @import "@/assets/styles/index";
    $gray-color: #757575;
    
    .sk-store-main{
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .sk-top-bar{
        display: flex;
        justify-content: space-between;
        padding: 1rem;
        background: transparent;
        position: absolute;
        z-index: 4;
        top: 0;
        width: 100%;
        & .v-btn{
            border-radius: 50%;
            background: rgba(0,0,0, 0.18);
            padding: 0.75rem;
            line-height: 28px;
            & svg{
                width: 1rem;
                height: 1rem;
                opacity: 0.75;
            }
        }
    }

    .v-btn--fab{
        margin: 0 0 1.5rem 1.5rem;
        padding: 0.5rem;
        & .sk-logo{
            width: 32px;
            height: 32px;
        }
    }
    .sk-store-brand{
        & .v-card__title{
            padding:0;
            background-color: #00897B;
            color: #fff;
            background-size: cover;
            min-height: 140px;
            & h1{
                font-size: 1.5rem;
                padding: 0 0.75rem;
            }
            & .sk-bonuces{
                text-align: center;
                position: absolute;
                bottom: 5rem;
                width: 100%;
                font-size: 2rem;
                font-weight: 400;
                text-shadow: 0 2px 6px rgba(0,0,0,0.28);
                opacity: 0.9;
                color: #fff;
                & b{font-size: 2.5rem;}
            }
        }
        & .v-card__text{
            position: relative;
            padding: 0 0 2rem 0;
        }
    }   /* .sk-store-brand */

    .sk-store-nav{
        position: absolute;
        width:100%;
        top: -1.55rem;
        background: transparent;
        z-index: 4;
        & .v-card__text{
            padding: 0;
        }
        & .v-btn:not(.v-btn--round).v-size--default{
            padding: 0;
            width: 38px;
            min-width: 38px;
            height: 38px;
            border-color: darken($gray-color, 10%);
            background-color: #fff;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.5) !important;
            transition: all 0.33s ease;
            & svg {
                transition: all 0.33s ease;
                width: 22px;
                height: 22px;
                color: $gray-color;
            }
        }
    }   /* .sk-store-nav */
    
    .sk-card-card{
        margin: 2rem 0;
        background: #fff;
        border-radius: 6px;
        height: 'auto';
        box-shadow: 0 2px 6px rgba(0,0,0, 0.22);
    }   /* .sk-card-card */
    
    .sk-card-conte{
        align-self: stretch;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
        & .sk-loyalty{
            font-size: 0.85rem;
            color: $gray-color;
            text-align: center;
            line-height: 1.115;
            font-weight: 300;
        }
        & .v-card__text {
            & .sk-takes {
                margin-top: 3rem;
                display: flex;
                flex-direction: column;
                & .v-btn.v-size--default{
                    border-radius: 500px;
                    margin: 0 4rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.33) !important;
                    border-color:  $gray-color;
                    font-size: 1rem;
                    &.sk-take{
                        background-color: $red-color;
                        border-color:  $red-color;
                        color: #fff;
                        margin-bottom: 2rem;
                    }
                }
            }
            & .sk-qr-place{
                text-align: center;
                max-width: 220px;
                margin: 0 auto;
                & > *{
                    margin: 0 auto;
                    width: 100%;
                    height: auto;
                }
            }
                
            & .sk-bonuces{
                font-size: 1.25rem;
                color: $gray-color;
                text-align: center;
                font-weight: 400;
            }
        }
        & .sk-links {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            font-size: 0.75rem;
            padding-top: 0;
            line-height: 1.115;
            & a {
                text-decoration: none;
                display: inline-block;
                margin-right: 0.5rem;
                & svg {
                    width: 0.75rem;
                    height: 0.75rem;
                    margin-right: 0.35rem;
                }
            }
        }
    }   /* .sk-card-conte */
    
    .sk-has-qr{
        & .sk-store-nav{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(2), &:nth-child(4){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(3){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }
    }   /* .sk-has-qr */
    
    .sk-has-info{
        & .sk-store-nav{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(4){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(5){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }

        & .sk-card-conte{
            justify-content: flex-start;
            & .sk-loyalty{
                font-size: 1rem;
                margin-bottom: 1rem;
                text-align: left;
            }
            & .sk-bonuces{
                margin: 1rem 0 2rem 0;
                text-align: center;
                font-size: 2rem;
            }
            & h1{
                font-weight: 400;
                margin: 0 0 1.5rem 0;
            }
            & h3{
                font-weight: 400;
                margin-bottom: 1rem;
            }
            & .sk-links{
                display: block;
                font-size: 1rem;
            }
        }
    }
    
    .sk-has-fils{
        & .sk-store-nav{
            & .v-btn:not(.v-btn--round).v-size--default{
                width: 38px;
                min-width: 38px;
                height: 38px;
                & svg{
                    width: 22px;
                    height: 22px;
                }
                &:nth-child(1){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
                &:nth-child(2){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
            }
        }
    }
    
    .sk-has-find{
        & .sk-store-nav{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(1), &:nth-child(3), &:nth-child(4), &:nth-child(5){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(2){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }
    }
    .sk-has-share{
        & .sk-store-nav{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(1), &:nth-child(2), &:nth-child(3), &:nth-child(5){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(4){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }
    }
    
    .sk-go-my{
        position: absolute;
        bottom: 0;
        background: #fff;
        border-radius: 6px 6px 0 0;
        & .v-btn.v-size--default{
            border-radius: 500px;
            background-color: $red-color;
            border-color:  $red-color;
            color: #fff;
        }
    }
    
    .sk-no-card{
        & .sk-card-conte{
            & .sk-links{
                margin-top: 2rem;
            }
        }
    }
    
</style>
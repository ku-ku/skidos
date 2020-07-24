<script>
import { 
         VBtn,
         VImg,
         VList, 
         VSubheader,
         VListItem,
         VListGroup,
         VListItemGroup,
         VListItemIcon,
         VListItemContent,
         VListItemTitle,
         VListItemSubtitle,
         VListItemAction,
         VTextField,
         VBadge,
         VChip,
         VChipGroup,
         VBottomSheet,
         VCard,
         VCardText,
         VCardTitle,
         VToolbar,
         VToolbarTitle,
         VSpacer,
         VSheet,
         VForm,
         VSkeletonLoader,
         VTooltip,
         VTreeview,
         VDivider,
         VAlert
    } from 'vuetify/lib';
import SkSvg from '@/components/SkSvg';
    
const FIND_MODE = {
    'none':    -1,
    'default': 0,
    'abc':     1,
    'cat' :    2,
    'q':       3,
    'loading': 999,
    'error':   9999
};

export default {
    name: 'ViewProds',
    components: {
        VBtn,
        VImg,
        VList, 
        VSubheader,
        VListItem,
        VListGroup,
        VListItemGroup,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VTextField,
        VBadge,
        VChip,
        VChipGroup,
        VBottomSheet,
        VCard,
        VCardTitle,
        VCardText,
        VToolbar,
        VToolbarTitle,
        VSpacer,
        VSheet,
        VForm,
        VSkeletonLoader,
        VTooltip,
        VTreeview,
        VDivider,
        VAlert,
        SkSvg
    },
    data(){
        return {
            mode: FIND_MODE.none,
            showParams: false,
            totals: null,
            abc:  null,
            kinds: null,
            activeKind: null,
            data: null,
            q: null
        };
    },
    computed: {
        parent(){
            return this.$store.state.active.store;
        },
        tenant(){
            return (!!this.parent) ? this.parent.id : '00';
        },
        hasKinds(){
            return (!!this.kinds)&&(this.kinds.length > 0);
        },
        canFind(){
            return (!!this.totals)&&(this.totals.n > 0);
        }
    },
    created(){
        this.refresh();
    },  //created
    activated(){
        if (!(!!this.data)){
            this.refresh().then(()=>{
                this.show_find_params();
            });
        }
    },
    deactivated(){
        this.showParams = false; //hide params-pane
        $(".sk-find-params").css({display:'none'});
    },
    methods: {
        async refresh(){
            this.mode = FIND_MODE.loading;
            try {
                
                /* Categories */
                this.getcats(null);
                
                /* totals */
                const opts = {
                    type: "query",
                    query: "37afe6aa-4d4b-4f27-a34c-173e746cd7d7.searchData",
                    params: {
                        that: 1,
                        tenantid: this.tenant,
                        prms: ''
                    }
                };
                var resp = await $http.post(opts);
                console.log(resp);
                if (!!resp.error){
                    throw resp.error;
                }
                
                /* ABC */
                var abc = [];
                resp.result.data.map((a)=>{
                    if (!this.totals){
                        this.totals = {n: a[0]};
                        this.totals.dt = $utils.formatDate(new Date(a[1]));
                    }
                    abc.push({a: a[2], n: a[3], active: false});
                });
                this.abc = abc;
                this.mode = FIND_MODE.default;
            }catch(e){
                this.mode = FIND_MODE.error;
                console.log('ERR: load abc:', e);
            }
        },
        async find(that){
            this.mode = FIND_MODE.loading;
            this.data = null;
            const opts = {
                type: "query",
                query: "37afe6aa-4d4b-4f27-a34c-173e746cd7d7.searchData",
                params: {
                    that: 2,
                    tenantid: this.tenant,
                    prms: that
                }
            };
            try {
                var resp = await $http.post(opts);
                if (!!resp.error){
                    throw resp.error;
                }
                var data = [];
                resp.result.data.map((a)=>{
                    data.push({id: a[4], name: a[6], price: a[11], img: a[5], unit: a[13]});
                });
                if (!this.totals){
                    this.totals = {n: 0};
                }
                this.totals.n = data.length;
                this.data = data;
                app.msg({
                            text: (data.length > 0) ? 'Найдено ' + data.length + ' позиций' : 'Ничего не найдено', 
                            color: this.parent.brandcolor
                        });
                this.$nextTick(()=>{this.$forceUpdate();});
            } catch(e) {
                console.log('ERR: load data', e);
            }
            this.$nextTick(()=>{this.mode = FIND_MODE.default;});
        },
        getcats(parent){
            const opts = {
                type: "core-read",
                query: 'sin2:/v:e81bbfce-0211-4dd3-81fa-4377955db00a?filter='
            };
            if (!!parent){
                opts.query +='eq(field(".parentId"),param("' + parent.id + '", "id"))';
            } else {
                opts.query +='and(eq(field(".tenantId"),param("' + this.tenant + '", "id")),isnull(field(".parentId"))))';
            }
            opts.query += '&sort=promoKinds.sortnum,promoKinds.kindname';
            const self = this;
            const p = (resolve, reject) => {
                $http.post(opts).then((resp)=>{
                    if (!!resp.error){
                        reject(resp.error);
                    }
                    var objs = [];
                    resp.result.data.map((item)=>{
                        var o = $utils.sin2obj(resp.result.columnIndexes, item);
                        o.level = (!!parent) ? parent.level + 1 : 0;
                        o.parent = parent;
                        if (o.childcount > 0){
                            o.childs = [];
                            o.loaded = false;   //must child`s load
                        } else {
                            o.loaded = true;
                        }
                        objs.push(o);
                    });
                    if (!!parent){
                        parent.childs = objs;
                        parent.loaded = true;
                    } else {
                        self.kinds = objs;
                    }
                    resolve(objs.length);
                }).catch((err)=>{
                    console.log(err);
                    reject(err);
                });
            };
            return new Promise(p);
        },
        async oncat(cat){
            console.log('oncat', cat);
            this.activeKind = cat;
            this.find('#' + cat.id);
            this.showParams = false;
        },  //oncat
        onabc(a){
            this.abc.map((_a)=>{
                _a.active = (_a.a === a.a);
            });
            this.find(a.a);
            this.showParams = false;
        },   //onabc
        _text_find(e){
            if (e){
                e.stopPropagation();
                e.preventDefault();
            }
            
            const inp = this.$refs['sk-find-inp'];
            if (
                    ($utils.isEmpty(this.q))
                  || (this.q.length < 3)
                ){
                inp.valid = false;
                inp.error = true;
                $(inp.$el).find('input').trigger('focus');
                app.msg({text:'Для поиска введите не менее 3-х символов', color:'warning'});
                return false;
            }
            this.showParams = false;
            this.find(this.q);
            return false;
        },
        show_find_params(){
            this.showParams = (new Date()).getTime();
            this.$nextTick(()=>{
                $('.sk-find-text input').trigger('focus');
            });
        },
        async open(prod){
            this.showParams = false; 
            try {
                const res = await $http.post({
                    type: "core-read",
                    query: 'sin2:/v:286cf6de-309f-4eba-b335-25a46591463b?filter=eq(field(".nameId"),param("' + prod.id + '", "id"))'
                });
                if (!!res.error){
                    throw res.error;
                }
                prod = $utils.sin2obj(res.result.columnIndexes, res.result.data[0]);
                this.$store.commit('active/setAction', prod);
                this.$router.push({
                                name: 'order',
                                params: {store: this.parent.id, order: prod.id}
                });
            } catch(e) {
                console.log('Error:', e);
            }
        },
        back(){
            if (!!this.data){
                this.data = null;
                this.show_find_params();
            } else {
                this.$router.go(-1);
            }
        }
    },
    watch: {
        tenant(){
            this.mode = FIND_MODE.none;
            this.showParams = false;
            this.totals = null;
            this.abc = null;
            this.kinds = null;
            this.activeKind = null;
            this.data = null;
            this.q = null;
        },
        showParams(val){
            if (!!val){
                const pane = $(".sk-find-params");
                pane.css({display:''});
                pane.find('input').trigger('focus');
            }
        }
    },
    render: function(h){
        const self = this;
        const color = this.parent.brandcolor || 'orange',
              logo  = $utils.isEmpty(this.parent.brandlogo) 
                        ? undefined 
                        : process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=' + this.parent.brandlogo.ref; //TODO:
        var childs = [];
        childs.push(
                    h('v-toolbar', {
                        props: {color: color, dark: true, absolute: true, tile: true}
                    }, [
                        h('v-btn', {props: {icon: true}, on:{click: this.back}}, [
                            h('sk-svg', {props:{xref:'#ico-left', width:16, height: 16}})
                        ]),
                        h('v-toolbar-title', this.parent.title),
                        h('v-spacer'),
                        h('v-btn', {props: {icon: true}, 
                                    on: {click: this.show_find_params}
                                }, [h('sk-svg', {props:{xref:"#ico-search"}})]
                        )
                    ])
        );

        if (this.mode === FIND_MODE.loading){
            childs.push(
                h('div',{style:{"margin-top":"64px"}},[
                    [1,2,3,4,5].map(()=>{
                        return h('v-skeleton-loader', {props:{type:'list-item-avatar-three-line'}});
                    })
                ])
            );
        } else {
            if (!!this.data){
                childs.push(
                    h('v-list', {props:{dense: true}, class: {'sk-find-prods': true}}, [
                        (this.data.length > 0)
                            ? this.data.map((d)=>{
                                return h('v-list-item', {
                                        key: 'prod-' + d.id,
                                        on: {click: ()=>{this.open(d);}}
                                    }, [ 
                                        h('v-list-item-icon', {class:{'sk-prod-image': true}}, [
                                            $utils.isEmpty(d.img) 
                                                ? h('sk-svg', {props:{xref:"#ico-box-full"}, style:{color:color}})
                                                : h('v-img',  {
                                                    props:{
                                                            contain: true,
                                                            'max-height': 86,
                                                            src:process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=fs:id:' + d.img
                                                    }
                                                })
                                        ]),
                                        h('v-list-item-content', [
                                            d.name,
                                            h('div', {class:{'sk-price': true}}, [
                                                (Number(d.price)>0) ? d.price + 'р.' : '',
                                                $utils.isEmpty(d.unit) ? null : h('span', {class:{'sk-unit': true}}, ' (' + d.unit + ')')
                                            ])
                                        ]),
                                        h('v-list-item-icon', [
                                            h('sk-svg', {props:{xref:"#ico-right"}, style:{color:"#ccc"}})
                                        ])
                                ]);
                            })
                            : h('v-list-item', {key: 'prod-not-found', props: {'three-line': true}}, [ 
                                h('v-list-item-content', [
                                    h('v-list-item-subtitle', 'По Вашему запросу ничего не найдено - попробуйте изменить условия поиска.')
                                ])
                            ])
                    ])
                );
            } else {
                //TODO: no-search, no-data
            }
        }   //else loading
        
        if (this.canFind) {
            childs.push(h('v-bottom-sheet', {
                props: {value: this.showParams, width: '100%', scrollable: true},
                class: {'sk-find-bottom': true}
            }, [
                h('v-card', {
                    props: {width: '100%', 'min-height': 420},
                    class: {'sk-find-params': true}
                }, [
                    h('v-card-title', {
                        style: {"background-color": color, color: "#fff"}
                    }, ['поиск',
                        h('v-spacer'),
                        (!!this.totals) ? this.totals.dt : null
                    ]),
                    h('v-card-text', [
                        h('v-form', {
                            on: {submit: this._text_find}
                        }, [
                            h('div', {class:{'sk-find-text': true}}, [
                                h('v-text-field', {
                                    props: {
                                        label: 'наименование',
                                        rules: [
                                            value => ($utils.isEmpty(value)||(!!value && value.length > 2)) || 'не менее 3-х символов'
                                        ]
                                    }, 
                                    ref:'sk-find-inp',
                                    on: {input:(v)=>{this.q = v;}},
                                    }),
                                    h('v-btn', {
                                                    props: {tile: true, type: 'submit', color: 'grey lighten-3', elevation: 0}
                                                }, [
                                                    h('sk-svg', {props:{xref: '#ico-search', width:16, height: 16}})
                                    ])
                            ])
                        ]),
                        (!!this.abc)
                            ? [ h('v-subheader', 'по алфавиту'),
                                h('v-chip-group', {
                                    class: {'sk-abc': true}
                                }, [
                                        this.abc.map((a)=>{
                                            return h('v-chip', {
                                                key: 'search-a-' + a.a,
                                                props: {small: true, value: a.n, color: !!a.active ? color : 'default'},
                                                on: {click: ()=>{this.onabc(a);}}
                                            }, a.a);
                                        })
                                ]),
                               h('v-divider')
                            ]
                            : null,
                        (this.hasKinds)
                            ? [h('v-subheader', 'по категории'),
                               h('v-treeview', {
                                    props: {
                                        activatable: true,
                                        transition: true,
                                        "open-on-click": true,
                                        items: this.kinds,
                                        "item-children": "childs",
                                        "item-key": "id",
                                        "return-object": true,
                                        "load-children": this.getcats,
                                        "expand-icon": "fas fa-chevron-down",
                                        "item-text": "kindname",
                                        "selection-type": "independent",
                                        "value": [this.activeKind]
                                    },
                                    on: {'update:active':(actives)=>{
                                            if (actives.length>0){
                                                this.oncat(actives[0]);
                                            }
                                        }
                                    },
                                    scopedSlots: {
                                        prepend: (props)=>{
                                            if (!!props.item.kindimage){
                                                return h('v-img',{
                                                    props: {
                                                        height:'32px',
                                                        width: '32px',
                                                        src: process.env.VUE_APP_BACKEND_RPC + '/?d=file&uri=fs:id:' + props.item.kindimage
                                                    }
                                                });
                                            }
                                        }
                                    }
                            })]
                            : null
                    ])
                ])
            ]));
        } else {
            if (this.mode !== FIND_MODE.loading) {
                childs.push(h('v-alert', {
                    props: {border:'top', type: 'warning',  "colored-border": true, elevation: 2}, 
                    style:{"margin": "96px auto 0 auto", width: "95%"}
                }, [
                    'Магазин пока не предоставил номенклатуру своих товаров, попробуйте зайти позже.'
                ]));
            }
        }
        
        return h('v-sheet', {key:'search-' + this.tenant}, childs);
    }
}
</script>
<style lang="scss">
    .v-icon.v-icon.v-treeview-node__toggle{
        font-size: 12px !important;
        width: 24px;
        height: 24px;
        text-align: center;
        &::before{
            margin-top: 4px; 
        }
    }
    .v-treeview-node__label{
        font-size: 1.125rem;
    }
</style>

<style lang="scss" scoped>
    @import "@/assets/styles/index";
    
    .v-toolbar{
        width: 100%;
    }
    
    .sk-find-bottom{
        background: #fff;
    }
    
    .sk-find-params{
        & .v-card__title{
            font-weight: 400;
            font-size: 1rem;
            color: #fff;
        }
        & .sk-find-text{
            display: flex;
            align-items: center;
            justify-content: space-between;
            & button[type="submit"]{
                margin-top: -8px;
            }
        }
        & .v-subheader{
            padding: 16px 0 4px 0;
            font-style: italic;
        }
        & .v-chip-group {
            & .v-chip--active{
                color: #fff;
            }
        }
        
        & .v-treeview-node__toggle{
            &.fas{
                font-size: 0.8rem !important;
            }
        }
        & .v-treeview{
            margin: 0 -24px;
            & .v-treeview-node__prepend{
                & .v-image.v-responsive{
                    box-shadow: 0 2px 4px rgba(0,0,0,0.28);
                    border-radius: 500px;
                }
            }
        }   /*.v-treeview*/
    }       /*.sk-find-params*/
    .sk-find-info{
        padding-top: 96px;
        h2 {
            font-weight: 300;
            margin: 2rem 0 0 0;
        }
        & .v-card__title{
            flex-direction: column;
            align-content: flex-start;
            text-align: left;
            align-items: flex-start;
            font-weight: 400;
            font-size: 0.9rem;
        }
        & .v-card__text{
            display: flex;
            flex-direction: column;
            & .v-btn{
                margin-top: 1rem;
                width: 14rem;
                align-self: center;
                & svg{
                    margin-right: 1rem;
                }
            }
        }
    }
    
    .sk-find-prods{
        padding-bottom: 2rem;
        height: 100vh;
        overflow: auto;
        padding-top: 64px;
        & .v-list-item {
            border-bottom: 1px solid #ccc;
            line-height: 1.115;
            font-size: 1rem;
            & .v-list-item__icon{
                align-self: center !important;
                &.sk-prod-image{
                    width:64px;
                    height: auto;
                    max-height: 64px;
                    margin: 0.5rem 1rem 0.5rem 0 !important;
                }
            }
            & .sk-price{
                font-size: 1.25rem;
                color: $red-color;
                & .sk-unit{
                    color: $gray-color;
                    font-size: 0.85rem;
                }
            }
        }
    }
</style>

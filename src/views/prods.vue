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
         VTreeview
    } from 'vuetify/lib';
import SkSvg from '@/components/SkSvg';
    
const FIND_MODE = {
    'none':    -1,
    'default': 0,
    'abc':     1,
    'cat' :    2,
    'q':       3,
    'loading': 999
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
        }
    },
    created(){
        this.refresh();
    },  //created
    activated(){
        if (this.mode === FIND_MODE.none){
            this.refresh();
        }
    },
    deactivated(){
        this.showParams = false; //hide params-pane
        $(".sk-find-params").css({display:'none'});
    },
    methods: {
        async refresh(){
            try {
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
                /* Categories */
                this.getcats(null);
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
                console.log('ERR: load abc:', e);
            }
        },
        async find(that){
            this.loading = true;
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
                    data.push({id: a[4], name: a[6], price: a[11], img: a[5]});
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
            this.$nextTick(()=>{this.loading = false;});
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
                return false;
            }
            this.showParams = false;
            this.find(this.q);
            return false;
        },
        find_by(mode){
            this.mode = mode;
            this.showParams = (new Date()).getTime();
            if (mode === FIND_MODE.q){
                this.$nextTick(()=>{
                    $('.sk-find-text input').trigger('focus');
                });
            }
        },
        async open(prod){
            this.showParams = false; 
            try {
                const res = await $http.post({
                    type: "core-read",
                    query: 'sin2:/v:286cf6de-309f-4eba-b335-25a46591463b?filter=eq(field(".nameId"),param("' + prod.id + '", "id"))'
                });
                console.log('Open', prod, res);
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
                $(".sk-find-params").css({display:''});
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
                        h('v-btn', {props: {icon: true}, on:{click: ()=>{this.$router.go(-1);}}}, [
                            h('sk-svg', {props:{xref:'#ico-left', width:16, height: 16}})
                        ]),
                        h('v-toolbar-title', this.parent.title),
                        h('v-spacer'),
                        h('v-tooltip', {
                            props: {bottom: true},
                            scopedSlots: {
                                activator: ({on})=>{
                                        on['click'] = ()=>{this.find_by(FIND_MODE.cat);};
                                        return h('v-btn', {props: {icon: true},on: on}, [
                                                    h('sk-svg', {props:{xref:"#ico-boxes", width: 24}})
                                        ]);
                                }
                            }
                        }, [h('span', 'Поиск по категории')]),
                        h('v-tooltip', {
                            props: {left: true},
                            scopedSlots: {
                                activator: ({on})=>{
                                        on['click'] = ()=>{this.find_by(FIND_MODE.abc);};
                                        return h('v-btn', {props: {icon: true}, on: on}, 'АБВ');
                                }
                            }
                        }, [h('span', 'Поиск по алфавиту')]),
                        h('v-tooltip', {
                            props: {bottom: true},
                            scopedSlots: {
                                activator: ({on})=>{
                                        on['click'] = ()=>{this.find_by(FIND_MODE.q);};
                                        return h('v-btn', {props: {icon: true}, on: on}, [
                                                h('sk-svg', {props:{xref:"#ico-search"}})
                                        ]);
                                }
                            }
                        }, [h('span', 'Произвольный поиск')])
                    ])
        );

        if (!!this.loading){
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
                                            h('div', {class:{'sk-price': true}}, (Number(d.price)>0) ? d.price + 'р.' : '')
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
                childs.push(h('v-card', {class:{'sk-find-info': true}, props:{flat: true}}, [
                    h('v-card-title', [
                        h('div', [
                            h('v-badge', {props: {color: color, content: (!!this.totals) ? this.totals.n : ''}}, 'всего позиций')
                        ]),
                        h('div', [
                            h('v-badge', {props: {color: color, content: (!!this.totals) ? this.totals.dt: ''}}, 'информация обновлена')
                        ])
                    ]),
                    h('v-card-text', [
                        h('h2', {style: {color: color}}, 'Поиск'),
                        h('v-btn', {
                                props: {color: color, dark: true, outlined: true}, 
                                on: {click: ()=>{this.find_by(FIND_MODE.cat);}}
                            }, [
                                h('sk-svg', {props:{xref: '#ico-boxes'}}),
                                'по категории'
                        ]),
                        h('v-btn', {
                            props: {color: color, dark: true, outlined: true},
                            on: {click: ()=>{this.find_by(FIND_MODE.abc);}}
                        }, [
                            'АБВ - по алфавиту'
                        ]),
                        h('v-btn', {
                            props: {color: color, dark: true, outlined: true},
                            on: {click: ()=>{this.find_by(FIND_MODE.q);}}
                        }, [
                            h('sk-svg', {props:{xref: '#ico-search'}}),
                            'по наименованию'
                        ])
                    ])
                ]));
            }
        }   //else loading
        
        
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
                }, ['поиск ' + 
                            ( (this.mode === FIND_MODE.q) 
                                ? 'по наименованию' 
                            : (this.mode === FIND_MODE.cat)
                                ? 'по категории'
                            : (this.mode === FIND_MODE.abc)
                                ? 'по алфавиту'
                            : ''),
                    h('v-spacer'),
                    (!!this.totals) ? this.totals.dt : null
                ]),
                h('v-card-text', [
                    (this.mode === FIND_MODE.q)
                        ? h('v-form', {
                            on: {submit: this._text_find}
                        }, [
                            h('div', {class:{'sk-find-text': true}}, [
                                h('v-text-field', {props: {
                                        label: 'наименование',
                                        rules: [
                                            value => (!!value && value.length >= 3) || 'не менее 3-х символов'
                                        ]
                                    }, ref:'sk-find-inp',
                                       on: {input:(v)=>{
                                               this.q = v;
                                           }}
                                    }),
                                h('v-btn', {
                                    props: {icon: true, type: 'submit'}    //small: true, fab: true, color: color, dark: true, 
                                }, [
                                    h('sk-svg', {props:{xref: '#ico-search', width:16, height: 16}})
                                ])
                            ])
                        ])
                    : (this.mode === FIND_MODE.abc) 
                        ? h('v-chip-group', {
                            props: {column: true},
                            class: {'sk-abc': true}
                        }, [
                            (!!this.abc)
                                ? this.abc.map((a)=>{
                                    return h('v-chip', {
                                        key: 'search-a-' + a.a,
                                        props: {small: true, value: a.n, color: !!a.active ? color : 'default'},
                                        on: {click: ()=>{this.onabc(a);}}
                                    }, a.a);
                                })
                                : null
                        ]) 
                    : (this.hasKinds)
                        ?  h('v-treeview', {
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
                                class: {'d-none': (this.mode !== FIND_MODE.cat)},
                                on: {
                                    input: (item)=>{
                                        console.log('cat-input:', item);
                                    },
                                    'update:active':(actives)=>{
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
                        })
                    : null
                ])
            ])
        ]));
        
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
                    margin: 8px 0 !important;
                }
            }
            & .sk-price{
                font-size: 1.25rem;
                color: $red-color;
            }
        }
    }
</style>

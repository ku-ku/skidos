<script>
import { VBtn,
         VRow,
         VCol,
         VList, 
         VSubheader,
         VListItem,
         VListItemGroup,
         VListItemIcon,
         VListItemContent,
         VListItemTitle,
         VListItemSubtitle,
         VListItemAction,
         VProgressLinear
       } from 'vuetify/lib';
    
export default {
    name: 'SkFilials',
    props: {
        parent: {
            type: Object,
            required: true
        }
    },
    components: {
        VBtn,
        VRow,
        VCol,
        VList, 
        VSubheader,
        VListItem,
        VListItemGroup,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VProgressLinear
    },
    data(){
        return {
            loading: false,
            error:   null,
            fils:    null
        };
    },
    methods: {
        async refresh(self){
            var url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc',
                opts = {
                    type: 'core-read',
                    query: 'sin2:/v:2c697aa3-0ad1-4b0c-85ef-a3b7616167ee?filter=eq(field(".parentId"), param("' + this.parent.id + '", "id"))'
                };
            if (self){
                opts.query = 'sin2:/v:c4e208aa-a355-49bf-8c00-4175a9ed5006/?id=' + this.parent.id;
            }
            this.loading = true;
            try {
                var res = await $http.post(url, opts);
                if (!!res.error){
                    throw res.error;
                }
                if ((!!res.result.data) && (res.result.data.length>0)){
                    this.fils = res.result;
                } else if (!self) {
                    this.refresh(true);
                }
            }catch(e){
                this.error = e;
            }
            this.loading = false;
        },
        isOpen(st, end){
            const now = new Date();
            var tt;
            tt = (st.indexOf(":")<0) ? [0, 0] : st.split(":");
            var dt1 = new Date(
                    now.getFullYear(), now.getMonth(), now.getDate(), tt[0], tt[1], 0
            );
    
            tt = (end.indexOf(":")<0) ? [23, 59] : end.split(":");
            var dt2 = new Date(
                    now.getFullYear(), now.getMonth(), now.getDate(), tt[0], tt[1], 0
            );
            console.log('times:', now, dt1, dt2);
            return now.getTime() >= dt1.getTime() && now.getTime() <= dt2.getTime();
        }
    },
    created() {
        this.refresh(false);
    },
    computed: {
        hasFils(){
            return ((!!this.fils) && (!!this.fils.data) && (this.fils.data.length>0));
        }
    },
    render: function(h){
        var childs = [];
        if (this.loading){
            childs.push(h('v-list-item', {key:'sk-fils-loading'}, [
                h('v-progress-linear',{props:{indeterminate:true}})
            ]));
        } else if (!!this.error) {
            console.log(this.error);  //TODO: err
        } else if (!this.hasFils){
            childs.push( 
                h('v-list-item', {props:{key:'sk-fils-nodata'},class:{'d-none':true}})  //stub
            );
        } else {
            const ci = this.fils.columnIndexes,
                  now = new Date(); 
            this.fils.data.map( (fil) => {
                var a = fil[ci["ssctenantsadds.location"]],
                    t = fil[ci["ssctenantsadds.phone"]],
                    st= fil[ci["ssctenantsadds.starttime"]],
                    end=fil[ci["ssctenantsadds.endtime"]],
                    isOpen = true, 
                    tm = false;
                const _fil = {
                    id: fil[ci["ssctenants.id"]],
                    title: $utils.isEmpty(fil[ci["ssctenantsadds.fullname"]]) 
                                ? fil[ci["ssctenants.title"]] 
                                : fil[ci["ssctenantsadds.fullname"]]
                };
                if (!$utils.isEmpty(st)){
                    tm = st;
                    if (!$utils.isEmpty(end)){
                        tm += '-' + end;
                        isOpen = this.isOpen(st, end);
                    }
                }    
                childs.push( h('v-list-item', {props: {
                    key:'sk-fil-' + fil[ci["ssctenants.id"]]
                }}, [
                    h('v-list-item-content', [
                        h('v-row', [
                            h('v-col', {props:{cols:6}}, 
                                (!!a) 
                                    ? [
                                        h('div', {class:{'sk-city':true}}, (!!a.city)  ? a.city.name : ''),
                                        h('div', {class:{'sk-addr':true}}, ((!!a.street) ? 'ул.' + a.street.name : '') 
                                                                            + ((!!a.number) ? ', ' + a.number : ''))
                                    ] 
                                    : null),
                            h('v-col', {props:{cols:6}}, [
                                h('div', {class:{'sk-state': true, 'sk-open': isOpen}}, [
                                    h('i'),
                                    isOpen ? 'открыто' : 'закрыто',
                                    (tm) 
                                        ? h('div', {class:{'sk-time':true}}, tm) 
                                        : null
                                ])
                            ])
                        ]),
                        h('v-row', {class:{'justify-space-between': true, 'align-baseline':true}}, [
                            h('v-col', [
                                $utils.isEmpty(t) 
                                    ? null
                                    : h('a', {
                                                attrs: {href:'tel:' + t, target:'_blank'},
                                                class: {'sk-tel': true}
                                            }, [
                                        h('svg',{domProps: {innerHTML:'<use xlink:href="#ico-phone" />'}, attrs: {viewBox:'0 0 512 512'}}),
                                        t
                                    ])
                            ]),
                            h('v-col', {props: {cols:2}}, [
                                h('v-btn', {
                                                props: {icon: true}, 
                                                class: {'sk-msg': true},
                                                on: {
                                                        click: ()=>{
                                                            _fil.brand = this.parent.brand;
                                                            this.$emit('chat', _fil);
                                                        }
                                                }
                                            }, [
                                    h('svg', {domProps: {innerHTML:'<use xlink:href="#ico-chat" />'}, attrs: {viewBox:'0 0 512 512'}})
                                ])
                            ])
                        ])
                    ])
                ]));
            });
        }
        return h('v-list', {
            class: {'sk-filials': true}
        }, childs);
    }
};
</script>
<style lang="scss" scoped>
    @import "@/assets/styles/index";
    $is-open: #00796B;
    $no-open: #F44336;
    $blue-color: #01579B;
    .sk-filials{
        & .v-list-item{
            border: 1px solid lighten($gray-color, 20%);
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.18);
            & .sk-city{
                font-size: 0.85rem;
                font-weight: 300;
            }
            & .sk-addr{
                font-size: 1rem;
                font-weight: 400;
            }
            & .sk-tel{
                font-size: 0.9rem;
                color: $blue-color;
                text-decoration: none;
                font-weight: bold;
                white-space: nowrap;
                & svg{
                    width: 16px;
                    height: 16px;
                    margin-right: 0.25rem;
                }
            }
            & .sk-msg {
                & svg{
                    width: 18px;
                    height: 18px;
                    color: $blue-color;
                }
            }
        
            & .sk-state{
                text-align: right;
                color: $no-open;
                & i{
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background-color: $no-open;
                    border-radius: 50%;
                    margin: 0 0.25rem 0 0 ;
                }
                & .sk-time{color: #000;}
                &.sk-open{
                    color: $is-open;
                    & i{background-color: $is-open;}
                }
            }
        }
    }
</style>
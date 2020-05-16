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
            fills:   null,
            coords:  {
                latitude: 45.058129,
                longitude: 38.982569
            }
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
                    this.fills = res.result;
                    this.sortByDist();
                } else if (!self) {
                    this.refresh(true);
                }
            }catch(e){
                this.error = e;
            }
            this.loading = false;
        },
        isOpen(st, end){
            if ('00:00'===st){
                return true;
            }
            if ($utils.isEmpty(st)||$utils.isEmpty(end)){
                return true;
            }
            const now = new Date();
            var tt = [0, 0];
            if (st.indexOf){
                tt = (st.indexOf(":")<0) ? [0, 0] : st.split(":");
            }
            var dt1 = new Date(
                    now.getFullYear(), now.getMonth(), now.getDate(), tt[0], tt[1], 0
            );
            if (end.indexOf){
                tt = (end.indexOf(":")<0) ? [23, 59] : end.split(":");
            } else {
                tt = [23, 59];
            }
            var dt2 = new Date(
                now.getFullYear(), now.getMonth(), now.getDate() + (tt[0] < 8 ? 1 : 0), tt[0], tt[1], 0
            );
            console.log('times:', now, dt1, dt2);
            return now.getTime() >= dt1.getTime() && now.getTime() <= dt2.getTime();
        },
        dist: function(ll) {
            if ( (!this.coords) || (!ll.latitude) || (!ll.longitude) ){
                return -1;
            }
            //радиус Земли
            const R = 6372795;
            //перевод коордитат в радианы
            var lat1 = this.coords.latitude * Math.PI / 180,
                lat2 = ll.latitude * Math.PI / 180,
                long1 = this.coords.longitude * Math.PI / 180,
                long2 = ll.longitude * Math.PI / 180;
                //вычисление косинусов и синусов широт и разницы долгот
            var cl1 = Math.cos(lat1);
            var cl2 = Math.cos(lat2);
            var sl1 = Math.sin(lat1);
            var sl2 = Math.sin(lat2);
            var delta = long2 - long1;
            var cdelta = Math.cos(delta);
            var sdelta = Math.sin(delta);
            //вычисления длины большого круга
            var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
            var x = sl1 * sl2 + cl1 * cl2 * cdelta;
            var ad = Math.atan2(y, x);
            var dist = ad * R; //расстояние между двумя координатами в метрах
            return dist;
        },     //dist
        sortByDist(){
            if ((!!this.coords)&&(this.hasFils)){
                const ci = this.fills.columnIndexes;
                const distIndex = ci["ssctenantsadds.distance"];
/*                
ssctenantsadds.lat	
ssctenantsadds.lon
*/
                this.fills.data.map((f)=>{
                    var ll = {
                        latitude:  f[ci["ssctenantsadds.lat"]],
                        longitude: f[ci["ssctenantsadds.lon"]]
                    };
                    f[distIndex] = this.dist(ll);
                });
                var sorted = this.fills.data.sort((a, b)=>{
                    if (!a[distIndex]){
                        return 1;
                    } else if (!b[distIndex]){
                        return -1;
                    } 
                    return a[distIndex]<b[distIndex] ? -1 : 1;
                });
                this.fills.data = sorted;
            }
        }   //sortByDist
    },
    created() {
        if(!!navigator.geolocation){
            navigator.geolocation.getCurrentPosition((pos)=>{
                this.coords = pos.coords;
                this.sortByDist();
            }, (e)=>{
                console.log('NAVI ERR:', e);
            }, {
            }, {timeout:5000, enableHighAccuracy:true});
        }
        this.refresh(false);
    },
    computed: {
        hasFils(){
            return ((!!this.fills) && (!!this.fills.data) && (this.fills.data.length>0));
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
            const ci = this.fills.columnIndexes,
                  now = new Date(); 
            this.fills.data.map( (fil) => {
                var a = fil[ci["ssctenantsadds.location"]],
                    title=fil[ci["ssctenants.title"]],
                    t    = fil[ci["ssctenantsadds.phone"]],
                    st   = fil[ci["ssctenantsadds.starttime"]],
                    end  = fil[ci["ssctenantsadds.endtime"]],
                    bc   = fil[ci["ssctenantsadds.brandcolormain"]],
                    dist = fil[ci["ssctenantsadds.distance"]],
                    isOpen = true, 
                    tm = false;
                const _fil = {
                    id: fil[ci["ssctenants.id"]],
                    title: $utils.isEmpty(fil[ci["ssctenantsadds.fullname"]]) 
                                ? fil[ci["ssctenants.title"]] 
                                : fil[ci["ssctenantsadds.fullname"]]
                };
                if (!$utils.isEmpty(st)){
                    if ('00:00'===st){
                        tm = 'круглосуточно';
                        isOpen = true;
                    } else {
                        tm = st;
                        if (!$utils.isEmpty(end)){
                            tm += '-' + end;
                            isOpen = this.isOpen(st, end);
                        }
                    }
                }    
                childs.push( h('v-list-item', {props: {
                        key:'sk-fil-' + fil[ci["ssctenants.id"]]
                    },
                    style:{'border-color': $utils.isEmpty(bc) ? '' : bc}
                }, [
                    h('v-list-item-content', [
                        $utils.isEmpty(title) 
                            ? null
                            : h('div', {
                                            class: {'sk-title':true},
                                            style: {'border-color': $utils.isEmpty(bc) ? '' : bc}
                                }, [
                                    title,
                                    $utils.isEmpty(dist) || (dist < 0)
                                        ? null
                                        : h('span', {class:{'sk-dist': true}}, (dist < 1000) ? Math.round(dist) + 'м.' : Math.round(dist/1000) + 'км.')
                                ]),
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
                                                class: {'sk-tel': true},
                                                style: {'color': $utils.isEmpty(bc) ? '' : bc}
                                            }, t)
                            ]),
                            h('v-col', {props: {cols:2}}, [
                                h('v-btn', {
                                                props: {
                                                    icon: true,
                                                    to: {name:'chat'}
                                                }, 
                                                class: {'sk-msg': true},
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
            box-shadow: 0 2px 6px rgba(0,0,0,0.18);
            margin-bottom: 2rem;
            & .sk-title{
                font-size: 0.7rem;
                position: absolute;
                color: $gray-color;
                width: auto;
                padding: 0.25rem 0.5rem;
                border: 1px solid #ccc;
                border-radius: 9px;
                background: #fff;
                top: -12px;
                & .sk-dist{
                    display: inline-block;
                    margin-left: 0.5rem;
                }
            }
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
                    width: 14px;
                    height: 14px;
                    margin-right: 0.25rem;
                }
            }
            & .sk-msg {
                & svg{
                    width: 18px;
                    height: 18px;
                    color: $gray-color;
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
<template>
    <div class="sk-messages">
        <div class="sk-messages-conte">
            <v-list v-if="hasMessages">
                <v-list-item 
                    v-for="item in msgs.data"
                    :key="item[ci('botmsgs.id')]"
                    :data-item-id="item[ci('botmsgs.id')]"
                    >
                    <v-list-item-content>
                        <v-list-item-subtitle>
                            <div class="sk-my" 
                                 :style="{'background-color':brandColor}">
                                {{ item[ci('botmsgs.message')] }}
                                <div class="sk-dt">
                                    {{ fmt_dt(item[ci('botmsgs.regdt')]) }}
                                </div>
                            </div>
                            <div v-if="!isEmpty(item[ci('botmsgs.replmsg')])" class="sk-reply">
                                {{ item[ci('botmsgs.replmsg')] }}
                                <div class="sk-dt">
                                    {{ fmt_dt(item[ci('botmsgs.repldate')]) }}
                                </div>
                            </div>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </div>
        <v-bottom-navigation
            absolute
            height="auto"
            width="100%"
            >
            <v-textarea
                class="mx-2"
                label="написать"
                rows="2"
                v-model="s"
                :loading="sending"
                :error="sendErr"
            >
                <template v-slot:append>
                    <v-btn text class="sk-send" @click="send">
                        <svg viewBox="0 0 512 512"><use xlink:href="#ico-send-plane" /></svg>
                    </v-btn>
                </template>
            </v-textarea>
        </v-bottom-navigation>
    </div>
</template>
<script>
/*
botmsgs.id	0
botmsgs.message	5
botmsgs.regdt	6
botmsgs.repldate8
botmsgs.replmsg	7
 */    
    export default{
        name: 'SkChat',
        props: {
            store: {
               type: Object,
               required: true
            }
        },
        data(){
            return {
               s: '',
               sending: false,
               sendErr: false,
               msgs: null
            };
        },
        created(){
            $(window).resize(()=>{
                this.adjust();
            });
        },
        mounted(){
            this.load();
            this.$nextTick(()=>{
                this.adjust();
            });
        },
        computed: {
            hasMessages(){
                return (!!this.msgs) && (this.msgs.data) && (this.msgs.data.length>0);
            },
            userId(){
                return this.$store.state.profile.user.id;
            },
            brandColor(){
                return ((this.store)&&(this.store.brand)&&!$utils.isEmpty(this.store.brand.color)) 
                        ? this.store.brand.color 
                        : '';
            }
        },
        methods: {
            adjust(){
                var pane = $('.sk-messages');
                pane.find('textarea').trigger('focus');
                pane.find('.v-input__append-inner').css({'align-self': 'stretch', 'align-items': 'stretch'});
                var h1 = $(window).height(),
                    h2 = pane.offset().top,
                    h3 = pane.find('.v-bottom-navigation').height();
                pane.find('.sk-messages-conte').css({height: (h1-h2-h3) + 'px'});
            },
            ci(name){
                return (!!this.msgs) ? this.msgs.columnIndexes[name] : -1;
            },
            isEmpty(s){
                return $utils.isEmpty(s);
            },
            fmt_dt(d){
                const dt = $utils.formatDate(d, 'dd.MM.yyyy HH:mm'),
                      now= $utils.formatDate((new Date()).getTime(), 'dd.MM.yyyy HH:mm');
                if (dt.substr(0,10)===now.substr(0,10)){
                    return dt.substr(11);
                }
                return dt;
            },
            scrollLast(){
                const conte = $('.sk-messages-conte');
                conte.animate({scrollTop: conte[0].scrollHeight}, 600);
            },
            async load(id){
                const opts = {
                    type: 'core-read',
                    query: 'sin2:/v:57ebbbce-4e15-4e97-a54f-ab3d3c54969e?filter='
                },  isNew = !$utils.isEmpty(id);
                if (isNew){
                    opts.query += 'eq(field(".id"), param("' + id + '", "id"))';
                } else {
                    opts.query += 'eq(field(".userId"), param("' + this.userId + '", "id"))&sort=botmessages.redDt';
                }
                
                try {
                    var res = await $http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    if (!!this.msgs){
                        if (isNew) {
                            if ((res.result.data)&&(res.result.data.length>0)){
                                this.msgs.data.push(res.result.data[0]);
                            }
                        } else {
                            this.msgs = res.result;
                        }
                    } else {
                        this.msgs = res.result;
                    }
                    this.$nextTick(()=>{
                        this.scrollLast();
                    });
                } catch(e){
                    console.log(e);
                }
            },  //load
            async send(e){
                e.preventDefault();
                if ($utils.isEmpty(this.s)){
                    $('.sk-messages').find('textarea').trigger('focus');
                    this.sendErr = true;
                    setTimeout(()=>{this.sendErr = false;}, 2000);
                    return false;
                }
                const id = $utils.uuidv4();
                const opts = {
                    type: 'core-create',
                    query: 'sin2:/v:8db0cf44-8d7d-425d-936d-7c4f78c07554',
                        params: [
                            {id: 'id', type:'id', value: id},
                            {id: 'userID', type:'id', value: this.userId},
                            {id: 'tenantID', type:'id', value: this.store.id},
                            {id: 'regDt', type: 'dateTime', value: new Date()},
                            {id: 'Message', type: 'string', value: this.s}
                        ]
                };
                this.sending = true;
                try {
                    var res = await $http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    this.load(id);
                    this.$nextTick(()=>{this.s = '';});
                } catch(e){
                    app.msg({text:'Сообщение не отправлено, попробуйте еще раз', color:'warning'});
                }
                this.sending = false;
            }   //send
        }
    }
</script>
<style lang="scss" scoped>
    .sk-messages {
        & .v-item-group.v-bottom-navigation{
            box-shadow: none !important;
            & .sk-send{
                width: 48px;
                min-width: 48px;
                max-width: 48px;
                padding: 0 !important;
                margin:  0 !important;
                & svg{
                    width: 18px;
                    height: 18px;
                }
            }
        }
        & .v-text-field .v-input__append-inner{
                margin: 0 !important;
                padding:0 !important;
                align-self: stretch;
                align-items: stretch;
        }
        & .sk-messages-conte{
            overflow: auto;
        }
        & .v-list-item{
            & .sk-my, & .sk-reply{
                padding: 0.75rem;
                white-space: normal;
                height: auto;
                min-height: 1.5rem;
                & .sk-dt{
                    font-size: 0.6rem;
                    opacity: 0.7;
                    text-align: right;
                }
            }
            & .sk-my{
                background-color: #5676ee;
                margin: 0 0 8px 15%;
                color: #fff;
                border-radius: 6px 6px 0 6px;
                box-shadow: -2px 2px 4px rgba(0,0,0,0.18);
            }
            & .sk-reply{
                background-color: lighten(#d7d9dc, 10%);
                margin: 0 15% 8px 0;
                color: #000;
                border-radius: 6px 6px 6px 0;
                border: 1px solid #d7d9dc;
                box-shadow: 2px 2px 4px rgba(0,0,0,0.18);
            }
        }
    }
</style>
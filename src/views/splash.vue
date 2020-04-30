<script>
require('@/assets/imgs/my-logo.png');

export default {
    name: 'Splash',
    data: function(){
        return {
            kuku: true
        };
    },
    computed: {
        hasUser(){
           return !$utils.isEmpty(this.name);
        },
        name(){
            return (this.$store.state.profile.user)
                ? this.$store.state.profile.user.name
                : '';
        },
        tod(){
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
        }
    },
    methods: {
        hide(){
            $('.sk-splash').fadeOut(600, ()=>{
                this.$emit('hide');
            });
        }
    },
    render(h){
        return h('div', {class:'sk-splash'}, [
            h('div', [
                h('h1', [
                    this.tod,
                    this.hasUser ? ', ' : '',
                    this.hasUser ? h('strong', this.name) : null
                ]),
                h('img', {attrs: {src: require('@/assets/imgs/my-logo.png')}, class:{'sk-logo':true}})
            ]),
            h('h3', 'моикарты.рф')
        ]);
    }
}
</script>
<style lang="scss" scoped>
    .sk-splash {
        position:absolute; 
        width: 100%; 
        height:100%; 
        top:0; 
        left:0; 
        z-index:10000; 
        background-color:white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: center;
        margin: 0;
        padding:0;
        background: rgb(245,157,14); /* Old browsers */
        background: -moz-linear-gradient(top,  rgba(245,157,14,1) 0%, rgba(255,163,14,1) 100%); /* FF3.6-15 */
        background: -webkit-linear-gradient(top,  rgba(245,157,14,1) 0%,rgba(255,163,14,1) 100%); /* Chrome10-25,Safari5.1-6 */
        background: linear-gradient(to bottom,  rgba(245,157,14,1) 0%,rgba(255,163,14,1) 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f59d0e', endColorstr='#ffa30e',GradientType=0 ); /* IE6-9 */
        & > div{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-self: stretch;
            justify-content: center;
            height: calc(100% - 110px);
            
        }
        & h1{
            color: #fff;
            font-weight: 300;
            & strong{
                display: block;
                font-weight: 400;
            }
        }
        & .sk-logo{
            width: 128px;
            height: 128px;
        }
        & h3{
            font-weight: 300;
            padding: 1rem 0;
            color: #fff;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.22)
        }
    }
</style>

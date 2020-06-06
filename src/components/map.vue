<template>
    <div class="sk-map fill-height" id="sk-map"></div>
</template>
<script>
    /* global mapboxgl*/
    //import MapBoxGL from 'mapbox-gl';
    import {eventBus} from '@/main';
    const pointImage = new Image();
    pointImage.src = require('@/assets/imgs/map-marker.png');
    const pointImageBlue = new Image();
    pointImageBlue.src = require('@/assets/imgs/map-marker-blue.png');
    var map = null;
    
    export default {
        name: 'SkMap',
        props: {
            center: {
                type: Object,   /*shop object*/
                required: true
            }
        },
        data(){
            return {};
        },
        created(){
            eventBus.$on('resize', ()=>{
                if (!!map){
                    map.resize();
                }
            });
        },
        mounted(){
            this.$nextTick(()=>{
                this.mapInit();
            });
        },
        beforeDestroy(){
            if (!!map){
                map.remove();
                map = null;
            }
        },
        watch: {
            center(o){
                this.toCenter(o);
            }   //center
        },
        methods: {
            toCenter(o){
                if ((!!map)&&(!!o.lon)&&(!!o.lat)){
                    const coords = [o.lon, o.lat];
                    map.setCenter(coords);
                    var src = map.getSource('points');
                    if (!!src){
                        src.setData({type: 'FeatureCollection',
                                     features: [{
                                                    type: 'Feature', 
                                                    geometry: {'type': 'Point','coordinates': coords},
                                                    properties: {
                                                        n: 0,
                                                        id: o.id,
                                                        shop: o
                                                    }
                                                }]
                        });
                    }
                }
            },
            mapInit(){
                const self = this,
                      coords = ((!!this.center) && (!!this.center.lon) && (!!this.center.lat))
                                ? [this.center.lon, this.center.lat]
                                : [this.$store.state.geo.ll.lon, this.$store.state.geo.ll.lat];
                mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbGl4IiwiYSI6ImNrYXRoNWc3MjB0ZnkzN29jcHkydjd1NmUifQ.5y-ik3c3U5eGPV_mW7zxaw';
                map = new mapboxgl.Map({
                    container: $(self.$el).get(0),
                    style: 'mapbox://styles/thelix/ckathyj992krv1ins0b3ucdrm',
                    center: coords,
                    zoom: 14,
                    maxZoom: 16,
                    pitchWithRotate: false,
                    antialias: true
                });
                $('.mapboxgl-ctrl-bottom-left').css({display:'none'});
                map.on('load', function(){
                    console.log('MAP LOADED!', map);
                    var nav = new mapboxgl.NavigationControl({showCompass:false,showZoom:true,visualizePitch:false});
                    map.addControl(nav, 'top-right');
                    map.addImage('store-point', pointImage);
                    map.addImage('store-point-blue', pointImageBlue);
                    map.addSource('points', {
                            'type': 'geojson',
                            'data': {
                                'type': 'FeatureCollection',
                                'features': []
                    }});    //map.addSource('point'...
                    map.addLayer({
                            'id': 'center',
                            'type': 'symbol',
                            'source': 'points',
                            'layout': {
                                'icon-image': 'store-point',
                                'icon-size': 0.15,
                                'icon-anchor': 'bottom',
                                'icon-allow-overlap': true
                            },
                            'filter': ['==', ['number', ['get', 'n']], 0]
                    });
                    map.addLayer({
                            'id': 'others',
                            'type': 'symbol',
                            'source': 'points',
                            'layout': {
                                'icon-image': 'store-point-blue',
                                'icon-size': 0.15,
                                'icon-anchor': 'bottom',
                                'icon-allow-overlap': true
                            },
                            'filter': ['>', ['number', ['get', 'n']], 0]
                    });
                    map.on('click', 'center', function(e) {
                        self.$emit('click', e.features[0].properties.shop);
                    });
                    map.on('click', 'others', function(e) {
                        self.$emit('click', e.features[0].properties.shop);
                    });
                    if (!!this.center){
                        self.toCenter(this.center);
                    }
                }); //map.on('load'...
            },
            addPoints(points){
                if (!((!!points)&&(points.length>0))){
                    return;
                }
                var n = 0,
                    _set_points = function(){
                        var features = [],
                            src =  map.getSource('points'),
                            bounds = null;

                        points.map((p, i)=>{
                            if (!((!!p.lat)&&(!!p.lon))){
                                return;
                            }
                            features.push({
                                            type: 'Feature',
                                            properties: {
                                                n: i,
                                                id: p.id,
                                                shop: p
                                            },
                                            geometry: {
                                                 type: 'Point',
                                                 coordinates: [p.lon, p.lat]
                                           }
                                       });
                            if (!!bounds){
                                if (p.distance < 5000.0){
                                    bounds.extend([p.lon, p.lat]);
                                }
                            } else {
                                bounds = new mapboxgl.LngLatBounds(
                                    [p.lon, p.lat],
                                    [p.lon, p.lat]
                                );
                            }
                        });
                        src.setData({
                                'type': 'FeatureCollection',
                                'features': features
                        });
                        if (features.length > 0){
                            map.setCenter(features[0].geometry.coordinates);
                            if (bounds){
                                map.fitBounds(bounds, {padding: 50});
                            }
                        }
                };  //_set_points
                var _watch = function(){
                    n++;
                    if (n > 100){
                        return;
                    }
                    if ((!!map)&&(!!map.getSource('points'))){
                        _set_points();
                    } else {
                        setTimeout(_watch, 200);
                    }
                };  //_watch
                _watch();
            }
        }   //methods
    }
</script>

<style lang="scss" scoped>
    .sk-map{
        width: 100%;
        min-height: 280px;
        background: #ece1cb;
    }
</style>
    
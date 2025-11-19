<template>
    <div class="m-[20px]">
        <span>地图切换:</span>
        <el-select 
            v-model="selectedMapId" 
            @change="handleMapChange"
            style="width: 200px; margin-left: 10px;"
            placeholder="请选择地图"
        >
            <el-option
                v-for="item in MapList"
                :key="item.id"
                :label="item.title"
                :value="item.id"
            />
        </el-select>
    </div>
    <div id="map" ref="mapRef" class="ml-[20px]"></div>
</template>

<script setup lang="ts">
import { Map, TileLayer, type TileLayerOptions } from 'maptalks'
import { onMounted, ref } from 'vue';
defineOptions({
    name: 'MaptalksDemo'
});

const mapRef = ref<HTMLDivElement | null>(null);
let mapInfo: Map | null = null;

type MapListType = {
    title: string,
    id: string,
    config: TileLayerOptions
};

const MapList: MapListType[] = [
    {
        title: "百度地图",
        id: "baidubase",
        config: {
            urlTemplate:
              "http://online{s}.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=1",
            subdomains: [0, 1, 2, 3],
            minZoom: 1,
            maxZoom: 19,
            spatialReference: {
              projection: "BAIDU"
            },
            tileRetryCount: 3,
            renderer: "canvas"
        }
    },
    {
        title: "高德地图",
        id: "gaodebase",
        config: {
            urlTemplate:
              "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
            subdomains: [0, 1, 2, 3],
            minZoom: 1,
            maxZoom: 19,
            tileRetryCount: 3,
            renderer: "canvas"
        }
    },
]

const selectedMapId = ref<string>('baidubase');

// 初始化地图
const initMap = (mapId: string) => {
    if (!mapRef.value) return;
    
    // 如果地图已存在，先销毁
    if (mapInfo) {
        mapInfo.remove();
        mapInfo = null;
    }
    
    // 找到选中的地图配置
    const selectedMap = MapList.find(item => item.id === mapId);
    if (!selectedMap) return;
    
    // 创建新的地图实例
    mapInfo = new Map(mapRef.value, {
        center: [116.397428, 39.90923],
        zoom: 12,
        baseLayer: new TileLayer(selectedMap.id, selectedMap.config),
    });
    
    console.log('mapInfo', mapInfo);
};

// 处理地图切换
const handleMapChange = (mapId: string) => {
    initMap(mapId);
};

onMounted(() => {
    // 初始化默认地图
    initMap(selectedMapId.value);
});
</script>

<style scoped>
#map{
    width:60vw;
    height:60vh;
}
</style>
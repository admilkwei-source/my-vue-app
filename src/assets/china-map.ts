/**
 * 中国地图 GeoJSON 数据
 * 
 * 数据来源：阿里云 DataV GeoAtlas
 * URL: https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
 * 
 * 说明：
 * 1. 完整的中国地图数据，包含所有省份的详细轮廓
 * 2. 已下载到本地，避免网络请求和 JSON 解析阻塞主线程
 * 3. 使用 Vite 的 JSON 导入功能，编译时处理，不会阻塞运行时
 */

// 导入完整的地图数据（Vite 会在编译时处理）
import chinaMapFullData from './china-map-full.json';

// 导出供 ECharts 使用
export const chinaMapData = chinaMapFullData;


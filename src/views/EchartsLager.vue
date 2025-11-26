<template>
    <div class="dashboard-wrapper">
        <!-- 静态背景效果 -->
        <div class="bg-animation">
            <div class="bg-grid"></div>
        </div>

        <div class="dashboard-container" ref="dashboardRef">
            <!-- 头部标题 -->
            <div class="dashboard-header">
                <div class="header-decoration left">
                    <div class="deco-line"></div>
                    <div class="deco-corner"></div>
                </div>
                <h1 class="dashboard-title">
                    <span class="title-glow">智慧社区内网比对平台</span>
                </h1>
                <div class="header-decoration right">
                    <div class="deco-corner"></div>
                    <div class="deco-line"></div>
                </div>
            </div>

            <!-- 主体内容 -->
            <div class="dashboard-content">
                <!-- 左侧区域 -->
                <div class="left-panel">
                    <!-- 当前比对数据 -->
                    <div class="panel-card card-highlight">
                        <div class="card-corner tl"></div>
                        <div class="card-corner tr"></div>
                        <div class="card-corner bl"></div>
                        <div class="card-corner br"></div>
                        <div class="card-title">
                            <span class="title-icon">📊</span>
                            当前比对数据
                        </div>
                        <div class="big-number">{{ totalData.toLocaleString() }}</div>
                        <div class="data-time">{{ currentTime }}</div>
                    </div>

                    <!-- 居住对照人员分析 -->
                    <div class="panel-card">
                        <div class="card-corner tl"></div>
                        <div class="card-corner tr"></div>
                        <div class="card-corner bl"></div>
                        <div class="card-corner br"></div>
                        <div class="card-title">
                            <span class="title-icon">👥</span>
                            居住对照人员分析
                        </div>
                        <div ref="pieChart1" class="chart-container" style="height: 250px;"></div>
                    </div>

                    <!-- 人口出入记录统计 -->
                    <div class="panel-card">
                        <div class="card-corner tl"></div>
                        <div class="card-corner tr"></div>
                        <div class="card-corner bl"></div>
                        <div class="card-corner br"></div>
                        <div class="card-title">
                            <span class="title-icon">📈</span>
                            人口出入记录统计（五十万条数据）
                        </div>
                        <div ref="recordChart" class="chart-container" style="height: 250px;"></div>
                    </div>
                </div>

                <!-- 中间区域 -->
                <div class="center-panel">
                    <!-- 天气信息 -->
                    <div class="weather-info">
                        <div class="weather-icon">☀️</div>
                        <div class="weather-text">
                            <div class="weather-temp">晴天 16-22℃</div>
                            <div class="weather-location">天津市和平区</div>
                        </div>
                    </div>

                    <!-- 地图区域 -->
                    <div class="map-container">
                        <div class="map-border-decoration"></div>
                        <div ref="mapChart" class="chart-container" style="height: 100%;"></div>
                    </div>

                    <!-- 统计信息 -->
                    <div class="stats-info">
                        <div class="stat-item">
                            <div class="stat-icon">🏢</div>
                            <div class="stat-content">
                                <div class="stat-label">NO.1楼层</div>
                                <div class="stat-value">2543289人</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">🌤️</div>
                            <div class="stat-content">
                                <div class="stat-label">NO.3天气</div>
                                <div class="stat-value">5690人</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">🔬</div>
                            <div class="stat-content">
                                <div class="stat-label">NO.1测试</div>
                                <div class="stat-value">456人</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧区域 -->
                <div class="right-panel">
                    <!-- 社区犯罪人员年龄分布 -->
                    <div class="panel-card">
                        <div class="card-corner tl"></div>
                        <div class="card-corner tr"></div>
                        <div class="card-corner bl"></div>
                        <div class="card-corner br"></div>
                        <div class="card-title">
                            <span class="title-icon">📉</span>
                            社区犯罪人员年龄趋势（十万数据点）
                        </div>
                        <div ref="pieChart2" class="chart-container" style="height: 350px;"></div>
                    </div>

                    <!-- 社区犯罪人员地区分布 -->
                    <!-- <div class="panel-card">
                        <div class="card-title">社区犯罪人员地区分布</div>
                        <div ref="barChart" class="chart-container" style="height: 220px;"></div>
                    </div> -->

                    <!-- 人口出入时间段统计（一个月数据） -->
                    <div class="panel-card">
                        <div class="card-corner tl"></div>
                        <div class="card-corner tr"></div>
                        <div class="card-corner bl"></div>
                        <div class="card-corner br"></div>
                        <div class="card-title">
                            <span class="title-icon">⏱️</span>
                            人口出入时间段统计（近30年）
                        </div>
                        <div ref="lineChart" class="chart-container" style="height: 350px;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { chinaMapData } from '@/assets/china-map';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

/**
 * ======== ECharts 大数据场景模拟策略 ========
 * 
 * 🚫 错误方式：解析50万条JSON
 *    - 问题：response.json() 会阻塞主线程300ms+
 *    - 原因：JSON解析是同步操作，CPU密集型
 * 
 * ✅ 正确方式：
 * 
 * 1. 【聚合数据模拟】（当前使用）
 *    - 适用：柱状图、饼图等统计图表
 *    - 原理：直接生成聚合后的统计数据，模拟从50万条聚合而来
 *    - 性能：<1ms，无主线程阻塞
 *    - 场景：人员分布、时间段统计等
 * 
 * 2. 【大量数据点渲染】（配合 ECharts 采样）
 *    - 适用：折线图、散点图
 *    - 原理：生成10万+数据点，使用 ECharts 采样算法渲染
 *    - 性能：依赖 ECharts 的 sampling: 'lttb' 等优化
 *    - 场景：时序数据、轨迹图等
 * 
 * 3. 【渐进式加载】
 *    - 适用：实时大屏、监控系统
 *    - 原理：分批次加载数据，每次加载一部分
 *    - 性能：分散计算，避免长任务
 *    - 场景：实时数据流、历史数据回放
 * 
 * 4. 【虚拟滚动/分页】
 *    - 适用：表格、列表
 *    - 原理：只渲染可见区域的数据
 *    - 性能：恒定的渲染数量
 *    - 场景：数据表格、详情列表
 */

// 大数字统计
const totalData = ref(3456789);
const currentTime = ref('');

// 图表引用
const pieChart1 = ref<HTMLElement | null>(null);
const pieChart2 = ref<HTMLElement | null>(null);
// const barChart = ref<HTMLElement | null>(null);
const lineChart = ref<HTMLElement | null>(null);
const mapChart = ref<HTMLElement | null>(null);
const recordChart = ref<HTMLElement | null>(null);

// 大屏容器引用
const dashboardRef = ref<HTMLElement | null>(null);

// 图表实例
let chart1: any = null;
let chart2: any = null;
let chart3: any = null;
let chart4: any = null;
let chart5: any = null;
let chart6: any = null; // 人口出入记录统计

// 设计稿尺寸
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

// 更新时间
const updateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    currentTime.value = `${year}/${month}/${day} ${hour}:${minute}:${second}`;
};

// 初始化饼图1 - 居住对照人员分析
const initPieChart1 = () => {
    if (pieChart1.value) {
        chart1 = echarts.init(pieChart1.value);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)',
            },
            legend: {
                orient: 'vertical',
                right: '5%',
                top: 'center',
                textStyle: {
                    color: '#fff',
                    fontSize: 12,
                },
            },
            series: [
                {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['35%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    data: [
                        { value: 5234, name: '流动驱赶', itemStyle: { color: '#ef4444' } },
                        { value: 3421, name: '经侦驱赶', itemStyle: { color: '#3b82f6' } },
                        { value: 2567, name: '黑名人口', itemStyle: { color: '#6b7280' } },
                        { value: 4532, name: '刑侦类点', itemStyle: { color: '#f59e0b' } },
                        { value: 8954, name: '吸食人口', itemStyle: { color: '#eab308' } },
                    ],
                },
            ],
        };
        chart1.setOption(option);
    }
};

// 初始化折线图 - 年龄趋势（十万数据点）
let isLoadPieChart2 = false;
let timeLabels_PieChart2Data: string[] = [];
let ageValues_PieChart2Data: number[] = [];
const renderPieChart2Data = () => {
    if(!isLoadPieChart2){
        // 生成十万个数据点
        const dataCount = 100000;
        timeLabels_PieChart2Data = [];
        ageValues_PieChart2Data = [];
        
        // 模拟时间序列：每个数据点代表一条记录的序号
        // 年龄值在 18-70 之间波动，模拟犯罪人员年龄趋势
        let baseAge = 35; // 基础年龄
        
        for (let i = 0; i < dataCount; i++) {
            
            timeLabels_PieChart2Data.push(`${(i / 1000).toFixed(0)}k`);
            
            // 模拟年龄数据：基础值 + 周期波动 + 随机噪声
            const wave = Math.sin(i / 5000) * 10; // 长周期波动
            const seasonalWave = Math.sin(i / 1000) * 5; // 短周期波动
            const noise = (Math.random() - 0.5) * 15; // 随机噪声
            
            // 模拟趋势：随着时间推移，平均年龄略有上升
            const trend = (i / dataCount) * 5;
            
            let age = baseAge + wave + seasonalWave + noise + trend;
            
            // 限制年龄范围在 18-70 之间
            age = Math.max(18, Math.min(70, age));
            
            ageValues_PieChart2Data.push(Math.round(age));
        }
        isLoadPieChart2 = true;
    }
    return { timeLabels: timeLabels_PieChart2Data as string[], ageValues: ageValues_PieChart2Data as number[] };
}
const initPieChart2 = () => {
    if (pieChart2.value) {
        chart2 = echarts.init(pieChart2.value);
        renderPieChart2Data();
        const { timeLabels, ageValues } = renderPieChart2Data();
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const index = params[0].dataIndex;
                    return `记录 #${index.toLocaleString()}<br/>年龄: ${params[0].value} 岁`;
                },
            },
            grid: {
                left: '8%',
                right: '5%',
                bottom: '25%',
                top: '10%',
            },
            xAxis: {
                type: 'category',
                data: timeLabels,
                axisLabel: {
                    color: '#fff',
                    fontSize: 10,
                },
                axisLine: {
                    lineStyle: {
                        color: '#1e3a8a',
                    },
                },
            },
            yAxis: {
                type: 'value',
                name: '年龄',
                nameTextStyle: {
                    color: '#fff',
                    fontSize: 11,
                },
                axisLabel: {
                    color: '#fff',
                    fontSize: 10,
                    formatter: '{value} 岁',
                },
                splitLine: {
                    lineStyle: {
                        color: '#1e3a8a',
                        type: 'dashed',
                    },
                },
                min: 15,
                max: 75,
            },
            // 性能优化 - 数据缩放，允许用户浏览十万数据点
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 5, // 默认只显示 5% 的数据
                },
                {
                    start: 0,
                    end: 5,
                    height: 20,
                    bottom: 10,
                    textStyle: {
                        color: '#fff',
                        fontSize: 10,
                    },
                    borderColor: '#1e3a8a',
                    fillerColor: 'rgba(59, 130, 246, 0.3)',
                    handleStyle: {
                        color: '#3b82f6',
                    },
                },
            ],
            series: [
                {
                    name: '年龄',
                    data: ageValues,
                    type: 'line',
                    smooth: false, // 数据量大时，不使用平滑曲线
                    // sampling: 'lttb', // 使用 LTTB 采样算法，保证流畅性（性能优化）
                    large: true, // 开启大数据量优化（性能优化）
                    largeThreshold: 2000, // 数据量超过 2000 时启用大数据优化
                    showSymbol: false, // 数据点太多，不显示标记（性能优化）
                    lineStyle: {
                        color: '#ef4444',
                        width: 1.5,
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(239, 68, 68, 0.4)' },
                            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' },
                        ]),
                    },
                    itemStyle: {
                        color: '#ef4444',
                    },
                },
            ],
            // 适度的动画效果
            animation: true,
            animationDuration: 800,
            animationEasing: 'cubicOut',
        };
        
        chart2.setOption(option);
    }
};

// 初始化柱状图 - 地区分布
// const initBarChart = () => {
//     if (barChart.value) {
//         chart3 = echarts.init(barChart.value);
//         const option = {
//             backgroundColor: 'transparent',
//             tooltip: {
//                 trigger: 'axis',
//                 axisPointer: {
//                     type: 'shadow',
//                 },
//             },
//             grid: {
//                 left: '10%',
//                 right: '5%',
//                 bottom: '15%',
//                 top: '10%',
//             },
//             xAxis: {
//                 type: 'category',
//                 data: ['河北', '天津', '北京', '新疆', '内蒙', '宁夏', '河南'],
//                 axisLabel: {
//                     color: '#fff',
//                     fontSize: 11,
//                 },
//                 axisLine: {
//                     lineStyle: {
//                         color: '#1e3a8a',
//                     },
//                 },
//             },
//             yAxis: {
//                 type: 'value',
//                 axisLabel: {
//                     color: '#fff',
//                     fontSize: 11,
//                 },
//                 splitLine: {
//                     lineStyle: {
//                         color: '#1e3a8a',
//                         type: 'dashed',
//                     },
//                 },
//             },
//             series: [
//                 {
//                     data: [234, 187, 345, 378, 345, 267, 198],
//                     type: 'bar',
//                     barWidth: '50%',
//                     itemStyle: {
//                         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                             { offset: 0, color: '#fbbf24' },
//                             { offset: 1, color: '#f59e0b' },
//                         ]),
//                     },
//                 },
//             ],
//         };
//         chart3.setOption(option);
//     }
// };

const getExactYearDates = (prevYear: number = 1) => {
  const dates: string[] = [];
  const today = dayjs();
  const oneYearAgo = today.subtract(prevYear, 'year');
  
  // 计算两个日期之间的天数差
  let currentDate = oneYearAgo;
  const endDate = today;
  
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'day');
  }
  
  return dates;
}

// 初始化折线图 - 时间段统计（模拟一个月数据）
let isLoadLineChart = false;
let timeLabels_LineChartData: string[] = [];
let values_LineChartData: number[] = [];
const renderLineChartData = () => {
    if(!isLoadLineChart){
        // 生成一年前的日期数据，365&366天
        timeLabels_LineChartData = getExactYearDates(30);
        // 生成30天，每小时一个数据点
        for (let day = 0; day < timeLabels_LineChartData.length; day++) {
            // 模拟真实的出入规律
            let baseCount = Math.floor(Math.random() * 2000); // 基础人流（每小时）

            baseCount += Math.floor(Math.random() * 100000);
                
            values_LineChartData.push(Math.floor(baseCount));
        }
        isLoadLineChart = true;
    }
    return { timeLabels: timeLabels_LineChartData as string[], values: values_LineChartData as number[] };
}
const initLineChart = () => {
    if (lineChart.value) {
        chart4 = echarts.init(lineChart.value);
        const { timeLabels, values } = renderLineChartData();

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                // formatter: (params: any) => {
                //     const dataIndex = params[0].dataIndex;
                //     const day = Math.floor(dataIndex / 24) + 1;
                //     const hour = dataIndex % 24;
                //     return `第${day}天 ${hour}:00<br/>出入人数: ${params[0].value}`;
                // },
            },
            grid: {
                left: '8%',
                right: '5%',
                bottom: '25%',
                top: '10%',
            },
            xAxis: {
                type: 'category',
                data: timeLabels,
                axisLabel: {
                    color: '#fff',
                    fontSize: 10,
                    interval: 'auto', // 自动间隔，避免标签重叠
                },
                axisLine: {
                    lineStyle: {
                        color: '#1e3a8a',
                    },
                },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#fff',
                    fontSize: 11,
                    formatter: (value: number) => {
                        if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'k';
                        }
                        return value.toString();
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: '#1e3a8a',
                        type: 'dashed',
                    },
                },
            },
            // 性能优化
            dataZoom: [
                {
                type: 'inside',
                start: 0,
                end: 10
                },
                {
                start: 0,
                end: 10
                }
            ],
            series: [
                {
                    data: values,
                    type: 'line',
                    smooth: true,
                    sampling: 'lttb', // 使用采样优化，保证流畅性(性能优化)
                    large: true, // 大数据量时，开启大图表优化(性能优化)
                    showSymbol: false, // 数据点太多，不显示标记（性能优化）
                    lineStyle: {
                        color: '#eab308',
                        width: 2,
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(234, 179, 8, 0.5)' },
                            { offset: 1, color: 'rgba(234, 179, 8, 0.1)' },
                        ]),
                    },
                    itemStyle: {
                        color: '#eab308',
                    },
                },
            ],
            // 适度的动画效果
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
        };
        
        chart4.setOption(option);
    }
};

// 初始化中国地图
const initMapChart = () => {
    if (mapChart.value) {
        chart5 = echarts.init(mapChart.value);

        // 【优化】直接使用地图数据文件，避免网络请求和 JSON 解析阻塞
        // 原方案：从 CDN 加载完整地图数据
        // 问题：1) 网络延迟  2) response.json() 阻塞主线程  3) 依赖外部服务
        // 优化方案：从单独的文件导入地图数据
        // 文件位置：src/assets/china-map.ts
        // 如需更完整的地图数据，请替换该文件中的 GeoJSON 数据
        
        // 注册地图数据（已从文件导入）
        echarts.registerMap('china', chinaMapData as any);

        // 配置地图选项
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}人',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: '#3b82f6',
                textStyle: {
                    color: '#fff',
                },
            },
            geo: {
                map: 'china',
                roam: false,
                zoom: 1.2,
                center: [105, 36],
                itemStyle: {
                    areaColor: '#1e3a8a',
                    borderColor: '#3b82f6',
                    borderWidth: 1.5,
                },
                emphasis: {
                    itemStyle: {
                        areaColor: '#2563eb',
                    },
                },
                label: {
                    show: false,
                },
            },
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: [
                        { name: '北京', value: [116.4074, 39.9042, 2340] },
                        { name: '天津', value: [117.2008, 39.0842, 1890] },
                        { name: '河北', value: [114.5149, 38.0428, 3421] },
                        { name: '山西', value: [112.5489, 37.8706, 1234] },
                        { name: '内蒙古', value: [111.6708, 40.8183, 892] },
                        { name: '辽宁', value: [123.4328, 41.8057, 1567] },
                        { name: '上海', value: [121.4737, 31.2304, 2890] },
                        { name: '江苏', value: [118.7969, 32.0603, 2456] },
                        { name: '浙江', value: [120.1536, 30.2875, 2123] },
                        { name: '广东', value: [113.2644, 23.1291, 3456] },
                    ],
                    symbolSize: (val: number[]) => {
                        return Math.max(Math.sqrt(val[2] || 0) / 3, 8);
                    },
                    itemStyle: {
                        color: '#fbbf24',
                        shadowBlur: 10,
                        shadowColor: 'rgba(251, 191, 36, 0.8)',
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: '{b}',
                            position: 'top',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                        },
                        itemStyle: {
                            color: '#f59e0b',
                            shadowBlur: 15,
                        },
                    },
                },
                {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: [
                        { name: '北京', value: [116.4074, 39.9042, 2340] },
                        { name: '广东', value: [113.2644, 23.1291, 3456] },
                    ],
                    symbolSize: (val: number[]) => {
                        return Math.max(Math.sqrt(val[2] || 0) / 3, 8);
                    },
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke',
                        scale: 3,
                        period: 4,
                    },
                    label: {
                        show: false,
                    },
                    itemStyle: {
                        color: '#ef4444',
                        shadowBlur: 10,
                        shadowColor: 'rgba(239, 68, 68, 0.8)',
                    },
                    zlevel: 1,
                },
            ],
        };

        chart5.setOption(option);
    }
};

// 初始化人口出入记录统计图表（五十万条数据）
const initRecordChart = async () => {
    if (recordChart.value) {
        chart6 = echarts.init(recordChart.value);

        // 【优化】模拟50万条数据 - 前端直接生成聚合数据，而不是解析巨大JSON
        
        // 模拟统计结果（假设已经从50万条原始数据聚合而来）
        const methods = ['刷卡', '人脸识别', '指纹', '访客登记', '密码'];
        const roles = ['业主', '访客', '出租'];
        
        // 直接生成聚合后的统计数据（模拟50万条数据的统计结果）
        const stats: { [key: string]: { [key: string]: number } } = {};
        methods.forEach(method => {
            stats[method] = {};
            const methodStats = stats[method];
            roles.forEach(role => {
                // 模拟真实的分布：业主最多，访客次之，出租较少
                const baseCount = Math.floor(Math.random() * 500000) + 200000;
                const multiplier = role === '业主' ? 1.5 : role === '访客' ? 1 : 0.5;
                methodStats[role] = Math.floor(baseCount * multiplier);
            });
        });

        // 准备系列数据 - 增加渐变色等复杂样式
        const series = roles.map((role, index) => ({
            name: role,
            type: 'bar',
            stack: 'total',
            large: false,
            sampling: 'none', // 禁用采样，强制渲染所有数据点
            data: methods.map(method => (stats[method] && stats[method][role]) || 0),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { 
                        offset: 0, 
                        color: role === '业主' ? '#60a5fa' : role === '访客' ? '#34d399' : '#fbbf24'
                    },
                    { 
                        offset: 1, 
                        color: role === '业主' ? '#3b82f6' : role === '访客' ? '#10b981' : '#f59e0b'
                    },
                ]),
            },
            // 添加标签显示（增加渲染负担）
            label: {
                show: false, // 可以改为 true 来进一步增加负担
                position: 'inside',
                color: '#fff',
                fontSize: 10,
            },
            // 增加阴影效果
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
            },
        }));

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: (params: any) => {
                    // 添加复杂的tooltip计算
                    let result = params[0].axisValue + '<br/>';
                    let total = 0;
                    params.forEach((item: any) => {
                        total += item.value;
                        result += `${item.marker}${item.seriesName}: ${item.value}<br/>`;
                    });
                    result += `总计: ${total}`;
                    return result;
                },
            },
            legend: {
                data: roles,
                top: '5%',
                textStyle: {
                    color: '#fff',
                    fontSize: 11,
                },
            },
            grid: {
                left: '10%',
                right: '5%',
                bottom: '15%',
                top: '25%',
            },
            xAxis: {
                type: 'category',
                data: methods,
                axisLabel: {
                    color: '#fff',
                    fontSize: 12,
                },
                axisLine: {
                    lineStyle: {
                        color: '#1e3a8a',
                    },
                },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#fff',
                    fontSize: 11,
                },
                splitLine: {
                    lineStyle: {
                        color: '#1e3a8a',
                        type: 'dashed',
                    },
                },
            },
            series: series,
            // 增加动画效果
            animation: true,
            animationDuration: 2000,
            animationEasing: 'elasticOut',
            animationDelay: (idx: number) => idx * 50, // 每个柱子延迟动画
        };
        chart6.setOption(option);
    }
};

// 页面自适应缩放
const handleScale = () => {
    if (!dashboardRef.value) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 计算按宽度和高度缩放的比例
    const scaleX = windowWidth / DESIGN_WIDTH;   // 宽度缩放比例
    const scaleY = windowHeight / DESIGN_HEIGHT; // 高度缩放比例
    
    // 使用较小的缩放比例，确保内容完整显示
    const scale = Math.min(scaleX, scaleY);
    
    // 计算缩放后的实际尺寸
    const scaledWidth = DESIGN_WIDTH * scale;
    const scaledHeight = DESIGN_HEIGHT * scale;
    
    // 计算居中偏移
    const offsetX = (windowWidth - scaledWidth) / 2;
    const offsetY = (windowHeight - scaledHeight) / 2;
    
    // 应用缩放和居中
    dashboardRef.value.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    dashboardRef.value.style.transformOrigin = '0 0';
};

// 窗口大小改变时重新渲染图表和缩放
const handleResize = debounce(() => {
    handleScale();

    // 延迟执行resize，确保缩放动画完成
    setTimeout(() => {
        chart1?.resize();
        chart2?.resize();
        chart3?.resize();
        chart4?.resize();
        chart5?.resize();
        chart6?.resize();
    }, 100);
}, 500);

onMounted(() => {
    updateTime();
    setInterval(updateTime, 1000);

    // 初始化缩放
    handleScale();

    initPieChart1();
    initPieChart2();
    // initBarChart();
    initMapChart();
    
    initLineChart();
    initRecordChart();

    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    chart1?.dispose();
    chart2?.dispose();
    chart3?.dispose();
    chart4?.dispose();
    chart5?.dispose();
    chart6?.dispose();
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped lang="scss">
.dashboard-wrapper {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #020817;
    position: relative;
}

// 静态背景效果
.bg-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

// 网格背景（静态）
.bg-grid {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
        linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: 0.5;
}

.dashboard-container {
    width: 1920px;
    height: 1080px;
    background: radial-gradient(ellipse at center, rgba(30, 58, 138, 0.15) 0%, rgba(2, 8, 23, 0.8) 70%);
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
}

.dashboard-header {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    position: relative;
}

.header-decoration {
    position: relative;
    width: 350px;
    height: 40px;
    display: flex;
    align-items: center;

    &.left {
        margin-right: 40px;
        justify-content: flex-end;
    }

    &.right {
        margin-left: 40px;
        justify-content: flex-start;
    }

    .deco-line {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.8), transparent);
        position: relative;

        &::before, &::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(59, 130, 246, 0.8);
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(59, 130, 246, 1);
        }

        &::before { left: 0; top: -4px; }
        &::after { right: 0; top: -4px; }
    }

    .deco-corner {
        width: 30px;
        height: 30px;
        position: relative;
        margin: 0 10px;

        &::before, &::after {
            content: '';
            position: absolute;
            background: rgba(59, 130, 246, 0.8);
            box-shadow: 0 0 10px rgba(59, 130, 246, 1);
        }

        &::before {
            width: 100%;
            height: 2px;
            top: 0;
            left: 0;
        }

        &::after {
            width: 2px;
            height: 100%;
            top: 0;
        }
    }

    &.left .deco-corner::after { right: 0; }
    &.right .deco-corner::after { left: 0; }
}

.dashboard-title {
    font-size: 3rem;
    font-weight: bold;
    color: #fff;
    text-align: center;
    letter-spacing: 12px;
    margin: 0;
    position: relative;
    z-index: 2;

    .title-glow {
        display: inline-block;
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        position: relative;
        text-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4);
        filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
    }
}

.dashboard-content {
    height: 940px;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 20px;
}

.left-panel,
.right-panel,
.center-panel {
    height: 100%;
    overflow: hidden;
}

.left-panel,
.right-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    height: 100%;
}

.center-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
}

.panel-card {
    font-size: 16px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.8) 100%);
    border: 2px solid rgba(59, 130, 246, 0.4);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(59, 130, 246, 0.2);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    transition: transform 0.3s ease;

    // 悬停效果
    &:hover {
        transform: translateY(-5px);
    }

    // 高亮卡片特效
    &.card-highlight {
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.3) 100%);
        border: 2px solid rgba(251, 191, 36, 0.5);
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 30px rgba(251, 191, 36, 0.3),
            inset 0 1px 0 rgba(59, 130, 246, 0.2);
    }
}

// 卡片装饰角
.card-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
    z-index: 2;

    &.tl {
        top: -2px;
        left: -2px;
        border-right: none;
        border-bottom: none;
        border-top-left-radius: 12px;
    }

    &.tr {
        top: -2px;
        right: -2px;
        border-left: none;
        border-bottom: none;
        border-top-right-radius: 12px;
    }

    &.bl {
        bottom: -2px;
        left: -2px;
        border-right: none;
        border-top: none;
        border-bottom-left-radius: 12px;
    }

    &.br {
        bottom: -2px;
        right: -2px;
        border-left: none;
        border-top: none;
        border-bottom-right-radius: 12px;
    }
}

/* 左侧第一个卡片保持内容高度 */
.left-panel .panel-card:first-child {
    flex: 0 0 auto;
}

/* 左侧其他卡片和右侧所有卡片平分剩余空间 */
.left-panel .panel-card:not(:first-child),
.right-panel .panel-card {
    flex: 1;
    min-height: 0;
}

.card-title {
    color: #60a5fa;
    font-size: 17px;
    font-weight: bold;
    margin-bottom: 15px;
    padding-bottom: 10px;
    text-align: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    }

    .title-icon {
        font-size: 18px;
        filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.8));
    }
}

.big-number {
    font-size: 20px;
    font-weight: bold;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
    margin: 20px 0;
    font-family: 'Arial Black', sans-serif;
    position: relative;
    filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.6));
}

.data-time {
    color: #94a3b8;
    text-align: center;
    font-size: 14px;
    margin-top: 10px;
    font-weight: 500;
    letter-spacing: 1px;
    text-shadow: 0 0 5px rgba(148, 163, 184, 0.5);
}

.chart-container {
    width: 100%;
}

.weather-info {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.9) 100%);
    padding: 12px 24px;
    border-radius: 12px;
    border: 2px solid rgba(59, 130, 246, 0.5);
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(59, 130, 246, 0.3),
        inset 0 1px 0 rgba(59, 130, 246, 0.2);
    backdrop-filter: blur(20px);
    z-index: 3;
}

.weather-icon {
    font-size: 36px;
    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.8));
}

.weather-text {
    color: #fff;

    .weather-temp {
        font-size: 15px;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .weather-location {
        font-size: 12px;
        color: #94a3b8;
        margin-top: 4px;
        text-shadow: 0 0 5px rgba(148, 163, 184, 0.5);
    }
}

.map-container {
    flex: 1;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.6) 100%);
    border: 2px solid rgba(59, 130, 246, 0.4);
    border-radius: 12px;
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(59, 130, 246, 0.2),
        inset 0 0 60px rgba(59, 130, 246, 0.1);
    overflow: hidden;
    position: relative;

    // 边框装饰
    &::before, &::after {
        content: '';
        position: absolute;
        width: 40px;
        height: 40px;
        border: 3px solid rgba(59, 130, 246, 0.6);
        z-index: 2;
    }

    &::before {
        top: 10px;
        left: 10px;
        border-right: none;
        border-bottom: none;
    }

    &::after {
        bottom: 10px;
        right: 10px;
        border-left: none;
        border-top: none;
    }
}

.map-border-decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;

    &::before, &::after {
        content: '';
        position: absolute;
        background: rgba(59, 130, 246, 0.3);
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
    }

    &::before {
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
    }

    &::after {
        top: 0;
        left: 0;
        width: 2px;
        height: 100%;
    }
}

.stats-info {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 3;
}

.stat-item {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.9) 100%);
    padding: 12px 20px;
    border-radius: 12px;
    border: 2px solid rgba(251, 191, 36, 0.6);
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(251, 191, 36, 0.2);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    gap: 12px;
    transition: transform 0.3s ease;

    &:hover {
        transform: translateX(-5px);
    }

    .stat-icon {
        font-size: 24px;
        filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.8));
    }

    .stat-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .stat-label {
        color: #94a3b8;
        font-size: 12px;
        text-shadow: 0 0 5px rgba(148, 163, 184, 0.5);
    }

    .stat-value {
        color: #fbbf24;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
    }
}
</style>

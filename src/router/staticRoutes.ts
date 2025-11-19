import HomeView from '@/views/HomeView.vue'

// 定义路由配置（使用懒加载）
const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: {
            title: '用户登录',
            description: '用户登录页面',
            icon: '🔐',
            color: '#667eea'
        },
    },
    {
        path: '/ref-api',
        name: 'ref-api',
        component: () => import('@/views/RefApi.vue'),
        meta: {
            title: 'Ref API 示例',
            description: '探索 Vue 3 响应式 API，包括 shallowRef、customRef 等高级用法',
            icon: '🔧',
            color: '#42b883'
        }
    },
    {
        path: '/file-upload',
        name: 'file-upload',
        component: () => import('@/views/FileUpload.vue'),
        meta: {
            title: '文件上传',
            description: '上传文件示例',
            icon: '🌀',
            color: '#42b883'
        }
    },
    {
        path: '/el-big-tree-search',
        name: 'el-big-tree-search',
        component: () => import('@/views/ElBigTreeSearch.vue'),
        meta: {
            title: '大数据量树形结构搜索（使用Element-Plus）',
            description: 'El Big Tree Search',
            icon: '🌲',
            color: '#42b883'
        }
    },
    {
        path: '/maptalksDemo',
        name: 'MaptalksDemo',
        component: () => import('@/views/MaptalksDemo.vue'),
        meta: {
            title: 'MaptalksDemo',
            description: 'Maptalks多服务商地图展示',
            icon: '🗺️',
            color: '#42b883'
        }
    }
];
export default routes;
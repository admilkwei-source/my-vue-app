import axios from 'axios'

/**
 * 获取 mockFlatData.json 数据
 * 文件位于 public/mockFlatData.json，可以直接通过根路径访问
 */
export const getVehicleData = (): Promise<any> => {
    return axios.get('/mockVehicleData.json').then(res => res.data)
}

/**
 * 获取分离后的组织节点和车辆节点数据
 * 文件位于 public/mockSeparatedData.json
 * 返回格式: { organizationNodes: [], vehicleNodes: [] }
 * 车辆节点包含 vehicleType 和 vehicleStatus 属性用于过滤
 */
export const getMockFlatData = (): Promise<{
    organizationNodes: any[];
    vehicleNodes: Array<{
        id: number;
        parentId: number | null;
        type: string;
        isHidden: boolean;
        name: string;
        label: string;
        value: number;
        vehicleType: string;  // 车辆类型: 全部车辆、视频车辆、主动安全、关注车辆
        vehicleStatus: string; // 车辆状态: 全部状态、行驶车辆、停止车辆、离线车辆、报警车辆、在线车辆、点火车辆、异常车辆、未定位车辆
    }>;
}> => {
    return axios.get('/mockFlatData.json').then(res => res.data)
}
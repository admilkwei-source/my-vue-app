export interface TreeNode {
    id: string | number;
    label: string;
    value: string | number;
    isHidden: boolean;
    parentId: string | number | null;
    children?: TreeNode[];
}

// 扁平数组转为树形结构
export function flatToTree(flatData: TreeNode[]): TreeNode[] {
    const treeData: TreeNode[] = [];
    const nodeMapData: Map<string | number, TreeNode> = new Map();
    flatData.forEach(node => {
        nodeMapData.set(node.id, {...node});
    });

    flatData.forEach(flatItem => {
        const node = nodeMapData.get(flatItem.id) as TreeNode;
        if (node.parentId) {
            const parentNode = nodeMapData.get(node.parentId);
            if (parentNode) {
                parentNode.children = parentNode.children || [];
                parentNode.children.push(node);
            }
        } else {
            treeData.push(node);
        }
    })

    return treeData;
}

// 树数据转为扁平数组
export function treeToFlat(treeData: TreeNode[]): TreeNode[] {
    const flatData: TreeNode[] = [];
    const flatten = (treeData: TreeNode[]) => {
        treeData.forEach(node => {
            flatData.push(node);
            if (node?.children?.length) {
                flatten(node.children);
            }
        })
    }

    flatten(treeData);

    return flatData;
}

class ZwTree {
    private treeData: TreeNode[] = [];
    private flatData: TreeNode[] = [];
    private searchFlags: string[] = [];
    private nodeMap: Map<string | number, TreeNode> = new Map();
    private childrenMap: Map<string | number, TreeNode[]> = new Map(); // 父节点ID -> 子节点数组映射
    private searchIndexObj: Map<string, Set<string | number>> = new Map(); // 字符 -> 包含该字符的节点ID集合
    private nodeSearchTextMap: Map<string | number, string> = new Map(); // 节点ID -> 搜索文本

    constructor(options?: { treeData?: TreeNode[], flatData?: TreeNode[], searchFlags?: string[] }) {
        this.treeData = options?.treeData || [];
        this.flatData = options?.flatData || [];
        this.searchFlags = options?.searchFlags || [];
    }

    /**
     * 生成指定数量的扁平树节点数据
     * @param count 节点总数
     * @param childrenPerNode 每个节点平均的子节点数量
     * @returns 扁平节点数组
     */
    public generateFlatData(count: number, childrenPerCount: number): void {
        const arr: TreeNode[] = [];

        // 第一个节点是根节点
        arr.push({
            id: 1,
            label: '根节点',
            value: 1,
            isHidden: false,
            parentId: null
        });

        let currentId = 2;
        let currentParentIndex = 0;

        // 生成剩余节点
        while (currentId <= count && currentParentIndex < arr.length) {
            const parentNode = arr[currentParentIndex];

            if (!parentNode) break;

            // 为当前父节点生成子节点
            for (let i = 0; i < childrenPerCount && currentId <= count; i++) {
                const obj = {
                    id: currentId,
                    label: `节点-${currentId}`,
                    value: currentId,
                    isHidden: false,
                    parentId: parentNode.id
                };
                arr.push(obj);

                currentId++;
            }

            currentParentIndex++;
        }

        this.flatData = arr;
        
        // 构建节点映射和父子关系映射
        this.setNodeMap();

        if(this.searchFlags.length){
            this.buildSearchIndex();
        }
    }

    /**
     * 将传入的扁平数组转为树形结构
     * 确保已传入flagData数据
     * 确保扁平数组中的节点有parentId属性，且parentId指向父节点
     */
    public flatToTree(): void {
        this.setNodeMap();
        this.treeData = flatToTree(this.flatData);
    }

    // 获取扁平树节点数据
    public getFlatData(): TreeNode[] {
        return this.flatData;
    }

    // 获取树形结构数据
    public getTreeData(): TreeNode[] {
        return this.treeData;
    }

    private setNodeMap(): void {
        if(this.flatData.length){
            this.nodeMap.clear();
            this.childrenMap.clear();
            
            // 构建节点映射和父子关系映射
            this.flatData.forEach(node => {
                this.nodeMap.set(node.id, node);
                
                // 构建父子关系映射：parentId -> children[]
                if (node.parentId !== null) {
                    if (!this.childrenMap.has(node.parentId)) {
                        this.childrenMap.set(node.parentId, []);
                    }
                    this.childrenMap.get(node.parentId)!.push(node);
                }
            });
        }
    }

    // 构建搜索索引，用于快速搜索查找
    private buildSearchIndex(): void {
        this.searchIndexObj.clear();
        this.nodeSearchTextMap.clear();
        
        this.flatData.forEach(node => {
            
            // 构建节点的搜索文本
            const searchText = this.searchFlags.map(flag => node[flag as keyof TreeNode]).join(' ').toLowerCase();
            this.nodeSearchTextMap.set(node.id, searchText);
            
            // 构建字符级别的倒排索引：每个字符 -> 包含该字符的节点ID集合
            for (const char of searchText) {
                if (!this.searchIndexObj.has(char)) {
                    this.searchIndexObj.set(char, new Set());
                }
                this.searchIndexObj.get(char)?.add(node.id);
            }
        });
        console.log("searchIndexObj",this.searchIndexObj);
        console.log("nodeSearchTextMap",this.nodeSearchTextMap);
    }

    /**
     * 连接关联节点：找出当前节点的所有父节点和子节点
     * @param nodes 目标节点数组
     * @returns 包含所有关联节点的 Map
     */
    private connectAssociationNode(nodes: TreeNode[]): TreeNode[] {
        const resultMap = new Map<string | number, TreeNode>();

        /**
         * 递归查找所有父节点（从直接父节点到根节点）
         * @param nodeId 节点ID
         */
        const findAllParentNodes = (nodeId: string | number): void => {
            const nodeData = this.nodeMap.get(nodeId);
            if (!nodeData) return;

            // 如果节点已在结果中，避免重复处理
            if (resultMap.has(nodeData.id)) return;

            resultMap.set(nodeData.id, nodeData);

            // 如果存在父节点，继续向上查找
            if (nodeData.parentId) {
                findAllParentNodes(nodeData.parentId);
            }
        };

        /**
         * 递归查找所有子节点（直接子节点和所有后代）
         * 使用预构建的 childrenMap 提升性能，避免每次都遍历整个 flatData
         * @param nodeId 节点ID
         */
        const findAllChildrenNodes = (parentNodeId: string | number): void => {
            const children = this.childrenMap.get(parentNodeId);
            if (!children?.length) return;

            children.forEach(child => {
                if(!resultMap.has(child.id)){
                    resultMap.set(child.id, child);
                    findAllChildrenNodes(child.id); 
                }
            });
        };

        // 遍历每个目标节点
        nodes.forEach(node => {
            // 添加当前节点
            if (!resultMap.has(node.id)) {
                resultMap.set(node.id, node);
            }

            // 查找并添加所有父节点
            const nodeData = this.nodeMap.get(node.id);
            if (nodeData && nodeData.parentId) {
                findAllParentNodes(nodeData.parentId);
            }

            // 查找并添加所有子节点
            findAllChildrenNodes(node.id);
        });

        return Array.from(resultMap.values());
    }

    /**
     * 初始化扁平数组数据
     * @param flatData 扁平数组数据
     */
    public initFlatData(flatData: TreeNode[]): void {
        this.flatData = flatData;
        this.flatToTree();
        if(this.searchFlags.length){
            this.buildSearchIndex();
        }
    }

    /**
     * 
     * @param value 搜索值
     * @returns 搜索结果
     * 
     * 1. 将搜索值转换为小写并分割为字符数组
     * 2. 遍历字符数组，通过倒排索引获取包含该字符的节点ID集合
     * 3. 遍历节点ID集合，获取节点搜索文本
     * 4. 如果节点搜索文本包含搜索值，则将节点添加到搜索结果中
     * 5. 返回搜索结果
     */
    public fuzzysearch(value: string): TreeNode[] {
        console.time("fuzzysearch");
        const searchNodes: TreeNode[] = [];
        const searchValue = value.toLowerCase().trim().split('');
        
        // 无搜索内容，取缓存数据
        if (!searchValue || searchValue.length === 0) {
            return this.treeData;
        }

        // 将搜索值分割为字符串数组后，遍历每个搜索值文字来匹配。
        searchValue.forEach((char, index) => {
            // 基于索引对象去搜索，获取匹配的节点id
            const candidateIds = this.searchIndexObj.get(char);
            if (candidateIds && candidateIds.size > 0 && index === searchValue.length - 1) {
                console.log("candidateIds",candidateIds);
                // 遍历节点id集合，获取节点搜索文本
                candidateIds.forEach(nodeId => {
                    // 获取节点搜索文本
                    const searchText = this.nodeSearchTextMap.get(nodeId);
                    if (searchText && searchText.toLowerCase().includes(value.toLowerCase())) {
                        const node = this.nodeMap.get(nodeId);
                        if (node) {
                            searchNodes.push(node);
                        }
                    }
                });
            }
        });
        
        console.timeEnd("fuzzysearch");

        // 过滤节点拼接关联父节点和子节点
        const finalFlatNodes = this.connectAssociationNode(searchNodes);
        console.log("finalFlatNodes",finalFlatNodes);
        // 最终扁平节点转为树形结构
        const finalTreeNodes = flatToTree(finalFlatNodes);

        return finalTreeNodes;
    }


}

export default ZwTree;
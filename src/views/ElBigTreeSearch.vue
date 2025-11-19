<template>
<el-input v-model="inputVal" class="max-w-[600px]" @input="handleInput"></el-input>
<el-tree-v2
    style="max-width: 600px"
    :data="treeData"
    :props="treeProps"
    :height="600"
    :default-expanded-keys="expanedKeys"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { default as ZwTree, flatToTree, type TreeNode } from '@/utils/zwTree.ts';
import { getMockFlatData } from '@/utils/requestApi/local';
import { debounce } from 'lodash-es';

defineOptions({
    name: 'ElBigTreeSearch',
});

const orgMap = new Map<number, TreeNode>();
const vehicleMap = new Map<number, TreeNode>();

const inputVal = ref();

interface TreeProps {
    value: string;
    label: string;
    children: string;
}

const treeProps:TreeProps = {
    value: 'value',
    label: 'label',
    children: 'children',
}

const treeData = ref<TreeNode[]>([]);

let expanedKeys:Array<string | number> = [];
const zwTree: ZwTree = new ZwTree({searchFlags: ['label']});

const initTreeData = () => {
    getMockFlatData().then(data => {
        console.log(111, data);
        const { organizationNodes, vehicleNodes } = data;
        organizationNodes.forEach(node => {
            orgMap.set(node.id, node);
        });
        vehicleNodes.forEach(node => {
            vehicleMap.set(node.id, node);
        });
        const flatData = new Array<TreeNode>().concat(organizationNodes, vehicleNodes);
        zwTree.initFlatData(flatData);
        treeData.value = zwTree.getTreeData();
        if(treeData.value.length){
            // 展开监控中心节点
            expanedKeys = [treeData.value[0]?.id as string | number];
        }
    });
}

onMounted(() => initTreeData());

const handleInput = debounce((value: string): void => {
    const result = zwTree.fuzzysearch(value);
    treeData.value = result;
}, 500);
</script>
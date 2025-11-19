<template>
    <div class="file-upload-container">
        <input 
            type="file" 
            @change="handleFileChange" 
            formenctype="multipart/form-data"
            :disabled="isUploading"
        >
        <img v-if="imageUrl" :src="imageUrl" alt="image" width="200px">
        
        <div class="upload-progress">
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span>上传进度: {{ uploadProgress.toFixed(1) }}%</span>
        </div>
        
        <button 
            type="submit" 
            @click="handleSubmit"
        >
            {{ isUploading ? '上传中...' : '提交' }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import {UploadChunkFile} from 'zw-npm-store/utils';
defineOptions({
    name: 'FileUpload',
});

const imageUrl = ref<string>('');
let selectFile: File = {} as File;

const handleFileChange = (event: Event): void => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        selectFile = file;
    }
};

// 上传进度状态
const uploadProgress = ref<number>(0);
const isUploading = ref<boolean>(false);

let uploadChunkFile: UploadChunkFile;

const handleSubmit = async (): Promise<void> => {
    if (!selectFile || !selectFile.name) {
        console.error('请先选择文件');
        return;
    }
    
    try {
        isUploading.value = true;
        uploadProgress.value = 0;

        // 创建上传实例
        uploadChunkFile = new UploadChunkFile(selectFile);
        uploadChunkFile.setChunkFile(1 * 1024 * 1024);

        await uploadChunkFile.uploadChunkFile((formData) =>
            axios.post("/api/user/upload", formData, {
                timeout: 30000,
                onUploadProgress: (progressEvent) => {
                    const chunkProgress = (progressEvent.loaded / progressEvent.total!) * 100;
                    uploadProgress.value = chunkProgress;
                    console.log(`切片上传进度: ${chunkProgress.toFixed(2)}%`);
                }
            })
        );
        
    } catch (error) {
        console.error('文件上传过程中发生错误:', error);
        uploadProgress.value = 0;
    } finally {
        isUploading.value = false;
    }
};
</script>

<style scoped>
.file-upload-container {
    padding: 20px;
    max-width: 500px;
}

.upload-progress {
    margin: 15px 0;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
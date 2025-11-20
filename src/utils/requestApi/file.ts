import request, { axiosInstance } from './index'

export const uploadFile = (data: any, onUploadProgress: any) => {
    return request.post('/api/file/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
    });
}

export const getUploadFileList = (data: any) => {
    return request.post('/api/file/getUploadFileList', data);
}
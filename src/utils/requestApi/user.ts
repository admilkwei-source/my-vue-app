import request, { axiosInstance } from './index'

export const login = (data: any) => {
    return request.post('/api/user/login', data);
}

export const register = (data: any) => {
    return request.post('/api/user/register', data);
}

// 获取验证码图片
export const getCaptcha = () => {
    return axiosInstance.get('/api/user/getCaptcha');
}

// 获取加密公钥
export const getEncryptionKey = () => {
    return axiosInstance.get('/api/user/getEncryptionKey');
}
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应数据接口
export interface ResponseData<T = any> {
  code: number
  message: string
  data: T
  success?: boolean
}

// 扩展请求配置
export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean // 是否显示加载提示
  showError?: boolean // 是否显示错误提示
  showSuccess?: boolean // 是否显示成功提示
}

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础URL
  timeout: 30000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

instance.defaults.withCredentials = true; // 允许请求头携带 cookie

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 或 pinia store 获取 token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    // 如果有 token，添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 如果是 GET 请求，添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    return config
  },
  (error: AxiosError) => {
    // 请求错误处理
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const { data, config } = response
    const requestConfig = config as RequestConfig

    // 如果状态码不是 200，视为错误
    if (response.status !== 200) {
      return Promise.reject(new Error(`请求失败: ${response.status}`))
    }

    // 根据业务状态码处理
    // 这里假设 code === 200 或 code === 0 表示成功，具体根据后端接口规范调整
    if (data.code === 200 || data.code === 0) {
      // 如果需要显示成功提示
      if (requestConfig.showSuccess && data.message) {
        ElMessage.success(data.message)
      }
      // 将 data 赋值给 response.data，这样在请求方法中可以直接拿到业务数据
      response.data = data as any
      return response
    } else {
      // 业务错误处理
      const errorMessage = data.message || '请求失败，请稍后重试'
      
      // 根据错误码进行特殊处理
      switch (data.code) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          ElMessageBox.alert('登录已过期，请重新登录', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          }).then(() => {
            // 跳转到登录页，根据实际路由调整
            window.location.href = '/login'
          })
          break
        case 403:
          // 无权限
          ElMessage.error('您没有权限访问此资源')
          break
        case 500:
          // 服务器错误
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          // 显示错误提示
          if (requestConfig.showError !== false) {
            ElMessage.error(errorMessage)
          }
      }
      
      return Promise.reject(new Error(errorMessage))
    }
  },
  (error: AxiosError) => {
    const requestConfig = error.config as RequestConfig | undefined
    const isCaptchaRequest = error.config?.url?.includes('/captcha') || 
                             error.config?.url?.includes('/getCaptcha') ||
                             error.config?.responseType === 'blob'

    // HTTP 错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          if (!isCaptchaRequest) {
            ElMessage.error('请求参数错误')
          }
          break
        case 401:
          // 验证码请求失败时不跳转，避免循环刷新
          if (!isCaptchaRequest) {
            ElMessage.error('未授权，请重新登录')
            localStorage.removeItem('token')
            sessionStorage.removeItem('token')
            // 跳转到登录页
            window.location.href = '/login'
          }
          break
        case 403:
          if (!isCaptchaRequest) {
            ElMessage.error('拒绝访问')
          }
          break
        case 404:
          if (!isCaptchaRequest) {
            ElMessage.error('请求的资源不存在')
          }
          break
        case 500:
          if (!isCaptchaRequest) {
            ElMessage.error('服务器内部错误')
          }
          break
        case 502:
          if (!isCaptchaRequest) {
            ElMessage.error('网关错误')
          }
          break
        case 503:
          if (!isCaptchaRequest) {
            ElMessage.error('服务不可用')
          }
          break
        case 504:
          if (!isCaptchaRequest) {
            ElMessage.error('网关超时')
          }
          break
        default:
          if (!isCaptchaRequest) {
            ElMessage.error(`请求失败: ${status}`)
          }
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (!isCaptchaRequest) {
        ElMessage.error('网络错误，请检查网络连接')
      }
    } else {
      // 请求配置错误
      if (!isCaptchaRequest) {
        ElMessage.error('请求配置错误')
      }
    }

    // 如果配置了不显示错误提示，则不显示
    if (requestConfig?.showError === false) {
      // 不显示错误提示，但仍然需要 reject
    }

    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

// 封装请求方法
class Request {
  /**
   * GET 请求
   */
  get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return instance.get<ResponseData<T>>(url, { params, ...config }).then(res => res.data)
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return instance.post<ResponseData<T>>(url, data, config).then(res => res.data)
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return instance.put<ResponseData<T>>(url, data, config).then(res => res.data)
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return instance.delete<ResponseData<T>>(url, { params, ...config }).then(res => res.data)
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return instance.patch<ResponseData<T>>(url, data, config).then(res => res.data)
  }

  /**
   * 文件上传
   */
  upload<T = any>(
    url: string,
    file: File | FormData,
    config?: RequestConfig
  ): Promise<ResponseData<T>> {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }

    return instance.post<ResponseData<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    }).then(res => res.data)
  }

  /**
   * 文件下载
   */
  download(url: string, params?: any, filename?: string): Promise<void> {
    return instance
      .get(url, {
        params,
        responseType: 'blob'
      })
      .then((response) => {
        const blob = new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      })
  }
}

// 创建请求实例
const request = new Request()

// 导出请求实例和 axios 实例
export default request
export { instance as axiosInstance }

// 导出常用方法
export const { get, post, put, delete: del, patch, upload, download } = request


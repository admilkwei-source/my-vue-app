<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>用户中心</h2>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 登录表单 -->
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="80px"
            label-position="left"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                clearable
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
                :prefix-icon="Lock"
              />
            </el-form-item>
            
            <el-form-item label="验证码" prop="captcha">
              <div class="captcha-wrapper">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  clearable
                  :prefix-icon="Picture"
                  style="flex: 1"
                />
                <div class="captcha-image" @click="refreshCaptcha">
                  <img
                    v-if="captchaImageUrl"
                    :src="captchaImageUrl"
                    alt="验证码"
                    class="captcha-img"
                  />
                  <div v-else class="captcha-loading">加载中...</div>
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="isLoading"
                @click.prevent="handleLogin"
                style="width: 100%"
              >
                {{ isLoading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 注册表单 -->
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-width="80px"
            label-position="left"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                clearable
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
                :prefix-icon="Lock"
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
                clearable
                :prefix-icon="Lock"
              />
            </el-form-item>
            
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="registerForm.nickname"
                placeholder="请输入昵称"
                clearable
                :prefix-icon="UserFilled"
              />
            </el-form-item>
            
            <el-form-item label="验证码" prop="captcha">
              <div class="captcha-wrapper">
                <el-input
                  v-model="registerForm.captcha"
                  placeholder="请输入验证码"
                  clearable
                  :prefix-icon="Picture"
                  style="flex: 1"
                />
                <div class="captcha-image" @click="refreshCaptcha">
                  <img
                    v-if="captchaImageUrl"
                    :src="captchaImageUrl"
                    alt="验证码"
                    class="captcha-img"
                  />
                  <div v-else class="captcha-loading">加载中...</div>
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="isRegistering"
                @click.prevent="handleRegister"
                style="width: 100%"
              >
                {{ isRegistering ? '注册中...' : '注册' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, UserFilled, Picture } from '@element-plus/icons-vue'
import { login, register, getCaptcha } from '@/utils/requestApi/user'
import { useUserInfoStore } from '@/stores/userInfo'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'LoginView',
})

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const isLoading = ref(false)
const isRegistering = ref(false)
const activeTab = ref('login')
const captchaImageUrl = ref('')
const userInfoStore = useUserInfoStore()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  captcha: '',
})

// 验证确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 登录表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为 4 位', trigger: 'blur' },
  ]
}

// 注册表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  nickname: [
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为 4 位', trigger: 'blur' },
  ]
}

// 获取验证码图片
const refreshCaptcha = async () => {
  try {
    const response = await getCaptcha();
    
    captchaImageUrl.value = response.data.data;
  } catch (error) {
    console.error('获取验证码失败:', error)
    // 验证码获取失败时不显示错误提示，避免干扰用户体验
    // 只在控制台记录错误，不触发页面跳转
    if (captchaImageUrl.value) {
      // 如果已有验证码图片，保留显示，不刷新
      return
    }
    // 如果没有验证码图片，显示加载失败提示
    captchaImageUrl.value = ''
  }
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 验证表单
    await loginFormRef.value.validate()
    
    isLoading.value = true
    
    // 开始调用登录接口进行登录
    const res = await login(loginForm)
    userInfoStore.setUserData(res.data)
    ElMessage.success(res.message || '登录成功')
    
    // 登录成功后跳转
    router.push('/')
  } catch (error: any) {
    // ElMessage.error(error.message)
    // 登录失败后刷新验证码
    refreshCaptcha()
  } finally {
    isLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    // 验证表单
    await registerFormRef.value.validate()
    
    isRegistering.value = true
    
    // 开始调用注册接口
    const res = await register({
      username: registerForm.username,
      password: registerForm.password,
      nickname: registerForm.nickname,
      captcha: registerForm.captcha,
    })
    
    ElMessage.success(res.message || '注册成功')
    
    // 注册成功后切换到登录标签页
    activeTab.value = 'login'
    // 清空注册表单
    registerFormRef.value.resetFields()
    // 刷新验证码
    refreshCaptcha()
  } catch (error) {
    console.error('注册失败:', error)
    if (error instanceof Error && error.message) {
      ElMessage.error(error.message)
    }
    // 注册失败后刷新验证码
    refreshCaptcha()
  } finally {
    isRegistering.value = false
  }
}

// 组件挂载时获取验证码
onMounted(() => {
  refreshCaptcha()
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  
  :deep(.el-card__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px 12px 0 0;
    padding: 20px;
  }
  
  :deep(.el-card__body) {
    padding: 30px;
  }
}

.card-header {
  text-align: center;
  
  h2 {
    margin: 0;
    color: white;
    font-size: 24px;
    font-weight: 600;
  }
}

.login-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }
  
  :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 500;
  }
  
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  :deep(.el-tabs__item.is-active) {
    color: #667eea;
  }
}

.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  flex-shrink: 0;
  transition: all 0.3s;
  
  &:hover {
    border-color: #667eea;
    background-color: #f0f2ff;
  }
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.captcha-loading {
  font-size: 12px;
  color: #909399;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  .captcha-image {
    width: 100px;
    height: 36px;
  }
}
</style>


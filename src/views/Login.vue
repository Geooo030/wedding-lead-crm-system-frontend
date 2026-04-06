<template>
  <div class="login-container" :class="{ 'is-mobile': isMobile }">
    <div class="login-card">
      <div class="login-header">
        <span class="logo-icon">👰</span>
        <h1>婚纱获客系统</h1>
        <p>Lead CRM System</p>
      </div>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                size="large"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-btn"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="注册" name="register">
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form">
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="registerLoading"
                class="login-btn"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="login-footer">
        <p v-if="activeTab === 'register'">注册后请使用新账号登录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { login, register } from '@/api/auth'
import { isMobile } from '@/utils/device'

const router = useRouter()
const formRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const registerLoading = ref(false)
const isMobileRef = ref(false)
const activeTab = ref('login')

const form = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2-20之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    const res = await login(form.username, form.password)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  const valid = await registerFormRef.value?.validate()
  if (!valid) return
  
  registerLoading.value = true
  try {
    await register(registerForm.username, registerForm.password)
    ElMessage.success('注册成功，请登录')
    activeTab.value = 'login'
  } catch {
    // 错误已在拦截器处理
  } finally {
    registerLoading.value = false
  }
}

onMounted(() => {
  isMobileRef.value = isMobile()
})
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  
  // 移动端样式
  &.is-mobile {
    padding: 0;
    
    .login-card {
      width: 100%;
      max-width: none;
      min-height: 100vh;
      border-radius: 0;
      padding: 60px 24px 40px;
      display: flex;
      flex-direction: column;
      
      .login-header {
        flex: 0 0 auto;
        margin-bottom: 48px;
        
        .logo-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }
        
        h1 {
          font-size: 28px;
        }
      }
      
      .login-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .el-form-item:last-of-type {
          margin-top: 24px;
        }
      }
      
      .login-btn {
        height: 52px;
        font-size: 18px;
      }
      
      .login-footer {
        flex: 0 0 auto;
        margin-top: 32px;
      }
    }
  }
}

.login-card {
  width: 400px;
  max-width: 100%;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .logo-icon {
    font-size: 40px;
    margin-bottom: 8px;
  }
  
  h1 {
    font-size: 24px;
    color: #1D1D1F;
    margin-bottom: 8px;
  }
  
  p {
    color: #86868B;
    font-size: 14px;
  }
}

.login-form {
  .el-input {
    :deep(.el-input__wrapper) {
      border-radius: 10px;
      padding: 8px 15px;
    }
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  
  p {
    color: #86868B;
    font-size: 13px;
  }
}
</style>
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

// 版本号，每次部署时更新
const APP_VERSION = '20260406'

// 检查版本更新
const checkVersionUpdate = () => {
  const storedVersion = localStorage.getItem('app_version')
  
  if (storedVersion && storedVersion !== APP_VERSION) {
    // 版本已更新，提示用户刷新
    ElMessage({
      message: '发现新版本，请刷新页面以获取最新功能',
      type: 'info',
      duration: 3000,
      showClose: true
    })
    
    // 强制刷新页面
    setTimeout(() => {
      window.location.reload(true)
    }, 3000)
  }
  
  // 存储当前版本
  localStorage.setItem('app_version', APP_VERSION)
}

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

// 检查版本更新
checkVersionUpdate()
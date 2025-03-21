<template>
  <div class="container">
    <!-- 左侧区域：全局背景依然在此 -->
    <div class="left"></div>
    <!-- 右侧区域：内部居中显示登录/注册框 -->
    <div class="right">
      <div class="box">
        <!-- 大标题区域 -->
        <div class="title-section">
          <a-typography-title :level="2" class="main-title">
            欢迎使用大模型安全测评平台
          </a-typography-title>
        </div>

        <!-- 表单标题区域 -->
        <div class="form-header">
          <h3 class="form-title">登录</h3>
          <!-- 在登录状态下，新的一行显示“还没有账号？ 注册”，其中“注册”为蓝色链接 -->
          <p class="register-text" v-if="!isRegister">
            还没有账号？ <a @click="toggleRegister">注册</a>
          </p>
        </div>

        <!-- 登录表单 -->
        <a-form v-if="!isRegister" layout="vertical">
          <a-form-item label="账号">
            <a-input v-model:value="loginForm.username" placeholder="请输入账号" />
          </a-form-item>
          <a-form-item label="密码">
            <a-input-password v-model:value="loginForm.password" placeholder="请输入密码" />
          </a-form-item>
          <a-form-item>
            <a class="float-right">忘记密码？</a>
          </a-form-item>
          <a-button type="primary" block @click="login">登录</a-button>
        </a-form>

        <!-- 注册表单 -->
        <a-form v-else layout="vertical">
          <a-typography-title :level="3">注册</a-typography-title>
          <a-form-item label="企业名称">
            <a-input v-model:value="registerForm.companyName" placeholder="请输入企业名称" />
          </a-form-item>
          <a-form-item label="账号">
            <a-input v-model:value="registerForm.username" placeholder="请输入账号" />
          </a-form-item>
          <a-form-item label="密码">
            <a-input-password v-model:value="registerForm.password" placeholder="请输入密码" />
          </a-form-item>
          <a-form-item label="确认密码">
            <a-input-password v-model:value="registerForm.confirmPassword" placeholder="请确认密码" />
          </a-form-item>
          <a-button type="primary" block @click="register">注册</a-button>
          <p class="footer-text">注册即表示您已同意所有用户条款。</p>
          <!-- 关闭按钮 -->
          <a-button type="text" class="close-button" @click="toggleRegister">×</a-button>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isRegister = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  companyName: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const toggleRegister = () => {
  isRegister.value = !isRegister.value
}

const login = () => {
  router.push('/home')
}

const register = () => {
  console.log('注册信息:', registerForm.value)
}
</script>

<style scoped>
/* 全局设置：占满整个浏览器视口 */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #f4f5f7;
}

/* 使用 grid 布局分左右区域 */
.container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  width: 100vw;
  height: 100vh;
  background: url('/images/loginbg.png') center center no-repeat;
  background-size: cover;
}

/* 左侧区域 */
.left {
  /* 保留为空，背景由 container 提供 */
}

/* 右侧区域：居中显示登录/注册框 */
.right {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录/注册框 */
.box {
  box-sizing: border-box;
  width: 35vw;
  min-width: 380px;
  max-width: 550px;
  max-height: 90vh;
  padding: 2vw;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  overflow: auto;
  position: relative;
}

/* 大标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 16px;
}

.main-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 表单标题区域 */
.form-header {
  margin-bottom: 16px;
  text-align: center;
}

.form-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 注册提示，放在登录标题下方 */
.register-text {
  margin-top: 8px;
  font-size: 14px;
  color: #333;
  text-align: right;
}
.register-text a {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
}

/* 其它细节 */
.float-right {
  float: right;
}

.footer-text {
  text-align: center;
  font-size: 12px;
  color: gray;
  margin-top: 10px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  color: gray;
  cursor: pointer;
}

/* 小屏幕适配 */
@media screen and (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
  .right {
    justify-content: center;
  }
  .box {
    width: 80%;
    max-width: 90%;
    padding: 20px;
  }
}
</style>

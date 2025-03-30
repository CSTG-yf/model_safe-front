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
          <!-- 在登录状态下，新的一行显示"还没有账号？ 注册"，其中"注册"为蓝色链接 -->
          <p class="register-text" v-if="!isRegister">
            还没有账号？ <a @click="toggleRegister">注册</a>
          </p>
        </div>

        <!-- 登录表单 -->
        <a-form v-if="!isRegister" layout="vertical">
          <a-form-item label="邮箱">
            <a-input v-model:value="loginForm.email" placeholder="请输入邮箱" />
          </a-form-item>
          <a-form-item label="密码">
            <a-input-password
              v-model:value="loginForm.password"
              placeholder="请输入密码"
            />
          </a-form-item>
          <a-form-item>
            <a class="float-right">忘记密码？</a>
          </a-form-item>
          <a-button type="primary" block @click="login" :loading="loading"
            >登录</a-button
          >
        </a-form>

        <!-- 注册表单 -->
        <a-form v-else layout="vertical">
          <a-typography-title :level="3">注册并登录</a-typography-title>
          <a-form-item label="企业名称">
            <a-input
              v-model:value="registerForm.company_name"
              placeholder="请输入企业名称"
            />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input
              v-model:value="registerForm.email"
              placeholder="请输入邮箱"
            />
          </a-form-item>
          <a-form-item label="密码">
            <a-input-password
              v-model:value="registerForm.password"
              placeholder="请输入密码"
            />
          </a-form-item>
          <a-form-item label="确认密码">
            <a-input-password
              v-model:value="confirmPassword"
              placeholder="请确认密码"
            />
          </a-form-item>
          <a-button type="primary" block @click="register" :loading="loading"
            >注册</a-button
          >
          <p class="footer-text">注册即表示您已同意所有用户条款。</p>
          <a-button type="text" class="close-button" @click="toggleRegister"
            >×</a-button
          >
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCounterStore } from "@/stores/counterStore";
import { message } from "ant-design-vue";
import axios from "@/utils/axios";

const router = useRouter();
const store = useCounterStore();
const isRegister = ref(false);
const loading = ref(false);
const confirmPassword = ref("");

const loginForm = ref({
  email: "",
  password: "",
});

const registerForm = ref({
  company_name: "",
  email: "",
  password: "",
});

const toggleRegister = () => {
  isRegister.value = !isRegister.value;
  // 清空表单
  loginForm.value = { email: "", password: "" };
  registerForm.value = { company_name: "", email: "", password: "" };
  confirmPassword.value = "";
};

const login = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    message.warning("请填写完整的登录信息");
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post("/users/login/", loginForm.value);

    if (response.data.result === "success") {
      store.setUserInfo(response.data);
      message.success("登录成功");
      router.push("/home");
    } else {
      message.error(response.data.message || "登录失败");
    }
  } catch (error) {
    console.error("登录失败:", error);
    message.error(error.response?.data?.message || "登录失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const register = async () => {
  if (
    !registerForm.value.company_name ||
    !registerForm.value.email ||
    !registerForm.value.password
  ) {
    message.warning("请填写完整的注册信息");
    return;
  }

  if (registerForm.value.password !== confirmPassword.value) {
    message.warning("两次输入的密码不一致");
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post("/users/register/", registerForm.value);

    if (response.data.result === "success") {
      store.setUserInfo(response.data);
      message.success("注册成功");
      router.push("/home");
    } else {
      message.error(response.data.message || "注册失败");
    }
  } catch (error) {
    console.error("注册失败:", error);
    if (error.response) {
      console.error("错误响应数据:", error.response.data);
    }
    const errorMsg =
      error.response?.data?.errors?.email?.[0] ||
      error.response?.data?.message ||
      "注册失败，请稍后重试";
    message.error(errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 全局设置：占满整个浏览器视口 */
html,
body,
#app {
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
  background: url("/images/loginbg.png") center center no-repeat;
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

<template>
    <div class="login-container">
        <div class="login-header">
            <h1 class="login-title">用户登录</h1>
            <p class="login-subtitle">欢迎回来</p>
        </div>

        <van-form @submit="onSubmit" class="login-form">
            <van-cell-group inset>
                <van-field
                        v-model="userAccount"
                        name="username"
                        label="账号"
                        placeholder="请输入账号"
                        :rules="[{ required: true, message: '请输入账号' }]"
                        left-icon="user-o"
                />
                <van-field
                        v-model="userPassword"
                        type="password"
                        name="password"
                        label="密码"
                        placeholder="请输入密码"
                        :rules="[{ required: true, message: '请输入密码' }]"
                        left-icon="lock"
                />
            </van-cell-group>

            <div class="login-options">
                <van-checkbox v-model="rememberMe" shape="square" checked-color="#1989fa">
                    <span class="checkbox-text">记住我</span>
                </van-checkbox>
                <span class="forgot-password" @click="onForgotPassword">忘记密码？</span>
            </div>

            <div class="login-button">
                <van-button
                        round
                        block
                        type="primary"
                        native-type="submit"
                        :loading="loading"
                        :disabled="!userAccount || !userPassword"
                >
                    {{ loading ? '登录中...' : '登录' }}
                </van-button>
            </div>

            <div class="register-link">
                <span>还没有账号？</span>
                <span class="register-text" @click="toRegister">立即注册</span>
            </div>
        </van-form>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import myAxios from "../plugins/myAxios.ts";
import {showSuccessToast, showErrorToast, showCustomToast, showInfoToast} from "../utils/toast.ts";
// 导入 Pinia 用户信息存储
import { useUserStore } from '../plugins/userStore.ts'
const userStore = useUserStore()

const router = useRouter();
const userAccount = ref('');
const userPassword = ref('');
const rememberMe = ref(false);
const loading = ref(false);

// 检查是否记住账号
onMounted(() => {
    const savedAccount = localStorage.getItem('savedAccount');
    if (savedAccount) {
        userAccount.value = savedAccount;
        rememberMe.value = true;
    }
});

const onSubmit = async () => {
    loading.value = true;
    try {
        const res = await myAxios.post('/user/login', {
            userAccount: userAccount.value,
            userPassword: userPassword.value
        });

        if (res.data.code === 0 && res.data.data !== null) {
            showSuccessToast('登录成功');

            // 处理记住账号功能
            if (rememberMe.value) {
                localStorage.setItem('savedAccount', userAccount.value);
            } else {
                localStorage.removeItem('savedAccount');
            }

            // 更新 Pinia 状态
            userStore.login();
            // 添加登录时间戳
            const userData = {
                ...res.data.data,
                loginTimestamp: Date.now()
            };
            localStorage.setItem('user', JSON.stringify(userData));

            // 触发登录事件通知其他组件
            window.dispatchEvent(new Event('userLogin'));

            await router.push('/');
        } else {
            showErrorToast(res.data.message || '登录失败');
        }
    } catch (error) {
        showErrorToast('网络错误，请稍后重试');
    } finally {
        loading.value = false;
    }
};

const toRegister = () => {
    router.push('/user/register');
};

const onForgotPassword = () => {
    showErrorToast('暂不支持找回密码');
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 15px;
    box-sizing: border-box;
}

.login-header {
    text-align: center;
    padding: 30px 0 20px;
}

.login-title {
    color: white;
    font-size: 24px;
    font-weight: 500;
    margin: 0 0 8px;
}

.login-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    margin: 0;
}

.login-form {
    background: white;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.van-cell-group) {
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
}

:deep(.van-cell) {
    padding: 8px 12px;
}

:deep(.van-field__label) {
    font-size: 14px;
    width: 70px; /* 减小标签宽度 */
}

:deep(.van-field__left-icon) {
    color: #666;
    font-size: 16px;
}

:deep(.van-field__control) {
    font-size: 14px;
}

.login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 13px;
}

.checkbox-text {
    color: #666;
}

.forgot-password {
    color: #1989fa;
    cursor: pointer;
    padding: 5px;
}

.forgot-password:hover {
    color: #0570db;
}

.login-button {
    margin-bottom: 15px;
}

:deep(.van-button) {
    height: 40px;
    font-size: 15px;
    font-weight: 500;
}

.register-link {
    text-align: center;
    font-size: 13px;
    color: #666;
}

.register-text {
    color: #1989fa;
    margin-left: 4px;
    cursor: pointer;
    padding: 3px;
}

.register-text:hover {
    color: #0570db;
}

/* 针对小屏幕的优化 */
@media screen and (max-width: 350px) {
    .login-container {
        padding: 10px;
    }

    .login-header {
        padding: 20px 0 15px;
    }

    .login-title {
        font-size: 22px;
    }

    .login-form {
        padding: 12px;
    }

    :deep(.van-cell) {
        padding: 6px 10px;
    }

    :deep(.van-field__label) {
        font-size: 13px;
        width: 65px;
    }

    .login-options {
        font-size: 12px;
    }

    :deep(.van-button) {
        height: 38px;
        font-size: 14px;
    }

    .register-link {
        font-size: 12px;
    }
}
</style>
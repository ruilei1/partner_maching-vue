<template>
    <div class="register-container">
        <div class="register-header">
            <h1 class="register-title">用户注册</h1>
            <p class="register-subtitle">欢迎加入我们</p>
        </div>

        <van-form @submit="onSubmit" class="register-form">
            <van-cell-group inset>
                <van-field
                        v-model="userAccount"
                        name="username"
                        label="账号"
                        placeholder="4-16位字母或数字"
                        :rules="accountRules"
                        left-icon="user-o"
                />
                <van-field
                        v-model="userPassword"
                        type="password"
                        name="password"
                        label="密码"
                        placeholder="6-20位字母数字组合"
                        :rules="passwordRules"
                        left-icon="lock"
                />
                <van-field
                        v-model="checkPassword"
                        type="password"
                        name="checkPassword"
                        label="确认密码"
                        placeholder="请再次输入密码"
                        :rules="checkPasswordRules"
                        left-icon="shield-o"
                />
                <van-field
                        v-model="planetCode"
                        name="planetCode"
                        label="星球编号"
                        placeholder="请输入星球编号"
                        :rules="planetCodeRules"
                        left-icon="location-o"
                />
            </van-cell-group>

            <div class="register-agreement">
                <van-checkbox v-model="agreeTerms" shape="square">
          <span class="agreement-text">
            同意
            <span class="agreement-link" @click="showTerms = true">用户协议</span>
            和
            <span class="agreement-link" @click="showPrivacy = true">隐私政策</span>
          </span>
                </van-checkbox>
            </div>

            <div class="register-button">
                <van-button
                        round
                        block
                        type="primary"
                        native-type="submit"
                        :loading="loading"
                        :disabled="!agreeTerms"
                >
                    {{ loading ? '注册中...' : '注册' }}
                </van-button>
            </div>

            <div class="login-link">
                <span>已有账号？</span>
                <span class="login-text" @click="toLogin">立即登录</span>
            </div>
        </van-form>

        <!-- 用户协议弹窗 -->
        <van-popup v-model:show="showTerms" round position="bottom" :style="{ height: '80%' }">
            <div class="agreement-content">
                <h2>用户协议</h2>
                <div class="agreement-text-content">
                    <p>这里是用户协议内容...</p>
                    <p>1. 用户注册时需提供真实信息</p>
                    <p>2. 用户需遵守相关法律法规</p>
                    <p>3. 平台有权对违规用户进行处理</p>
                </div>
                <van-button type="primary" block @click="showTerms = false">确定</van-button>
            </div>
        </van-popup>

        <!-- 隐私政策弹窗 -->
        <van-popup v-model:show="showPrivacy" round position="bottom" :style="{ height: '80%' }">
            <div class="agreement-content">
                <h2>隐私政策</h2>
                <div class="agreement-text-content">
                    <p>这里是隐私政策内容...</p>
                    <p>1. 我们会保护您的个人信息安全</p>
                    <p>2. 不会向第三方泄露您的隐私信息</p>
                    <p>3. 您有权管理自己的个人信息</p>
                </div>
                <van-button type="primary" block @click="showPrivacy = false">确定</van-button>
            </div>
        </van-popup>
    </div>



    <!-- 注册成功后的登录确认弹窗 -->
    <van-dialog
            v-model:show="showLoginConfirm"
            title="注册成功"
            show-cancel-button
            confirmButtonText="立即登录"
            cancelButtonText="稍后登录"
            @confirm="handleLogin"
            @cancel="handleCancelLogin"
    >
        <div class="login-confirm-content">
            <p>恭喜您注册成功！</p>
            <p>是否立即登录进入主页？</p>
        </div>
    </van-dialog>

</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import {showSuccessToast, showErrorToast, showInfoToast} from "../utils/toast.ts";
import myAxios from "../plugins/myAxios.ts";
// 导入 Pinia 用户信息存储
import { useUserStore } from '../plugins/userStore.ts'
const userStore = useUserStore()

const router = useRouter();
const userAccount = ref('');
const userPassword = ref('');
const checkPassword = ref('');
const planetCode = ref('');
const agreeTerms = ref(false);
const loading = ref(false);
const showTerms = ref(false);
const showPrivacy = ref(false);

// 账号校验规则
const accountRules = computed(() => [
    { required: true, message: '请输入账号' },
    {
        pattern: /^[a-zA-Z0-9]{4,16}$/,
        message: '4-16位字母或数字'
    }
]);

// 密码校验规则
const passwordRules = computed(() => [
    { required: true, message: '请输入密码' },
    {
        pattern: /^[a-zA-Z0-9@$!%*?&]{6,20}$/,
        message: '6-20位字母或数字组合'
    }
]);

// 确认密码校验规则
const checkPasswordRules = computed(() => [
    { required: true, message: '请确认密码' },
    {
        validator: (val: string) => val === userPassword.value,
        message: '密码不一致'
    }
]);

// 星球编号校验规则
const planetCodeRules = computed(() => [
    { required: true, message: '请输入星球编号' },
    {
        pattern: /^[A-Za-z0-9]{1,10}$/,
        message: '格式不正确'
    }
]);

// 添加新的响应式变量
const showLoginConfirm = ref(false);
const registerUserInfo = ref({
    userAccount: '',
    userPassword: ''
});



//注册按钮
const onSubmit = async () => {
    if (!agreeTerms.value) {
        showInfoToast('请先同意用户协议和隐私政策');
        return;
    }
    loading.value = true;
    try {
        const res = await myAxios.post('/user/register', {
            userAccount: userAccount.value,
            userPassword: userPassword.value,
            checkPassword: checkPassword.value,
            planetCode: planetCode.value
        });
        if (res.data.code === 0 && res.data.data !== null) {
            showSuccessToast('注册成功');

            // 保存注册信息用于自动登录
            registerUserInfo.value = {
                userAccount: userAccount.value,
                userPassword: userPassword.value
            };
            // 显示登录确认弹窗
            showLoginConfirm.value = true;

        } else {
            showErrorToast(res.data.description || '注册失败');
        }
    } catch (error) {
        showErrorToast('注册失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};


// 处理立即登录
const handleLogin = async () => {
    try {
        const res = await myAxios.post('/user/login', {
            userAccount: registerUserInfo.value.userAccount,
            userPassword: registerUserInfo.value.userPassword
        });

        if (res.data.code === 0 && res.data.data !== null) {
            // 更新 Pinia 状态
            userStore.login();
            localStorage.setItem('user', JSON.stringify(res.data.data));
            // 保存当前用户信息
            window.dispatchEvent(new Event('userLogin'));
            await router.push('/');
        } else {
            showErrorToast(res.data.description || '登录失败');
            // 登录失败时跳转到登录页面
            await router.push('/user/login');
        }
    } catch (error) {
        showErrorToast('登录失败，请稍后重试');
        // 登录失败时跳转到登录页面
        await router.push('/user/login');
    }
};

// 处理取消登录（跳转到登录页）
const handleCancelLogin = async () => {
    await router.push('/user/login');
};


const toLogin = () => {
    router.push('/user/login');
};
</script>

<style scoped>
.login-confirm-content {
    padding: 15px;
    text-align: center;
}

.login-confirm-content p {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
}


.register-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 15px;
    box-sizing: border-box;
}

.register-header {
    text-align: center;
    padding: 30px 0 20px;
}

.register-title {
    color: white;
    font-size: 24px;
    font-weight: 500;
    margin: 0 0 8px;
}

.register-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    margin: 0;
}

.register-form {
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

:deep(.van-field__error-message) {
    font-size: 12px;
}

.register-agreement {
    margin-bottom: 15px;
    font-size: 12px;
}

.agreement-text {
    color: #666;
}

.agreement-link {
    color: #1989fa;
    cursor: pointer;
}

.agreement-link:hover {
    color: #0570db;
}

.register-button {
    margin-bottom: 15px;
}

:deep(.van-button) {
    height: 40px;
    font-size: 15px;
    font-weight: 500;
}

.login-link {
    text-align: center;
    font-size: 13px;
    color: #666;
}

.login-text {
    color: #1989fa;
    margin-left: 4px;
    cursor: pointer;
}

.login-text:hover {
    color: #0570db;
}

.agreement-content {
    padding: 15px;
    height: 100%;
    box-sizing: border-box;
}

.agreement-content h2 {
    text-align: center;
    margin-bottom: 15px;
    font-size: 18px;
}

.agreement-text-content {
    height: calc(100% - 80px);
    overflow-y: auto;
    margin-bottom: 15px;
}

.agreement-text-content p {
    margin: 8px 0;
    line-height: 1.5;
    font-size: 13px;
    color: #333;
}

/* 针对小屏幕的优化 */
@media screen and (max-width: 350px) {
    .register-container {
        padding: 10px;
    }

    .register-header {
        padding: 20px 0 15px;
    }

    .register-title {
        font-size: 22px;
    }

    .register-form {
        padding: 12px;
    }

    :deep(.van-cell) {
        padding: 6px 10px;
    }

    :deep(.van-field__label) {
        font-size: 13px;
        width: 65px;
    }

    :deep(.van-button) {
        height: 38px;
        font-size: 14px;
    }
}
</style>

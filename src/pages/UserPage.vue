<template>
    <div class="user-page">
        <!-- 用户头像和基本信息区域 -->
        <div class="user-header">
            <div class="avatar-container">
                <div class="avatar-wrapper" @click="handleAvatarClick">
                    <img class="user-avatar" :src="user.avatarUrl" alt="用户头像" @error="handleAvatarError">
                    <div class="camera-icon">
                        <van-icon name="photograph"  size="20"/>
                    </div>
                </div>
                <div class="user-basic-info">
                    <h2 class="user-nickname">{{ user.username }}</h2>
                    <p class="user-account">账号：{{ user.userAccount }}</p>
                    <p class="user-planet">星球编号：{{ user.planetCode }}</p>
                    <p class="user-profile">个人简介：{{ user.profile }}</p>
                </div>
            </div>
        </div>

        <!-- 用户详细信息卡片 -->
        <div class="info-cards">
            <van-cell-group inset>
                <van-cell title="昵称" is-link to="/user/edit" :value="user.username" @click="toEdit('username','昵称',user.username)" icon="user-o" />
                <van-cell title="性别" is-link to="/user/edit" :value="parseInt(user.gender)===0?'男':'女'" @click="toEdit('gender','性别',user.gender)" icon="friends-o" />
                <van-cell title="电话" is-link to="/user/edit" :value="user.phone || '未设置'" @click="toEdit('phone','电话',user.phone)" icon="phone-o" />
                <van-cell title="邮箱" is-link to="/user/edit" :value="user.email || '未设置'" @click="toEdit('email','邮箱',user.email)" icon="envelop-o" />
                <van-cell title="注册时间" :value="formatDate(user.createTime)" icon="clock-o" />
                <van-cell title="我创建的队伍" is-link to="/team/create" />
                <van-cell title="我加入的队伍" is-link to="/team/join"  />
            </van-cell-group>

            <!-- 安全设置卡片 -->
            <van-cell-group inset class="security-group" v-if="isLogin">
                <van-cell title="账号安全" is-link to="#" icon="shield-o" value="修改密码" />
            </van-cell-group>

            <!-- 登录按钮 -->
            <div class="logout-section" v-if="!isLogin">
                <van-button round block type="primary" @click="handleLogin">登录</van-button>
            </div>

            <!-- 退出登录按钮 -->
            <div class="logout-section" v-if="isLogin">
                <van-button round block type="danger" @click="handleLogout">退出登录</van-button>
            </div>
        </div>

        <!-- 隐藏的文件上传组件 -->
        <van-uploader
                ref="uploader"
                v-model="fileList"
                :after-read="afterRead"
                :before-read="beforeRead"
                :max-count="1"
                style="display: none;"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import { showSuccessToast, showErrorToast,showInfoToast } from "../utils/toast.ts";
import { useUserStore } from "../plugins/userStore.ts";
import myAxios from "../plugins/myAxios.ts";
import type {UploaderAfterRead, UploaderFileListItem} from 'vant';

const userStore = useUserStore();
const router = useRouter();
const uploader = ref();

// 使用 computed 直接从 Pinia store 获取状态
const isLogin = computed(() => userStore.isLogin);

const fileList = ref<UploaderFileListItem[]>([]);

const user = ref({
    id: 9527,
    username: '测试数据',
    userAccount: '931',
    avatarUrl: 'https://img0.baidu.com/it/u=3389690878,2014733372&fm=253&app=138&f=JPEG?w=500&h=500',
    gender: "0",
    profile: "这是一段个人描述",
    phone: '430821',
    email: 'test@qq.com',
    planetCode: '931',
    createTime: new Date(),
});

// 点击头像触发上传
const handleAvatarClick = () => {
    if (isLogin.value) {
        uploader.value.chooseFile();
    } else {
        showInfoToast('请先登录');
    }
};

// 上传前检查
const beforeRead = (file: File | File[]) => {
    const targetFile = Array.isArray(file) ? file[0] : file;

    // 检查文件类型
    if (!targetFile.type.startsWith('image/')) {
        showErrorToast('请上传图片文件');
        return false;
    }

    // 检查文件大小 (限制为2MB)
    if (targetFile.size > 2 * 1024 * 1024) {
        showErrorToast('图片大小不能超过2MB');
        return false;
    }

    return true;
};

// 上传后处理
const afterRead: UploaderAfterRead = async (file) => {
    // 如果是多个文件上传，file 是数组
    const targetFile = Array.isArray(file) ? file[0] : file;

    if (!targetFile.file) return;

    try {
        const formData = new FormData();
        formData.append('file', targetFile.file);

        const res = await myAxios.post('/user/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.data.code === 0) {
            showSuccessToast('头像上传成功');
            user.value.avatarUrl = res.data.data;

            const currentUserStr = userStore.getUser();   //字符串
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                currentUser.avatarUrl = res.data.data;
                userStore.setUser(JSON.stringify(currentUser));
                localStorage.setItem('user', JSON.stringify(currentUser));
                // 使用现有的 /user/update 接口更新用户信息
                const response = await myAxios.post('/user/update', {
                    id: currentUser.id,
                    avatarUrl: currentUser.avatarUrl
                    // 只传递需要更新的字段和id
                });

            } else {
                showErrorToast('用户信息异常，请重新登录');
            }
        } else {
            showErrorToast(res.data.message || '头像上传失败');
        }
    } catch (error) {
        showErrorToast('头像上传失败');
        console.error('头像上传失败:', error);
    }
};

// 当进入页面时执行
onMounted(async () => {
    if(userStore.isLogin){
        // 发起请求获取当前用户信息
        try {
            const res = await myAxios.get('/user/current');
            if (res.data.code === 0 && res.data.data !== null) {
                // 使用 .value 更新响应式数据
                user.value = res.data.data;
                // 将字符串转换为 Date 对象
                if (res.data.data.createTime) {
                    user.value.createTime = new Date(res.data.data.createTime);
                }
            }else{
                // 清除无效的登录状态
                userStore.logout();
                showErrorToast('登录已过期，请重新登录');
            }
        } catch (error) {
            // 网络错误或服务端错误时也清除登录状态
            userStore.logout();
            showErrorToast('获取用户信息失败');
        }
    }
});

// 格式化日期函数
const formatDate = (dateString: string | Date) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\//g, '-');
};

const toEdit = (editKey:string, editName:string,currentValue:string) =>{
    router.push({
        path:'user/edit',
        query:{
            editKey,
            editName,
            currentValue,
        }
    })
}

// 处理头像加载失败
const handleAvatarError = (e: any) => {
    e.target.src = 'https://img0.baidu.com/it/u=3389690878,2014733372&fm=253&app=138&f=JPEG?w=500&h=500';
};

// 退出登录
async function handleLogout() {
    const res = await myAxios.post('/user/logout');
    if (res.data.code === 0 && !isLogin){
        showSuccessToast('退出登录成功');
    }
    // 使用 Pinia 的退出方法
    userStore.logout();
    // 不需要刷新页面，由于使用了 computed，状态变化会自动更新
    router.push('/')
}

// 处理登录跳转
const handleLogin = () => {
    router.push('/user/login');
};

</script>

<style scoped>
.user-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 20px;
}

.user-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 10px 30px 0px;
    color: white;
    position: relative;
    margin-bottom: 20px;
}

.avatar-container {
    display: flex;
    align-items: center;
    gap: 15px;
}

.avatar-wrapper {
    position: relative;
    cursor: pointer;
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    object-fit: cover;
}

.camera-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 15px;
    height: 15px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-basic-info {
    flex: 1;
}

.user-nickname {
    margin: 0 0 8px 0;
    font-size: 22px;
    font-weight: 500;
}

.user-account,
.user-planet {
    margin: 4px 0;
    font-size: 14px;
    opacity: 0.9;
}

.info-cards {
    padding: 0 15px;
}

.security-group {
    margin: 15px 0;
}

.logout-section {
    margin-top: 30px;
    padding: 0 15px;
}

:deep(.van-cell-group) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.van-cell) {
    padding: 12px 16px;
}

:deep(.van-cell__title) {
    font-size: 15px;
}

:deep(.van-cell__value) {
    font-size: 14px;
    color: #666;
}

:deep(.van-cell__value--link) {
    color: #1989fa;
}

:deep(.van-icon) {
    font-size: 18px;
    color: #667eea;
}

@media screen and (max-width: 350px) {
    .user-header {
        padding: 20px 15px 15px;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
    }

    .user-nickname {
        font-size: 20px;
    }

    .info-cards {
        padding: 0 10px;
    }

    .logout-section {
        padding: 0 10px;
    }
}
</style>

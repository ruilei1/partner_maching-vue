<template>
    <van-button  type="primary" v-if="userStore.isLogin" @click="domatch" size="small">匹配用户</van-button>

    <!-- 添加加载状态显示 -->
    <van-loading v-if="loading" size="24px" vertical class="loading-container" text-color="#0094ff">
        加载中...
    </van-loading>


    <!-- 数据加载完成后显示用户列表 -->
    <user-card-list
            v-for="user in UserList"
            :key="user.id"
            :user="user"
            card-type="home"
            button-type="primary"
            button-text="查看详情"
    />
    <van-empty v-if="UserList.length === 0" description="数据为空" />
</template>

<script setup>
import { ref ,onMounted } from 'vue';
import myAxios from "../plugins/myAxios.ts";
import { showSuccessToast, showErrorToast } from "../utils/toast.ts";
import UserCardList from "../components/UserCardList.vue"; // 引入组件
import { useUserStore } from "../plugins/userStore.ts";

const userStore = useUserStore();
const UserList = ref([]);
const loading = ref(false); // 添加加载状态变量

// 钩子函数，当页面加载好执行
onMounted(async () => {
    loading.value = true; // 开始加载
    try {
        const response = await myAxios.get('/user/recommend', {
            params: {
                pageSize : 8,
                pageNum : 1
            },
            withCredentials: true,
        })
                .then(function (response) {
                    showSuccessToast('请求成功');
                    return response.data?.data?.records;
                })
                .catch(function (error) {
                    showErrorToast('请求失败');
                    return []; // 失败时返回空数组
                });

        const userListData = response || [];
        userListData.forEach(user => {
            if (user.tags && typeof user.tags === 'string') {
                try {
                    user.tags = JSON.parse(user.tags);
                } catch (e) {
                    user.tags = [user.tags];
                }
            }
        });
        UserList.value = userListData;
    } finally {
        loading.value = false; // 加载完成
    }
});

//匹配用户
const domatch = async () =>{
    const num = 10;
    loading.value = true; // 开始加载
    try {
        const response = await myAxios.get('/user/match', {
            params: {
                num : num
            },
            withCredentials: true,
        })
                .then(function (response) {
                    showSuccessToast('匹配成功');
                    return response.data?.data;
                })
                .catch(function (error) {
                    showErrorToast('匹配失败');
                    return []; // 失败时返回空数组
                });

        const userListData = response || [];
        userListData.forEach(user => {
            if (user.tags && typeof user.tags === 'string') {
                try {
                    user.tags = JSON.parse(user.tags);
                } catch (e) {
                    user.tags = [user.tags];
                }
            }
        });
        UserList.value = userListData;
    } finally {
        loading.value = false; // 加载完成
    }
}

</script>


<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
</style>

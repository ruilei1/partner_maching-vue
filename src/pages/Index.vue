<template>
    <van-button  type="primary" v-if="userStore.isLogin" @click="domatch" size="small">匹配用户</van-button>

    <!-- 添加加载状态显示 -->
    <van-loading v-if="loading" size="24px" vertical class="loading-container" text-color="#0094ff">
        加载中...
    </van-loading>


    <!-- 数据加载完成后显示用户列表 -->
    <div class="user-list-container">
        <user-card-list
                v-for="user in UserList"
                :key="user.id"
                :user="user"
                card-type="home"
                button-type="primary"
                button-text="查看详情"
        />
        <van-empty v-if="UserList.length === 0" description="数据为空" />
    </div>

    <!-- 分页组件 - 固定在底部 -->
    <div class="pagination-container" v-if="userStore.isLogin">
        <van-pagination
                v-model="pageNum"
                :total-items="totalNum"
                :show-page-size="5"
                force-ellipses
                @change="doPageSearch"
        />
    </div>

</template>

<script setup>
import { ref ,onMounted } from 'vue';
import myAxios from "../plugins/myAxios.ts";
import {showSuccessToast, showErrorToast, showInfoToast} from "../utils/toast.ts";
import UserCardList from "../components/UserCardList.vue"; // 引入组件
import { useUserStore } from "../plugins/userStore.ts";
import {useRoute, useRouter} from 'vue-router';

const userStore = useUserStore();
const UserList = ref([]);
const loading = ref(false); // 添加加载状态变量
const router = useRouter();
const route = useRoute(); // 获取当前路由信息

const pageCount = ref(10)
const pageNum = ref(1)     // 当前页码，初始化为1
const totalNum = ref(125)  // 总条目数

// 钩子函数，当页面加载好执行
onMounted(async () => {
    if(!userStore.isLogin){
        showInfoToast("未登录,跳转到登录页",1000)
        await router.push("/user/login")
        return
    }
    loading.value = true; // 开始加载
    try {
        // 移除 .then() 和 .catch()，直接使用 await 处理响应
        const response = await myAxios.get('/user/recommend', {
            params: {
                pageSize : 5,
                pageNum : pageNum.value
            },
            withCredentials: true,
        });

        // 检查响应状态
        if (response.data.code === 0) {
            showSuccessToast('请求成功');
            const userListData = response.data?.data?.records || [];

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
            // 更新总条目数,总页数
            totalNum.value = response.data?.data?.total || 0;
            pageCount.value = response.data?.data?.pages || 0;
        } else {
            showErrorToast('请求失败');
            UserList.value = [];
        }
    } catch (error) {
        showErrorToast('请求失败');
        UserList.value = [];
        console.error('请求错误:', error);
    } finally {
        loading.value = false; // 加载完成
    }
});


//匹配用户
const domatch = async () => {
    const num = 10; //默认推荐10条心动用户
    loading.value = true; // 开始加载
    try {
        // 移除 .then() 和 .catch()，直接使用 await 处理响应
        const response = await myAxios.get('/user/match', {
            params: {
                num: num
            },
            withCredentials: true,
        });

        // 检查响应状态
        if (response.data.code === 0) {
            showSuccessToast('匹配成功');
            const userListData = response.data?.data || [];

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
        } else {
            showErrorToast('匹配失败');
            UserList.value = [];
        }
    } catch (error) {
        showErrorToast('匹配失败');
        UserList.value = [];
        console.error('匹配请求错误:', error);
    } finally {
        loading.value = false; // 加载完成
    }
}


//页面被激活时执行
onActivated( ()=>{
    if(!userStore.isLogin){
        showInfoToast("未登录,跳转到登录页",1000)
        router.push("/user/login")
    }
})


//分页查询
const doPageSearch = async () => {
    try {
        const response = await myAxios.get('/user/recommend', {
            params: {
                pageSize: 5,
                pageNum: pageNum.value
            },
            withCredentials: true,
        });

        if (response.data.code === 0) {
            showSuccessToast('请求成功');
            const userListData = response.data?.data?.records || [];

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
            // 更新总条目数,总页数
            totalNum.value = response.data?.data?.total || 0;
            pageCount.value = response.data?.data?.pages || 0;
        } else {
            showErrorToast('请求失败');
            UserList.value = [];
        }
    } catch (error) {
        showErrorToast('请求失败');
        UserList.value = [];
        console.error('分页请求错误:', error);
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
.user-list-container {
    padding-bottom: 50px; /* 为分页组件留出空间 */
}

.pagination-container {
    position: fixed;
    left: 0;
    right: 0;
    background: white;
    padding: 10px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
}
/* 移动端适配 */
@media screen and (max-width: 768px) {
    .user-list-container {
        padding-bottom: 50px; /* 移动端增加更多空间 */
    }

    .pagination-container {
        bottom: 50px; /* 保持与底部导航的距离 */
        padding: 0;
    }
}
</style>

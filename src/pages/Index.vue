<template>
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

// 钩子函数，当页面加载好执行
onMounted(async () => {

    const response = await myAxios.get('/user/recommend', {
        params: {
            pageSize : 8,
            pageNum : 1
        },
        withCredentials: true,    //允许携带 Cookie，后端可以接收到 Cookie，可以把数据存进redis缓存
    })
    .then(function (response) {
        //console.log('/user/recommend succeed', response);
        showSuccessToast('请求成功');
        return response.data?.data?.records;
    })
    .catch(function (error) {
        //console.log('/user/recommend failed', error);
        showErrorToast('请求失败');
    });

    const userListData = response;
    userListData.forEach(user => {
        // 如果 tags 是字符串格式，需要解析为数组
        if (user.tags && typeof user.tags === 'string') {
            try {
                user.tags = JSON.parse(user.tags);
            } catch (e) {
                user.tags = [user.tags];
            }
        }
    });
    UserList.value = userListData;
});



</script>


<style scoped>

</style>

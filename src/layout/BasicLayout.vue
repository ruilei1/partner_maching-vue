<template>
    <van-nav-bar
       :title="currentPageTitle || route.meta?.title || '默认标题'"
        left-arrow
        @click-left="onClickLeft"
        @click-right="onClickRight"
     >
        <template #right>
            <!-- 只有登录后才显示搜索按钮 -->
            <van-icon
                    v-if="userStore.isLogin"
                    name="search"
                    size="18"
            />
        </template>
    </van-nav-bar>
    <div id="content">
        <!-- 使用 keep-alive 包装 router-view -->
        <router-view v-slot="{ Component, route }">
            <keep-alive>
                <component
                        :is="Component"
                        v-if="route.meta.keepAlive"
                        :key="route.name"
                />
            </keep-alive>
            <component
                    :is="Component"
                    v-if="!route.meta.keepAlive"
                    :key="route.name"
            />
        </router-view>
    </div>

    <van-tabbar >
        <van-tabbar-item to="/" icon="home-o" name="index">主页</van-tabbar-item>
        <van-tabbar-item to="/team" icon="search" name="team">队伍</van-tabbar-item>
        <van-tabbar-item to="/user" icon="friends-o" name="user">个人</van-tabbar-item>
    </van-tabbar>


</template>

<script setup>
import { ref ,watch,onMounted ,onUnmounted} from 'vue';
import { useRouter,useRoute } from 'vue-router';
import { useUserStore } from '../plugins/userStore.ts'
const userStore = useUserStore()
const router = useRouter();
const route = useRoute(); // 获取当前路由信息

// 定义一个响应式变量来存储页面内标题
const currentPageTitle = ref('');

// 监听路由变化，只设置页面内标题，不改变浏览器标题
watch(route, (to) => {
    if (to.meta && to.meta.title) {
        currentPageTitle.value = to.meta.title;
    } else {
        currentPageTitle.value = '默认标题';
    }
}, { immediate: true });

// 监听自定义事件来更新用户状态
const handleUserStateChange = () => {
    userStore.checkLoginStatus();
};
// 组件挂载时添加事件监听
onMounted(() => {
    window.addEventListener('userLogin', handleUserStateChange);
    window.addEventListener('userLogout', handleUserStateChange);
    // 初始化时检查一次登录状态
    userStore.checkLoginStatus();
});
// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener('userLogin', handleUserStateChange);
    window.removeEventListener('userLogout', handleUserStateChange);
});

const onClickLeft = () => {
    router.back();
}
const onClickRight = () => {
    router.push('/search')
}

</script>

<style scoped>
#content {
    padding-bottom: 50px;
}
</style>
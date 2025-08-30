<template>
    <div id="teamPage">
        <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch"/>
        <van-tabs v-model:active="active" @change="onTabChange">
            <van-tab title="公开" name="public"></van-tab>
            <van-tab title="加密" name="private"></van-tab>
        </van-tabs>
        <div style="margin-bottom: 16px"></div>
        <van-button  class="add-button" type="primary" v-if="userStore.isLogin" @click="doJoinTeam" size="small">创建队伍</van-button>
        <team-card-list :teamList="teamList" />
        <van-empty v-if="teamList.length === 0" description="没有搜索结果" />
    </div>
</template>

<script setup lang="ts">
import {onActivated, onMounted, onUnmounted, ref} from 'vue';
import {showErrorToast, showInfoToast} from "../utils/toast.ts";
import myAxios from "../plugins/myAxios.ts"; // 需要导入 axios 实例
// 导入 Pinia 用户信息存储
import {useUserStore} from '../plugins/userStore.ts'
import {useRoute, useRouter} from 'vue-router';
import TeamCardList from "../components/TeamCardList.vue";

const userStore = useUserStore()
const router = useRouter();
const route = useRoute(); // 获取当前路由信息

const doJoinTeam =()=>{
    if(!userStore.isLogin){
        showInfoToast("未登录,跳转到登录页",1000)
        router.push("/user/login")
    }else {
        router.push({
            path: '/team/add'
        })
    }
}
const teamList = ref([]);

/**
 * 获取队伍列表
 * @param val
 * @param status
 * @returns {Promise<void>}
 */
const listTeam = async (val='' ,status = 0)=>{
    const res = await myAxios.get('/team/list',{
        params:{
            searchText:val,
            pageNum:1,
            status,
        },
    });
    if(res.data.code===0 && res.data){
        teamList.value = res.data.data;
    }else{
        showErrorToast("加载队伍失败，请刷新")
    }
}

const active = ref('public')
//搜索框内容
const searchText = ref("")
//搜索
const onSearch = (val) => {
    listTeam(val);
};

/**
 * 切换状态查询
 */
const onTabChange = (name) =>{
    //查询公开队伍
    if(name === 'public'){
        listTeam(searchText.value,0);
    }else{
        listTeam(searchText.value,2);
    }
}


//页面加载时触发
onMounted( ()=>{
    if(!userStore.isLogin){
        showInfoToast("未登录,跳转到登录页",1000)
        router.push("/user/login")
        return
    }
    listTeam('');
    // 监听队伍列表更新事件
    window.addEventListener('teamListUpdated', ()=>listTeam);
})

// 当组件被激活时触发（从缓存中恢复）
onActivated(() => {
    if(!userStore.isLogin){
        showInfoToast("未登录,跳转到登录页",1000)
        router.push("/user/login")
    }else{
        listTeam(searchText.value)
    }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener('teamListUpdated', listTeam);
})
</script>

<style scoped>
#teamPage {
    padding: 0 8px;
}
.add-button{
    position: fixed;
    bottom: 60px;
    width: 50px;
    right: 12px;
    height: 50px;
    border-radius: 50px;
    z-index: 1;
}
</style>
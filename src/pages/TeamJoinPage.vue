<template>
    <div id="teamPage">
        <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch"/>
        <van-button  type="primary" v-if="userStore.isLogin" @click="doJoinTeam" size="small">加入队伍</van-button>
        <team-card-list :teamList="teamList" />
        <van-empty v-if="teamList.length === 0" description="没有搜索结果" />
    </div>
</template>

<script setup>
import { ref,onMounted ,onActivated} from 'vue';
import {showSuccessToast, showErrorToast, showCustomToast, showInfoToast} from "../utils/toast.ts";
import myAxios from "../plugins/myAxios.ts"; // 需要导入 axios 实例
// 导入 Pinia 用户信息存储
import { useUserStore } from '../plugins/userStore.ts'
const userStore = useUserStore()
import { useRouter,useRoute } from 'vue-router';
import TeamCardList from "../components/TeamCardList.vue";
const router = useRouter();
const route = useRoute(); // 获取当前路由信息


const doJoinTeam =()=>{
    if(!userStore.isLogin){
        showInfoToast("未登录,跳转到登录页",1000)
        router.push("/user/login")
    }else {
        router.push({
            path: '/team'
        })
    }
}
const teamList = ref([]);

/**
 * 获取队伍列表
 * @param val
 * @returns {Promise<void>}
 */
const listTeam = async (val='')=>{
    const res = await myAxios.get('/team/list/my/join',{
        params:{
            searchText:val,
            pageNum:1,
        },
    });
    if(res.data.code===0 && res.data){
        teamList.value = res.data.data;
    }else{
        showErrorToast("加载队伍失败，请刷新")
    }
}

//搜索框内容
const searchText = ref("")
//搜索
const onSearch = (val) => {
    listTeam(val);
};


//页面加载时触发
onMounted( ()=>{
    listTeam('');
})
// 当组件被激活时触发（从缓存中恢复）
onActivated(() => {
    listTeam(searchText.value)
})
</script>

<style scoped>
#teamPage {
    padding: 0 8px;
}
</style>
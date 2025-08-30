<template>
    <user-card-list
            v-for="user in UserList"
            :key="user.id"
            :user="user"
            card-type="search"
            button-type="success"
            button-text="立即联系"
    />
    <van-empty v-if="UserList.length === 0" description="没有搜索结果" />
</template>

<script setup>
import {onMounted, ref} from 'vue';

import {useRoute} from 'vue-router';
import myAxios from "../plugins/myAxios.ts";
import {showErrorToast, showSuccessToast} from "../utils/toast.ts";
import UserCardList from "../components/UserCardList.vue"; // 引入组件
const route = useRoute();   // 调用 useRoute() 得到当前路由信息

const UserList = ref([]);


// 处理查询参数，获取标签数组
const getTagList = () => {
    const tagParam = route.query.tag;

    if (!tagParam) return [];

    // 如果是数组格式，直接返回
    if (Array.isArray(tagParam)) {
        return tagParam;
    }

    // 如果是字符串
    if (typeof tagParam === 'string') {
        // 检查是否为 JSON 数组字符串
        if (tagParam.startsWith('[') && tagParam.endsWith(']')) {
            try {
                return JSON.parse(tagParam);
            } catch (e) {
                // 如果不是有效的 JSON，当作单个标签处理
                return [tagParam];
            }
        }
        // 单个标签
        return [tagParam];
    }

    return [];
};

const tags = getTagList();

// 钩子函数，当页面加载好执行
onMounted(() => {
    // 确保有标签才发起请求
    if (tags && tags.length > 0) {
        myAxios.get('/user/search/tags', {
            params: {
                tagNameList: tags
            },
            paramsSerializer: (params) => {
                // 手动构建查询字符串，避免使用索引
                const parts = [];
                params.tagNameList.forEach(tag => {
                    parts.push(`tagNameList=${encodeURIComponent(tag)}`);
                });
                return parts.join('&');
            }
        })
        .then(function (response) {
            //console.log('/user/search/tags succeed', response);
            showSuccessToast('请求成功');

            // 处理返回的数据
            const userData = response.data?.data || [];
            userData.forEach(user => {
                // 如果 tags 是字符串格式，需要解析为数组
                if (user.tags && typeof user.tags === 'string') {
                    try {
                        user.tags = JSON.parse(user.tags);
                    } catch (e) {
                        user.tags = [user.tags];
                    }
                }
            });

            UserList.value = userData;
        })
        .catch(function (error) {
            //console.log('/user/search/tags error', error);
            showErrorToast('请求失败');
        });
    }
});



</script>


<style scoped>

</style>

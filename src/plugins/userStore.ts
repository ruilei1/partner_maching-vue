import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const isLogin = ref(!!localStorage.getItem('user'))

    // 添加推荐用户列表缓存相关状态
    const recommendUserList = ref<any[]>([])
    const recommendUserListLastFetch = ref<number>(0)

    function login() {
        isLogin.value = true
    }

    function logout() {
        isLogin.value = false
        localStorage.removeItem('user')
        // 退出登录时清除推荐列表缓存
        clearRecommendUserListCache()
    }

    // 添加检查登录状态的方法
    function checkLoginStatus() {
        isLogin.value = !!localStorage.getItem('user')
    }

    //返回当前登录用户
    function getUser() {
        return localStorage.getItem('user')
    }

    //更新当前登录用户
    function setUser(user: string) {
        localStorage.setItem('user', user)
    }
    // 设置推荐用户列表
    function setRecommendUserList(users: any[]) {
        //console.log('setRecommendUserList')
        recommendUserList.value = users
        recommendUserListLastFetch.value = Date.now()
    }

    // 获取推荐用户列表（如果缓存有效）
    function getRecommendUserList() {
        //console.log('getRecommendUserList')
        // 缓存有效期5分钟
        if (recommendUserList.value.length > 0 &&
            Date.now() - recommendUserListLastFetch.value < 5 * 60 * 1000) {
            return recommendUserList.value
        }
        return null
    }

    // 清除推荐用户列表缓存
    function clearRecommendUserListCache() {
        //console.log('clearRecommendUserListCache')
        recommendUserList.value = []
        recommendUserListLastFetch.value = 0
    }

    return {
        isLogin,
        login,
        logout,
        checkLoginStatus,
        getUser,
        setUser,
        setRecommendUserList,
        getRecommendUserList,
        clearRecommendUserListCache
    }

})

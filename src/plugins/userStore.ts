import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const LOGIN_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7天过期时间

    const isLogin = ref(checkStoredLoginStatus())

    // 添加推荐用户列表缓存相关状态
    const recommendUserList = ref<any[]>([])
    const recommendUserListLastFetch = ref<number>(0)

    // 检查存储的登录状态是否有效
    function checkStoredLoginStatus() {
        const userStr = localStorage.getItem('user')
        if (!userStr) return false
        
        try {
            const userData = JSON.parse(userStr)
            // 检查是否有登录时间戳
            if (userData.loginTimestamp) {
                // 检查是否过期
                const now = Date.now()
                if (now - userData.loginTimestamp > LOGIN_EXPIRY_TIME) {
                    // 已过期，清除存储的用户信息
                    localStorage.removeItem('user')
                    return false
                }
                return true
            }
            // 如果没有时间戳，认为是旧数据，清除
            localStorage.removeItem('user')
            return false
        } catch (e) {
            // 解析失败，清除存储的用户信息
            localStorage.removeItem('user')
            return false
        }
    }

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
        isLogin.value = checkStoredLoginStatus()
    }

    //返回当前登录用户
    function getUser() {
        return localStorage.getItem('user')
    }

    //更新当前登录用户
    function setUser(user: string) {
        try {
            const userData = JSON.parse(user)
            // 添加登录时间戳
            userData.loginTimestamp = Date.now()
            localStorage.setItem('user', JSON.stringify(userData))
        } catch (e) {
            // 如果解析失败，直接存储
            localStorage.setItem('user', user)
        }
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
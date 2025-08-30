import axios from "axios";

//统一管理 API 地址
const myaxios = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true, // 默认携带 Cookie
});

// 添加请求拦截器
myaxios.interceptors.request.use(function (config) {
    //console.log("这是一个请求", config)
    // 确保发送请求时携带凭证
    config.withCredentials = true;
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
myaxios.interceptors.response.use(function (response) {
    //console.log("这是一个响应", response)
    //未登录直接跳转到登录页
    // if(response?.data?.code === 40100){
    //     const redirectUrl = window.location.href;
    //     window.location.href = `/user/login?redirect=${redirectUrl}`;
    // }
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default myaxios;

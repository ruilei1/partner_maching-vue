import {createApp} from 'vue'
import App from './App.vue'
import Vant from 'vant';
import {createPinia} from 'pinia'
// 添加这一行来引入 Vant 的样式文件
// @ts-ignore
import 'vant/lib/index.css'; // <- 这一行很重要
// @ts-ignore
import * as VueRouter from 'vue-router';
import routes from './config/router';

const app = createApp(App);

//全局一次性注册所有 Vant 组件：
app.use(Vant);
const router = VueRouter.createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: VueRouter.createWebHashHistory(),
    routes, // `routes: routes` 的缩写
})
app.use(createPinia())
app.use(router)

app.mount('#app')

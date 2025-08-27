import Index from '../pages/Index.vue';
import Team from '../pages/TeamPage.vue';
import User from '../pages/UserPage.vue';
import searchPage from '../pages/searchPage.vue';
import UserEditPage from '../pages/UserEditPage.vue'
import SearchResultPage from "../pages/SearchResultPage.vue";
import UserLoginView from "../pages/UserLoginPage.vue"
import UserRegisterPage from "../pages/UserRegisterPage.vue";
import TeamAddPage from "../pages/TeamAddPage.vue";
import TeamUpdatePage from "../pages/TeamUpdatePage.vue";
import TeamJoinPage from '../pages/TeamJoinPage.vue';
import TeamCreatePage from "../pages/TeamCreatePage.vue";

// 路由配置
const routes = [
    {
        path: '/',
        component: Index,
        meta:{
            title:'首页',
            keepAlive: true
        }
    },
    { path: '/team',   component: Team , meta:{title:'团队',keepAlive: true} },
    { path: '/team/add' , component: TeamAddPage, meta: {title: '创建队伍'}},
    { path: '/team/update' ,component: TeamUpdatePage, meta: {title: '修改队伍'}},
    { path: '/team/join' ,component: TeamJoinPage, meta: {title: '我加入的队伍'}},
    { path: '/team/create' ,component: TeamCreatePage, meta: {title: '我创建的队伍'}},
    { path: '/user',    component: User , meta:{title:'个人中心'}},
    { path: '/search',  component: searchPage , meta:{title:'搜索'}},
    { path: '/user/edit', component:UserEditPage , meta:{title:'编辑用户信息'}},
    { path: '/user/list', component: SearchResultPage, meta:{title:'用户列表'}},
    { path: '/user/login', component: UserLoginView, meta:{title:'用户登录'}},
    { path: '/user/register', component: UserRegisterPage, meta:{title:'用户注册'}},
]
//导出
export default routes;
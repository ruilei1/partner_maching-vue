<template>
    <div id="teamPage">
        <van-form @submit="onSubmit" class="login-form">
            <van-cell-group inset>
                <van-field
                        v-model="addTeamData.name"
                        name="name"
                        label="队伍名"
                        placeholder="请输入队伍名"
                        :rules="[{ required: true, message: '请输入队伍名' }]"
                        left-icon="friends-o"
                />
                <van-field
                        v-model="addTeamData.description"
                        rows="2"
                        autosize
                        label="队伍描述"
                        type="textarea"
                        placeholder="请输入队伍描述"
                        left-icon="records-o"
                />
                <van-field
                        is-link
                        readonly
                        name="datePicker"
                        label="过期时间"
                        :value="formattedExpireTime"
                        :placeholder="addTeamData.expireTime ?? '点击选择时间'"
                        @click="showPicker = true"
                />
                <van-popup v-model:show="showPicker" position="bottom">
                    <van-date-picker
                            v-model="currentDate"
                            type="date"
                            title="过期时间"
                            :min-date="minDate"
                            @confirm="onConfirm"
                            @cancel="showPicker = false"
                    />
                </van-popup>
                <van-field name="stepper" label="最大人数" >
                    <template #input>
                        <van-stepper v-model="addTeamData.maxNum" max="10" min="3"/>
                    </template>
                </van-field>
                <van-field name="radio" label="队伍状态">
                    <template #input>
                        <van-radio-group v-model="addTeamData.status" direction="horizontal">
                            <van-radio name="0">公开</van-radio>
                            <van-radio name="1">私有</van-radio>
                            <van-radio name="2">加密</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
                <van-field
                        v-if="addTeamData.status==='2'"
                        v-model="addTeamData.password"
                        type="password"
                        name="password"
                        label="密码"
                        placeholder="请输入密码"
                        :rules="[{ required: true, message: '请输入密码' }]"
                        left-icon="lock"
                />
            </van-cell-group>
            <div style="margin: 16px;">
                <van-button round block type="primary" native-type="submit">
                    提交
                </van-button>
            </div>
        </van-form>
    </div>

</template>

<script setup>
import { ref,computed } from 'vue';
import {showSuccessToast, showErrorToast, showCustomToast, showInfoToast} from "../utils/toast.ts";
import myAxios from "../plugins/myAxios.ts"; // 需要导入 axios 实例
// 导入 Pinia 用户信息存储
import { useUserStore } from '../plugins/userStore.ts'
const userStore = useUserStore()
import { useRouter,useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute(); // 获取当前路由信息

// 获取今天的日期
const today = new Date();
const todayArray = [today.getFullYear(), today.getMonth() + 1, today.getDate()];

const initFormData = {
    "name": "",
    "description": "",
    "expireTime":  todayArray, // 初始化为今天的日期数组,
    "maxNum": 3,
    "password": "",
    "status": "0", // 前端使用字符串（与 radio 组件匹配）
}
//需要用户填写的表单数据
const addTeamData = ref({...initFormData});
const minDate = new Date()
//展示日期选择器
const showPicker = ref(false)

// 为 date-picker 组件创建独立的响应式数据，初始化为今天
const currentDate = ref([...todayArray]);

// 格式化显示已选择的日期
const formattedExpireTime = computed(() => {
    if (addTeamData.value.expireTime) {
        const [year, month, day] = addTeamData.value.expireTime;
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    return '';
});

// 日期选择确认事件
const onConfirm = () => {
    addTeamData.value.expireTime = [...currentDate.value]; // 复制数组而不是引用
    showPicker.value = false;
};

// 提交表单的方法
const onSubmit = async () => {
    try {
        // 准备提交数据，转换 status 为整数
        const submitData = {
            ...addTeamData.value,
            status: parseInt(addTeamData.value.status), // 转换为整数
            // 如果队伍状态不是加密，密码设置为空
            password: addTeamData.value.status !== '2' ? '' : addTeamData.value.password,
            // 如果需要将日期转换为 Date 对象，可以在这里处理
            expireTime: addTeamData.value.expireTime ?
                    new Date(addTeamData.value.expireTime[0],
                            addTeamData.value.expireTime[1] - 1,
                            addTeamData.value.expireTime[2]) :
                    null
        };
        //console.log('提交数据:', submitData);
        //todo 前端校验数据

        const res = await myAxios.post('/team/add', submitData);
        if (res.data.code === 0 && res.data) {
          showSuccessToast('添加成功');
          router.push({
              path:'/team',
              replace:true,
          });
        }else{
            showErrorToast(res.data.description ?? '添加失败')
        }
    } catch (error) {
        showErrorToast('创建失败');
        console.error(error);
    }
};
</script>

<style scoped>

</style>
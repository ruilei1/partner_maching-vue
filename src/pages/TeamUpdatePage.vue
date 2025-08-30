<template>
    <div id="teamPage">
        <van-form @submit="onSubmit">
            <van-cell-group inset>
                <van-field
                        v-model="addTeamData.name"
                        name="name"
                        label="队伍名"
                        placeholder="请输入队伍名"
                        :rules="[{ required: true, message: '请输入队伍名' }]"
                />
                <van-field
                        v-model="addTeamData.description"
                        rows="4"
                        autosize
                        label="队伍描述"
                        type="textarea"
                        placeholder="请输入队伍描述"
                />
                <van-field
                        is-link
                        readonly
                        name="datePicker"
                        label="过期时间"
                        :value="formattedExpireTime"
                        :placeholder="addTeamData.expireTime ?? '点击选择过期时间'"
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
                        v-if="Number(addTeamData.status) === 2"
                        v-model="addTeamData.password"
                        type="password"
                        name="password"
                        label="密码"
                        placeholder="请输入队伍密码"
                        :rules="[{ required: true, message: '请填写密码' }]"
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

import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import myAxios from "../plugins/myAxios.ts";
import {showErrorToast, showSuccessToast} from "../utils/toast.ts";

const router = useRouter();
const route = useRoute();

// 展示日期选择器
const showPicker = ref(false);
const minDate = new Date();

const currentDate = ref();
// 格式化显示已选择的日期
const formattedExpireTime = computed(() => {
    if (addTeamData.value.expireTime) {
        const [year, month, day] = addTeamData.value.expireTime;
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    return '';
});
const onConfirm = () => {
    addTeamData.value.expireTime = [...currentDate.value]; // 复制数组而不是引用
    showPicker.value = false;
};

const addTeamData = ref({});



const id = route.query.teamId;
//获取之前的队伍信息
onMounted(async () => {
    if (id <= 0) {
        showErrorToast("加载队伍失败，请重试");
        return;
    }
    const res = await myAxios.get("/team/get", {
        params: {
            id:id
        }
    });
    if (res.data.code === 0) {
        addTeamData.value = res.data.data;
    } else {
        showErrorToast("加载队伍失败，请重试")
    }
})


// 提交
const onSubmit = async () => {
    try {
        let expireTimeValue = null;

        // 只有当 expireTime 存在且有效时才转换
        if (addTeamData.value.expireTime) {
            try {
                if (Array.isArray(addTeamData.value.expireTime)) {
                    // 数组格式 [年, 月, 日]
                    expireTimeValue = new Date(
                            addTeamData.value.expireTime[0],
                            addTeamData.value.expireTime[1] - 1, // 月份需要减1
                            addTeamData.value.expireTime[2]
                    );
                } else if (typeof addTeamData.value.expireTime === 'string') {
                    // 字符串格式
                    expireTimeValue = new Date(addTeamData.value.expireTime);
                } else if (addTeamData.value.expireTime instanceof Date) {
                    // Date 对象
                    expireTimeValue = addTeamData.value.expireTime;
                }

                // 检查日期是否有效
                if (isNaN(expireTimeValue.getTime())) {
                    expireTimeValue = null;
                }
            } catch (e) {
                console.error('日期转换错误:', e);
                expireTimeValue = null;
            }
        }

        const submitData = {
            ...addTeamData.value,
            id: id,
            status: parseInt(addTeamData.value.status),
            password: addTeamData.value.status !== '2' ? '' : addTeamData.value.password,
            expireTime: expireTimeValue
        };

        const res = await myAxios.post("/team/update", submitData);
        if (res.data.code === 0) {
            showSuccessToast("更新成功");
            router.push({
                path: '/team',
                replace: true,
            });
        } else {
            showErrorToast(res.data.description || "更新失败");
        }
    } catch (error) {
        showErrorToast('更新失败');
        console.error(error);
    }
};



</script>

<style scoped>

</style>
<template>
    <div class="user-edit-page">
        <div class="edit-form-container">
            <van-form @submit="onSubmit">
                <van-cell-group inset>
                    <van-field
                            v-if="editUser.editKey !== 'gender'"
                            v-model="editUser.currentValue"
                            :name="editUser.editKey"
                            :label="editUser.editName"
                            :placeholder="`请输入${editUser.editName}`"
                            :rules="[{ required: true, message: `请填写${editUser.editName}` }]"
                    />
                    <!-- 性别选择器 -->
                    <van-field
                            v-else
                            v-model="genderDisplayText"
                            :name="editUser.editKey"
                            :label="editUser.editName"
                            is-link
                            readonly
                            @click="showGenderPicker = true"
                            :rules="[{ required: true, message: '请选择性别' }]"
                    />
                </van-cell-group>

                <div class="submit-button-container">
                    <van-button round block type="primary" native-type="submit" :loading="loading">
                        保存修改
                    </van-button>

                    <van-button round block class="cancel-button" @click="onClickLeft">
                        取消
                    </van-button>
                </div>
            </van-form>
        </div>

        <!-- 性别选择弹窗 -->
        <van-popup v-model:show="showGenderPicker" round position="bottom">
            <van-picker
                    title="选择性别"
                    :columns="genderColumns"
                    @confirm="onGenderConfirm"
                    @cancel="showGenderPicker = false"
            />
        </van-popup>
    </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {showSuccessToast, showErrorToast} from "../utils/toast.ts";
import myAxios from "../plugins/myAxios.ts";
import {useUserStore} from "../plugins/userStore.js";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const showGenderPicker = ref(false);

// 性别选项
const genderColumns = [
    {text: '男', value: 0},
    {text: '女', value: 1}
];

const editUser = ref({
    editKey: route.query.editKey,
    currentValue: route.query.currentValue,
    editName: route.query.editName,
});

// 计算属性：根据当前性别值显示对应的文本
const genderDisplayText = computed(() => {
    if (editUser.value.editKey === 'gender') {
        return editUser.value.currentValue === '1' ? '女' : '男';
    }
    return '';
});

const onClickLeft = () => {
    router.back();
};

// 性别选择确认
const onGenderConfirm = ({selectedValues}) => {
    editUser.value.currentValue = selectedValues[0].toString();
    showGenderPicker.value = false;
};

const onSubmit = async (values) => {
    loading.value = true;

    try {
        // 获取当前登录用户
        const currentUser = JSON.parse(userStore.getUser());

        if (!currentUser) {
            showErrorToast('用户未登录');
            return;
        }

        // 提交修改到后台
        const res = await myAxios.post('/user/update', {
            'id': currentUser.id,
            [editUser.value.editKey]: editUser.value.currentValue
        });

        if (res.data.code === 0) {
            showSuccessToast('修改成功');

            // 更新本地存储的用户信息，保留登录时间戳
            const updatedUser = {
                ...currentUser,
                [editUser.value.editKey]: editUser.value.currentValue,
                loginTimestamp: currentUser.loginTimestamp || Date.now()
            };
            userStore.setUser(JSON.stringify(updatedUser));
            localStorage.setItem('user', JSON.stringify(updatedUser));
            router.back();
        } else {
            showErrorToast(res.data.message || '修改失败');
        }
    } catch (error) {
        showErrorToast('网络错误，请稍后重试');
        console.error('更新用户信息失败:', error);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.user-edit-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    /* 添加顶部内边距，与导航栏高度一致 */
    padding-top: 46px; /* van-nav-bar 的默认高度 */
}

:deep(.van-nav-bar) {
    background-color: #fff;
}

:deep(.van-nav-bar__title) {
    color: #323233;
    font-weight: 600;
}

:deep(.van-nav-bar__text) {
    color: #1989fa;
}

:deep(.van-cell-group) {
    margin: 15px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.van-field__label) {
    font-weight: 500;
}

.submit-button-container {
    margin: 30px 15px 15px;
}

.cancel-button {
    margin-top: 15px;
    background-color: #ffffff;
    color: #646566;
    border: 1px solid #e5e5e5;
}

.cancel-button:hover {
    background-color: #f7f8fa;
}
</style>

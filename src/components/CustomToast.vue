<template>
    <div v-if="visible" class="custom-toast" :class="typeClass">
        {{ message }}
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 定义 props 类型
interface Props {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'info',
    duration: 2000
});

const visible = ref(true);
const timer = ref<number | null>(null);

// 根据类型设置样式类
const typeClass = computed(() => {
    return `custom-toast--${props.type}`;
});

// 自动关闭
onMounted(() => {
    timer.value = window.setTimeout(() => {
        visible.value = false;
    }, props.duration);
});

// 清除定时器
onUnmounted(() => {
    if (timer.value) {
        clearTimeout(timer.value);
    }
});
</script>

<style scoped>
.custom-toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    z-index: 9999;
    font-size: 14px;
    text-align: center;
    min-width: 120px;
    animation: fadeInOut 0.3s ease-in-out;
}

.custom-toast--success {
    background-color: rgba(91, 150, 152, 0.9);
}

.custom-toast--error {
    background-color: rgba(198, 69, 69, 0.9);
}

.custom-toast--warning {
    background-color: rgba(181, 124, 19, 0.9);
}

.custom-toast--info {
    background-color: rgba(51, 50, 50, 0.8);
}

@keyframes fadeInOut {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
}
</style>

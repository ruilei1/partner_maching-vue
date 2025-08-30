import {createVNode, render} from 'vue';
import CustomToast from '../components/CustomToast.vue';

interface ToastOptions {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

// 创建一个容器元素
const toastContainer = document.createElement('div');
document.body.appendChild(toastContainer);

let toastCount = 0;

export function showCustomToast(options: string | ToastOptions) {
    // 处理字符串参数的情况
    const opts: ToastOptions = typeof options === 'string' ? { message: options } : options;

    // 默认值
    const {
        message,
        type = 'info',
        duration = 2000
    } = opts;

    // 创建 VNode
    const vnode = createVNode(CustomToast, {
        message,
        type,
        duration
    });

    // 增加计数器确保唯一性
    toastCount++;
    const toastId = `custom-toast-${toastCount}`;

    // 渲染到容器
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastContainer.appendChild(toastElement);

    render(vnode, toastElement);

    // 定时移除
    setTimeout(() => {
        render(null, toastElement);
        toastContainer.removeChild(toastElement);
    }, duration + 300); // 多留一点时间给动画

    return {
        close: () => {
            render(null, toastElement);
            if (toastContainer.contains(toastElement)) {
                toastContainer.removeChild(toastElement);
            }
        }
    };
}

// 便捷方法
export const showToast = showCustomToast;

export function showSuccessToast(message: string, duration?: number) {
    return showCustomToast({
        message,
        type: 'success',
        duration
    });
}

export function showErrorToast(message: string, duration?: number) {
    return showCustomToast({
        message,
        type: 'error',
        duration: duration || 2000
    });
}

export function showWarningToast(message: string, duration?: number) {
    return showCustomToast({
        message,
        type: 'warning',
        duration
    });
}

export function showInfoToast(message: string, duration?: number) {
    return showCustomToast({
        message,
        type: 'info',
        duration
    });
}

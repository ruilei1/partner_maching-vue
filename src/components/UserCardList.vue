<template>
    <van-card
            class="user-card"
            :class="[cardType]"
            :desc="user.profile"
            :title="`${user.username} (${user.planetCode})`"
            :thumb="user.avatarUrl"
            :tag="user.gender === 1 ? '女' : '男'"
    >
        <template #tags>
            <van-tag
                    plain
                    type="primary"
                    v-for="tag in user.tags"
                    :key="tag"
                    class="user-tag"
            >
                {{ tag }}
            </van-tag>
        </template>
        <template #footer>
            <van-button
                    size="mini"
                    :type="buttonType"
                    class="contact-button"
            >
                {{ buttonText }}
            </van-button>
        </template>
    </van-card>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';

interface User {
    id: number;
    username: string;
    planetCode: string;
    avatarUrl: string;
    gender: number;
    profile?: string;
    tags: string[];
}

const props = withDefaults(defineProps<{
    user: User;
    cardType?: 'default' | 'home' | 'search';
    buttonType?: 'primary' | 'success' | 'danger';
    buttonText?: string;
}>(), {
    cardType: 'default',
    buttonType: 'primary',
    buttonText: '联系我'
});
</script>

<style scoped>
.user-card {
    margin-bottom: 16px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.user-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1989fa, #07c160);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.user-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
}

.user-card:hover::before {
    transform: scaleX(1);
}

.user-card.home {
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%);
}

.user-card.search {
    background: linear-gradient(135deg, #f5fff0 0%, #e6ffe6 100%);
}

.user-card.home::before {
    background: linear-gradient(90deg, #1989fa, #3d91ff);
}

.user-card.search::before {
    background: linear-gradient(90deg, #07c160, #00d663);
}

.user-tag {
    margin-right: 6px;
    margin-top: 6px;
    border-radius: 12px;
    font-size: 12px;
    padding: 2px 8px;
    background-color: rgba(25, 137, 250, 0.1);
    color: #1989fa;
}

.user-card.search .user-tag {
    background-color: rgba(7, 193, 96, 0.1);
    color: #07c160;
}

.contact-button {
    border-radius: 20px;
    font-weight: 500;
    padding: 0 16px;
}
</style>

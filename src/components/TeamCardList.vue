<template>
    <div id="teamCardList">
        <van-card
                v-for="team in props.teamList"
                :key="team.id"
                :desc="team.description"
                :thumb="team.createUser?.avatarUrl || 'http://100.97.218.1:8009/leirui-oss/dkd-images/2025/07/266884724d226465b4b3d536ab.png'"
                :title="team.name"
                class="team-card"
        >
            <template #tags>
                <van-tag
                        :type="getTagType(team.status)"
                        plain
                        style="margin-right: 8px; margin-top: 8px"
                >
                    {{ teamStatusEnum[team.status] }}
                </van-tag>
            </template>

            <template #bottom>
                <div class="team-info">

                            <div class="info-item">
                                <van-icon name="user-o" />
                                <span>最大人数：{{ team.maxNum }}</span>
                            </div>
                            <div class="info-item">
                                <van-icon name="clock-o" />
                                <span class="time-text" :title="formatDate(team.expireTime)">过期时间：{{ formatDate(team.expireTime) }}</span>
                            </div>
                            <div class="info-item">
                                <van-icon name="underway-o" />
                                <span class="time-text" :title="timeAgo(team.createTime)">创建时间：{{ timeAgo(team.createTime) }}</span>
                            </div>
                </div>
            </template>

            <template #footer>
                <div class="card-footer">
                    <div class="creator-info">
                        队长：
                        <van-image
                                :src="team.createUser?.avatarUrl || 'http://100.97.218.1:8009/leirui-oss/dkd-images/2025/07/266884724d226465b4b3d536ab.png'"
                                round
                                width="24"
                                height="24"
                                fit="cover"        style="margin-left: 4px; margin-right: 4px;"
                        />
                        <span class="creator-name">{{ team.createUser?.username || '未知用户' }}</span>
                    </div>

                    <div class="button-group">
                        <van-button size="mini" type="primary" @click="doJoinTeam(team.id)" v-if="!isTeamCreator(team)">加入</van-button>

                        <van-button v-if="isTeamCreator(team)" type="primary" size="mini" @click="editTeam(team.id)">修改</van-button>

                        <van-button v-if="isTeamCreator(team)" type="primary" size="mini" @click="editTeam(team.id)">退出</van-button>

                        <van-button v-if="isTeamCreator(team)" type="danger" size="mini" @click="editTeam(team.id)">解散</van-button>
                    </div>
                </div>
            </template>
        </van-card>
    </div>
</template>

<script setup lang="ts">
import type { TeamType } from "../models/team";
import { teamStatusEnum } from "../constants/team";
import { showSuccessToast, showErrorToast } from "../utils/toast.ts";
import myAxios from "../plugins/myAxios.ts";
import { useUserStore } from '../plugins/userStore.ts'
import { useRouter } from 'vue-router';
import { computed } from 'vue';
const userStore = useUserStore()
const router = useRouter();

interface TeamCardListProps {
    teamList: TeamType[];
}

// 获取当前登录用户ID
const currentUserId = computed(() => {
    try {
        const userStr = userStore.getUser();
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id;
        }
    } catch (e) {
        console.error('解析用户信息失败', e);
    }
    return null;
});
// 判断是否为队伍创建者
const isTeamCreator = (team: TeamType) => {
    return team.userId === currentUserId.value;
};
// 跳转到编辑队伍页面
const editTeam = (teamId: number) => {
    router.push({
        path:'/team/update',
        query:{
            teamId:teamId
        }
    })
};

const props = withDefaults(defineProps<TeamCardListProps>(), {
    teamList: () => [] as TeamType[],
});

// 格式化日期显示（增强版，兼容 Date 对象、字符串和 undefined）
const formatDate = (dateInput: Date | string | undefined) => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return ''; // 防止无效日期
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};


// 时间 ago 计算（增强版）
const timeAgo = (dateInput: Date | string | undefined) => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return ''; // 防止无效日期
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '今天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`;
    return `${Math.ceil(diffDays / 30)}月前`;
};


// 根据状态获取标签类型
const getTagType = (status: number) => {
    switch (status) {
        case 0: return 'primary'; // 公开
        case 1: return 'warning'; // 私有
        case 2: return 'danger';  // 加密
    }
};



// 队伍列表加入队伍
const doJoinTeam = async (id: number) => {
    try {
        const res = await myAxios.post("/team/join", {
            teamId: id
        });
        if (res.data.code === 0) {
            showSuccessToast("加入成功");
        } else {
            showErrorToast("加入失败" + (res.data.description ? `，${res.data.description}` : ''));
        }
    } catch (error) {
        showErrorToast("加入失败");
        console.error(error);
    }
}
</script>
<style scoped>
#teamCardList {
    padding: 0 8px 12px;
}

.team-card {
    margin-bottom: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.team-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.team-info {
    margin-top: 8px;
}

.info-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.time-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.info-item .van-icon {
    margin-right: 4px;
    font-size: 14px;
    flex-shrink: 0;
}

.card-footer {
    display: flex;
    align-items: center;
    width: 100%;
}

.creator-info {
    display: flex;
    align-items: center;
    min-width: 0; /* 允许子元素收缩 */
}
.button-group {
    display: flex;
    margin-left: auto;
    gap: 8px; /* 按钮之间的间距 */
}
.creator-name {
    margin-left: 8px;
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.van-card__title) {
    font-weight: 600;
    font-size: 16px;
}

:deep(.van-card__desc) {
    font-size: 13px;
    line-height: 1.4;
    color: #666;
}

:deep(.van-card__bottom) {
    margin-top: 12px;
}

:deep(.van-col) {
    padding: 0 2px;
}
</style>
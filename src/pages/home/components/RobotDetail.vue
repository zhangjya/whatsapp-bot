<!-- 机器人信息 -->
<script setup lang="ts">
import dayjs from 'dayjs';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Notification } from '@arco-design/web-vue';

import { getGroupList, groupChangeEnable } from '/@/api/groupApi';
import { deleteRobot, destoryRobot, logoutRobot, startRobotById } from '/@/api/robotApi';
import { useRobotStore } from '/@/store';

import RobotStatus from './RobotStatus.vue';
import RobotWhiteList from './RobotWhiteList.vue';

const emit = defineEmits(['refresh']);

const robotStore = useRobotStore();
const { robotInfo } = storeToRefs(robotStore);

const groupList = ref<any[]>([]);
// 启动中的loading
const starting = ref(false);

onMounted(() => {
    window.ipcRenderer.on('robot-info-change', (e, data: any) => {
        console.log('🚀 ~ window.ipcRenderer.on ~ robot-info-change e:', e);
        console.log('🚀 ~ window.ipcRenderer.on ~ robot-info-change data:', data);
        robotStore.updateRobotInfo(data);
    });
});

onUnmounted(() => {
    window.ipcRenderer.off('robot-info-change', () => { });
});

watch(
    () => robotInfo.value?.status,
    (_status) => {
        if (_status === 3) {
            // 获取群组列表
            getGroupListByRobot();
        }
    },
);

const getGroupListByRobot = async () => {
    if (robotInfo.value) {
        groupList.value = await getGroupList(robotInfo.value.id);
    }
};

const handleStartRobot = async () => {
    try {
        if (robotInfo.value) {
            starting.value = true;
            const res = await startRobotById(robotInfo.value.id);
            console.log('🚀 ~ handleStartRobot ~ res:', res);
            starting.value = false;
            // 更新状态为 1
            if (robotInfo.value.status === 0) {
                robotStore.updateRobotInfo({
                    ...robotInfo.value,
                    status: 1,
                });
            }
        }
    } catch (error) {
        // 启动失败了
        console.error('🚀 ~ handleStartRobot ~ error:', error);
        alert(String(error));
        starting.value = false;
    }
};

const handleDeleteRobot = async () => {
    if (robotInfo.value) {
        await deleteRobot(robotInfo.value.id);
        robotStore.requestRobotList();
    }
};

const handleDestoryRobot = async () => {
    if (robotInfo.value) {
        if (robotInfo.value.status === 3) {
            // 调用登出接口
            await logoutRobot(robotInfo.value.id);
        } else {
            // 调用退出接口
            await destoryRobot(robotInfo.value.id);
        }
        // 更新状态为 0
        robotStore.updateRobotInfo({
            ...robotInfo.value,
            status: 0,
        });
    }
};

const handleRefresh = () => {
    getGroupListByRobot();
    Notification.success({
        content: '刷新成功',
    })
};

const handleChangeSwitch = async (_val: boolean, id: number) => {
    await groupChangeEnable(id, _val);
    await getGroupListByRobot();
    return _val;
};

const formatDate = (date: any) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
};
</script>
<template>
    <div class="robot-detail">
        <div v-if="!!robotInfo">
            <!-- 详细信息 -->
            <a-descriptions :column="4" size="mini">
                <a-descriptions-item label="备注名">
                    {{ robotInfo.name }}
                </a-descriptions-item>
                <a-descriptions-item label="昵称">
                    {{ robotInfo.nickName || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="账号">
                    {{ robotInfo.mobile || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="状态">
                    <RobotStatus :status="robotInfo.status" />
                </a-descriptions-item>
                <a-descriptions-item label="创建时间">
                    {{ formatDate(robotInfo.createdAt) }}
                </a-descriptions-item>
                <a-descriptions-item label="更新时间">
                    {{ formatDate(robotInfo.updatedAt) }}
                </a-descriptions-item>
            </a-descriptions>
            <a-divider type="dashed" :margin="16"></a-divider>
            <!-- 白名单 -->
            <RobotWhiteList :id="robotInfo.id" />
            <!-- 操作按钮区域 -->
            <div class="flex-between">
                <a-space align="end" size="large">
                    <!-- 打开客户端的按钮 -->
                    <a-tooltip content="启动机器人客户端，请勿重复启动">
                        <a-button @click="handleStartRobot" type="primary" :loading="starting">
                            <template #icon>
                                <icon-robot></icon-robot>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip content="刷新">
                        <a-button @click="handleRefresh" type="outline">
                            <template #icon>
                                <icon-refresh></icon-refresh>
                            </template>
                        </a-button>
                    </a-tooltip>
                </a-space>
                <a-space align="end" size="large">
                    <a-tooltip content="删除机器人" v-if="robotInfo.status === 0" position="left">
                        <a-button @click="handleDeleteRobot" type="primary" status="danger">
                            <template #icon>
                                <icon-delete></icon-delete>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip content="退出或销毁机器人" v-else position="left">
                        <a-button @click="handleDestoryRobot" type="outline" status="danger">
                            <template #icon>
                                <icon-poweroff></icon-poweroff>
                            </template>
                        </a-button>
                    </a-tooltip>
                </a-space>
            </div>
            <!-- 待授权 -->
            <div v-if="robotInfo.status === 0">
                <!-- <a-button @click="handleStartRobot">启动机器人</a-button> -->
                <div>1. 请先确认已安装 Chrome 浏览器</div>
                <div>2. 添加白名单</div>
                <div>3. 点击启动按钮，启动机器人</div>
            </div>
            <div v-else-if="robotInfo.status === 1">
                <div>1. 机器人正在启动中</div>
                <div>2. 请在 whatsapp 网页版打开后，使用手机扫码授权登陆</div>
                <div>3. 如果卡在扫码授权阶段，可以点击右上角销毁按钮，然后重新启动机器人</div>
            </div>
            <div v-else-if="robotInfo.status === 2">
                <span>加载中，请耐心等候...</span>
            </div>
            <div v-else-if="robotInfo.status === 3">
                <a-typography-title :heading="5"> 群列表 </a-typography-title>
                <a-table :data="groupList" :pagination="false" :bordered="false"
                    :scroll="{ x: 600, y: 'calc(100vh - 240px)' }">
                    <template #columns>
                        <a-table-column title="群名称" data-index="name"></a-table-column>
                        <a-table-column title="总金额" data-index="totalAmount"
                            :sortable="{ sortDirections: ['ascend', 'descend'] }">
                        </a-table-column>
                        <a-table-column title="状态" data-index="status"
                            :sortable="{ sortDirections: ['ascend', 'descend'] }">
                            <template #cell="{ record }">
                                <a-switch type="round" :model-value="record.status === 1"
                                    :beforeChange="(val: any) => handleChangeSwitch(val, record.id)">
                                    <template #checked> 已启用 </template>
                                    <template #unchecked> 已禁用 </template>
                                </a-switch>
                            </template>
                        </a-table-column>
                        <a-table-column title="创建时间" data-index="createdAt">
                            <template #cell="{ record }">
                                <span>{{ formatDate(record.createdAt) }}</span>
                            </template>
                        </a-table-column>
                        <a-table-column title="更新时间" data-index="updatedAt">
                            <template #cell="{ record }">
                                <span>{{ formatDate(record.updatedAt) }}</span>
                            </template>
                        </a-table-column>
                    </template>
                </a-table>
            </div>
        </div>
        <div v-else-if="robotStore.robotList.length">
            <a-result title="选择一个机器人" subtitle="点击左侧列表中的机器人，查看详细信息" :style="{ margin: '20vh 0' }"></a-result>
        </div>
    </div>
</template>
<style lang="less" scoped>
.robot-detail {
    padding-bottom: 12px;

    .flex-between {
        display: flex;
        justify-content: space-between;
        margin: 12px 0 20px;
    }
}
</style>

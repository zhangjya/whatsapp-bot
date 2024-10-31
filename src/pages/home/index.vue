<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { getRobotList } from '/@/api/robotApi';
import { useRobotStore } from '/@/store';

import NoRobot from './components/NoRobot.vue';
import AddRobotModal from './components/AddRobotModal.vue';
import RobotList from './components/RobotList.vue';
import RobotDetail from './components/RobotDetail.vue';

const robotStore = useRobotStore();
// 展示添加机器人的弹出框
const showAddModal = ref<boolean>(false)
// 机器人列表
const list = ref<ROBOT.IItem[]>([]);

onMounted(() => {
    init()
})

// 初始化函数
const init = async () => {
    robotStore.requestRobotList();
}

const handleAddSuccess = () => {
    // 添加成功后，刷新列表
    init()
}

</script>
<template>
    <div class="pages">
        <a-alert title="WhatsApp 记账机器人使用指南" size="small" closable>
            1. 添加机器人后，请扫码登录<br />
            2. 机器人登陆成功后，会检查群聊消息是否有记账指令，有则会自动记账并回复发送人<br />
            3. 记账指令如例：结算【/js、+0】、清帐【/qz】、撤回【/ch】、数学运算【+5*100、-5/100、等等】
        </a-alert>
        <div style="height: 12px;"></div>
        <div class="container">
            <a-card class="left" title="机器人列表" size="small">
                <template #extra>
                    <a-tooltip content="点击按钮，添加新的机器人">
                        <a-button type="primary" @click="showAddModal = true">
                            <template #icon>
                                <icon-robot-add />
                            </template>
                        </a-button>
                    </a-tooltip>
                </template>
                <template #default>
                    <NoRobot v-if="robotStore.robotList.length === 0" @add="showAddModal = true"></NoRobot>
                    <RobotList v-else></RobotList>
                </template>
            </a-card>
            <a-card class="right" :bordered="true" size="small">
                <RobotDetail></RobotDetail>
            </a-card>
        </div>
        <!-- 新增机器人的弹出框 -->
        <AddRobotModal v-model:visible="showAddModal" @success="handleAddSuccess" />
    </div>
</template>
<style lang="less" scoped>
.pages {
    .container {
        display: flex;
        gap: 20px;

        .left {
            flex: 0 0 210px;
        }

        .right {
            flex: 1;
        }
    }
}
</style>
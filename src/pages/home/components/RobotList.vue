<script setup lang="ts">
import { useRobotStore } from '/@/store';

import RobotStatus from './RobotStatus.vue';

const robotStore = useRobotStore();

const handleChange = (_val: any) => {
    robotStore.selectedRobotId = _val;
    // emit('update:value', _val)
}

const isChecked = (id: number) => {
    if (robotStore.selectedRobotId && robotStore.selectedRobotId === id) {
        return true;
    }
    return false
}

</script>
<template>
    <div class="list-box">
        <div v-for="item in robotStore.robotList" :key="item.id" class="list-item"
            :class="{ checked: isChecked(item.id) }" @click.prevent="handleChange(item.id)">
            <a-space direction="vertical" :size="2">
                <a-space align="center" size="mini">
                    <RobotStatus :status="item.status" />
                    <a-typography-text :type="isChecked(item.id) ? 'primary' : ''" bold>
                        {{ item.name }}
                    </a-typography-text>
                </a-space>
                <a-typography-text class="text" type="secondary">
                    昵称：{{ item.nickName || '-' }}
                </a-typography-text>
                <a-typography-text class="text" type="secondary">
                    账号：{{ item.mobile || '-' }}
                </a-typography-text>
            </a-space>
        </div>
    </div>
</template>
<style lang="less" scoped>
.list-box {
    .list-item {
        padding: 6px 12px;
        border: 1px solid var(--color-border-1);
        border-radius: 4px;
        box-sizing: border-box;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            border-color: rgb(var(--primary-6), 0.6);
        }

        &.checked {
            border-color: rgb(var(--primary-6));
        }

        .text {
            font-size: 12px;
        }
    }
}
</style>

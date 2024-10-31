<script setup lang="ts">
defineProps<{
    status: ROBOT.Status;
}>();

const renderStatusText = (status: number) => {
    switch (status) {
        case 0:
            return '待启动';
        case 1:
            return '待扫码';
        case 2:
            return '授权中';
        default:
            return '已授权';
    }
}

const renderStatusColor = (status: number) => {
    switch (status) {
        case 0:
            return 'red';
        case 1:
            return 'orangered';
        case 2:
            return 'arcoblue';
        default:
            return 'green';
    }
}

</script>
<template>
    <a-tag size="small" :color="renderStatusColor(status)">
        {{ renderStatusText(status) }}
    </a-tag>
</template>
<style lang="less" scoped></style>

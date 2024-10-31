<script setup lang="ts">
const emit = defineEmits(['add'])
const handleAdd = () => {
    emit('add')
}
</script>
<template>
    <div class="container">
        <a-result status="warning" title="暂无 WhatsApp 机器人">
            <template #subtitle>
                请点击按钮，添加一个机器人
            </template>

            <template #extra>
                <a-space>
                    <a-button type='primary' @click="handleAdd">
                        <template #icon>
                            <icon-robot-add />
                        </template>
                        添加 WhatsApp 机器人
                    </a-button>
                </a-space>
            </template>
        </a-result>
    </div>
</template>
<style lang="less" scoped>
.container {
    padding-top: 15vh;
}
</style>
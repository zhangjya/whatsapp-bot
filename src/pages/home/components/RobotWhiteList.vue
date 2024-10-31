<!-- 白名单 -->
<!-- 机器人信息 -->
<script setup lang="ts">
import dayjs from 'dayjs';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { addWhiteList, deleteWhiteList, getWhiteList } from '/@/api/whiteListApi';


const props = defineProps<{
    id: number;
}>();

const whiteList = ref<WHITELIST.IItem[]>([]);
const inputRef = ref<any>(null);
const showInput = ref(false);
const inputVal = ref('');

const init = async () => {
    whiteList.value = await getWhiteList(props.id);
};


onMounted(() => {
    init();
});


watch(
    () => props.id,
    () => {
        init();
    },
);

const handleRemove = async (_id: number) => {
    await deleteWhiteList(_id);
}

const handleAdd = async () => {
    if (inputVal.value) {
        // 是否重复
        const find = whiteList.value.some(item => item.account === inputVal.value);
        if (!find) {
            await addWhiteList({
                robotId: props.id,
                account: inputVal.value,
                permission: 'js/qz/ch',
            });
            init();
            inputVal.value = '';
        } else {
            alert('该账号已在白名单中');
            inputVal.value = '';
            return;
        }
    }
    showInput.value = false;
};

const handleEdit = () => {
    showInput.value = true;

    nextTick(() => {
        if (inputRef.value) {
            inputRef.value?.focus();
        }
    });
};

</script>
<template>
    <div class="white-list">
        <a-space wrap>
            <a-tooltip content="白名单说明：添加白名单账号后，只有白名单的账号才能记账，示例：8618888888888">
                <icon-info-circle-fill :size="18" />
            </a-tooltip>
            <a-tag v-for="(tag, index) of whiteList" :key="tag.id" closable @close="handleRemove(tag.id)">
                {{ tag.account }}
            </a-tag>

            <a-input v-if="showInput" ref="inputRef" :style="{ width: '120px' }" :max-length="20" allow-clear
                show-word-limit size="mini" v-model.trim="inputVal" @keyup.enter="handleAdd" @blur="handleAdd" />
            <a-tag v-else :style="{
                width: '90px',
                backgroundColor: 'var(--color-fill-2)',
                border: '1px dashed var(--color-fill-3)',
                cursor: 'pointer',
            }" @click="handleEdit">
                <template #icon>
                    <icon-plus />
                </template>
                添加白名单
            </a-tag>
        </a-space>
    </div>
</template>
<style lang="less" scoped>
.white-list {
    margin-bottom: 20px;
}
</style>

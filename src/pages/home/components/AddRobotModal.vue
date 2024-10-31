<script setup lang="ts">
import { getCurrentInstance, reactive, ref, watch } from 'vue';

import { addRobot } from '/@/api/robotApi';

const props = defineProps<{
    visible: boolean;
    "update:visible"?: (visible: boolean) => void;
}>();

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref<any>(null);
const modalVisible = ref<boolean>(props.visible);
const form = reactive<ROBOT.SaveParams>({
    name: '',
});

watch(() => props.visible, (val) => {
    modalVisible.value = val;
})

const handleCancel = () => {
    emit('update:visible', false);
}

const handleBeforeOk = async (done: (closed: boolean) => void) => {
    // 触发表单的校验，如果校验不通过，会弹出提示
    const validate = await formRef.value.validate();
    if (validate) {
        done(false);
        return;
    }
    await addRobot({ ...form });
    emit('success');
    handleCancel();
    done(true);
}

</script>
<template>
    <a-modal width="300px" v-model:visible="modalVisible" title="添加机器人" @cancel="handleCancel"
        @before-ok="handleBeforeOk">
        <a-form ref="formRef" layout="vertical" :model="form">
            <a-form-item field="name" label="备注名" required :rules="[{ required: true, message: '备注名必填' }]">
                <a-input v-model="form.name" :max-length="10" allow-clear show-word-limit />
            </a-form-item>
        </a-form>
    </a-modal>
</template>
<style lang="less" scoped></style>
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getChromePath } from '/@/utils/index'

// 1. 检查网络是否能访问whatsapp
// 2. 检查是否有已启动的机器人客户端
type NetworkStatus = 'OK' | 'ERROR' | 'LOADING';

const router = useRouter();
const step = ref(1);
// 检测中
const networkCheckStatus = ref<NetworkStatus>('LOADING');
const chromeCheckStatus = ref<NetworkStatus>('LOADING');

onMounted(() => {
    checkChromeInstalled();
});

const checkChromeInstalled = () => {
    step.value = 1;
    chromeCheckStatus.value = 'LOADING';
    window.ipcRenderer
        .invoke('check-chrome')
        .then((res) => {
            console.log('🚀 ~ window.ipcRenderer.invoke ~ res:', res);
            chromeCheckStatus.value = res ? 'OK' : 'ERROR';
            if (res) {
                checkNetwork();
            }
        })
        .catch((err) => {
            console.error('🚀 ~ checkChromeInstalled ~ err:', err);
        });
};

const checkNetwork = () => {
    step.value = 2;
    networkCheckStatus.value = 'LOADING';
    window.ipcRenderer.invoke('check-network').then((res) => {
        networkCheckStatus.value = res ? 'OK' : 'ERROR';
        if (res) {
            step.value = 3;
            setTimeout(() => {
                router.replace('/home');
            }, 2000);
        }
        // networkCheckStatus.value = 'ERROR';
    });
};

const stepStatus = computed(() => {
    switch (networkCheckStatus.value) {
        case 'LOADING':
            return 'process';
        case 'OK':
            return 'finish';
        case 'ERROR':
            return 'error';
    }
});

</script>

<template>
    <div class="pages">
        <a-steps direction="vertical" :current="step" :status="stepStatus">
            <a-step>
                <span>
                    <template v-if="chromeCheckStatus === 'LOADING'">Chrome 安装检测中</template>
                    <a-typography-text v-else-if="chromeCheckStatus === 'OK'" type="success">
                        Chrome 已安装
                    </a-typography-text>
                    <a-space direction="vertical" v-else>
                        <a-typography-text type="danger">未安装 Chrome 浏览器，请安装后重试</a-typography-text>
                        <a-button type="primary" @click="checkChromeInstalled">重新检测</a-button>
                    </a-space>
                </span>
                <template #icon>
                    <icon-loading v-if="networkCheckStatus === 'LOADING'" />
                    <icon-check v-else-if="networkCheckStatus === 'OK'" />
                    <icon-close v-else />
                </template>
                <template #description>
                    <a-space direction="vertical">
                        <span>检查本机是否安装 Chrome 浏览器</span>
                        <span>安装路径：{{ getChromePath() }}</span>
                    </a-space>
                    <br />
                    <br />
                </template>
            </a-step>
            <a-step description="检查是否能访问 whatsapp">
                <span>
                    <template v-if="networkCheckStatus === 'LOADING'">网络检测中</template>
                    <a-typography-text v-else-if="networkCheckStatus === 'OK'" type="success">
                        网络正常
                    </a-typography-text>
                    <div v-else>
                        <a-typography-text type="danger"> 网络不可用，无法连接 whatsapp </a-typography-text>
                        <a-button type="primary" @click="checkNetwork">重新检测</a-button>
                    </div>
                </span>
                <template #icon>
                    <icon-loading v-if="networkCheckStatus === 'LOADING'" />
                    <icon-check v-else-if="networkCheckStatus === 'OK'" />
                    <icon-close v-else />
                </template>
            </a-step>
            <a-step description="即将跳转">
                完成检测
                <template #icon>
                    <icon-robot />
                </template>
            </a-step>
        </a-steps>
    </div>
</template>
<style lang="less" scoped>
.pages {
    padding-top: 20vh;
    padding-left: 10vw;
}
</style>

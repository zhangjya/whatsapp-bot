<script setup lang="ts">
import { useRouter } from 'vue-router';

useRouter();
</script>
<template>
    <a-layout class="layout">
        <a-layout-header v-if="$route.meta.header !== false"></a-layout-header>
        <a-layout-content class="layout-content">
            <router-view></router-view>
        </a-layout-content>
    </a-layout>
</template>
<style lang="less" scoped>
.layout {
    min-height: 100vh;
    width: 100vw;

    .layout-content {
        padding: 12px;
    }
}
</style>
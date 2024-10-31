<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  document.body.setAttribute('arco-theme', 'dark')
})

</script>
<template>
  <a-config-provider>
    <router-view></router-view>
  </a-config-provider>
</template>
<style lang="less" scoped></style>

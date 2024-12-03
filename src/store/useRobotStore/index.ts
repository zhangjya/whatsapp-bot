import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { getRobotList } from '/@/api/robotApi';

/**
 * 使用机器人的store
 */
export const useRobotStore = defineStore('robotStore', () => {
  const robotList = ref<ROBOT.IItem[]>([]);
  const selectedRobotId = ref<number | undefined>();

  const robotInfo = computed(() => {
    console.log('🚀 ~ robotInfo ~ computed list:', robotList.value);
    console.log('🚀 ~ robotInfo ~ computed selectedRobotId:', selectedRobotId.value);
    if (selectedRobotId.value) {
      return robotList.value.find((item) => item.id === selectedRobotId.value);
    }
    return undefined;
  });

  const requestRobotList = async () => {
    robotList.value = await getRobotList();
    console.log('🚀 ~ init ~ robotList:', robotList.value);
  };

  /**
   * 同步更新机器人信息
   * @param data
   */
  const updateRobotInfo = (data: ROBOT.IItem) => {
    robotList.value.forEach((item) => {
      if (item.id === data.id) {
        item.mobile = data.mobile || item.mobile;
        item.name = data.name || item.name;
        item.nickName = data.nickName || item.nickName;
        item.status = data.status || item.status;
      }
    })
    // const index = robotList.value.findIndex((item) => item.id === data.id);
    // if (index !== -1) {
    //   // 对象合并
    //   // Object.assign(robotList.value[index], data);
    //   robotList.value[index] = { ...robotList.value[index], ...data };
    // }
  };

  return {
    robotList,
    selectedRobotId,
    robotInfo,
    requestRobotList,
    updateRobotInfo,
  };
});

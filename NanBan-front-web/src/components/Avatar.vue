<template>
  <div
    class="avatar"
    :style="{
      width: width + 'px',
      height: width + 'px',
      'border-radius': width / 2 + 'px',
    }"
  >
    <el-image
      v-if="userId"
      :style="{
        width: width + 'px',
        height: width + 'px',
        'border-radius': width / 2 + 'px',
      }"
      :src="proxy.globalInfo.avatarUrl + userId"
      fit="scale-down"
      loading="lazy"
      @click="goToUcenter"
    ></el-image>
  </div>
</template>

<script setup>
import { getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const props = defineProps({
  userId: {
    type: String,
  },
  width: {
    type: Number,
    default: 60,
  },
  addLink: {
    type: Boolean,
    default: true,
  },
});
const goToUcenter = () => {
  if (props.addLink) {
    router.push("/user/" + proxy.userId);
  }
};
</script>

<style lang="scss">
.avatar {
  cursor: pointer;
}
</style>

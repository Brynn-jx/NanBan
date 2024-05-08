<template>
  <div class="cover" :style="{ width: width + 'px', height: width + 'px' }">
    <el-image
      :style="{ width: width + 'px', height: width + 'px' }"
      fit="scale-down"
      :lazy="true"
      :src="cover ? proxy.globalInfo.imageUrl + cover : localCover"
    ></el-image>
  </div>
</template>

<script setup>
import { getCurrentInstance } from "vue";
// 如果没有封面的话，可以配置默认的封面图片
const localCover = new URL("@/assets/default_cover.png", import.meta.url).href;
const { proxy } = getCurrentInstance();
const props = defineProps({
  cover: {
    type: String,
  },
  width: {
    type: Number,
    default: 60,
  },
});
</script>

<style lang="scss">
.cover {
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
}
</style>

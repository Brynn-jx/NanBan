<template>
  <div class="image-viewer">
    <el-image-viewer
      :initial-index="previweImgIndex"
      hide-on-click-modal
      :url-list="imageList"
      @close="closeImgViewer"
      v-if="previweImgIndex != null"
    >
    </el-image-viewer>
  </div>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
  imageList: {
    type: Array,
  },
});
const previweImgIndex = ref(null);
const show = (index) => {
  previweImgIndex.value = index;
  stopScroll();
};
defineExpose({ show });
const closeImgViewer = () => {
  startScroll();
  previweImgIndex.value = null;
};
// 开始滚动条
const stopScroll = () => {
  document.body.style.overflow = "hidden";
};
// 开始滚动
const startScroll = () => {
  document.body.style.overflow = "auto";
};
</script>

<style lang="scss">
.image-viewer {
  .el-image-viewer__mask {
    opacity: 0.7;
  }
}
</style>

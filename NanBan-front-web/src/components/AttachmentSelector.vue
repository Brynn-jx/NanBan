<template>
  <div class="attachment-selector">
    <template v-if="modelValue">
      <div class="file-show">
        <div class="file-name" :title="modelValue.name">
          {{ modelValue.name }}
        </div>
        <div class="iconfont icon-del" @click="delFile"></div>
      </div>
    </template>
    <el-upload
      v-else
      name="file"
      :show-file-list="false"
      accept=".zip,.rar"
      :multiple="false"
      :http-request="selectFile"
    >
      <el-button type="primary" size="default" @click=""> 选择文件 </el-button>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits();
const selectFile = async (file) => {
  // 双向绑定，在子组件中选择文件后会返回到父组件的v-model中
  // 要是不emit出去modelValue就没有值就一直是选择文件
  emit("update:modelValue", file.file);
};
const delFile = () => {
  emit("update:modelValue", null);
};
</script>

<style lang="scss">
.attachment-selector {
  width: 100%;
  .file-show {
    display: flex;
    justify-content: space-around;
    .file-name {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: var(--link);
    }
    .icon-del {
      width: 20px;
      color: var(--link);
      cursor: pointer;
      margin-left: 10px;
    }
  }
}
</style>

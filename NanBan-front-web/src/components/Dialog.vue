<template>
  <div>
    <el-dialog
      :title="props.title"
      :show-close="props.showClose"
      :draggable="true"
      :close-on-click-modal="false"
      :model-value="props.show"
      :width="props.width"
      :top="props.top"
      class="cust-dialog"
      @close="close"
    >
      <div class="dialog-body">
        <slot></slot>
      </div>
      <template v-if="(buttons && buttons.length > 0) || props.showCancel">
        <div class="dialog-footer">
          <el-button link @click="close" v-if="props.showCancel"
            >取消</el-button
          >
          <el-button
            v-for="button in buttons"
            :type="button.type"
            @click="button.click"
            >{{ button.text }}</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<!-- v-model是只读的要改成 :model-value -->
<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "标题",
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: "30%",
  },
  top: {
    type: String,
    default: "50px",
  },
  buttons: {
    type: Array,
  },
  showCancel: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits();
const close = () => {
  // 子组件Dialog.vue触发父组件Layout.vue的close方法
  emit("close");
};
</script>

<style lang="scss">
.cust-dialog {
  margin-bottom: 10px;
  .dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    padding: 15px;
    min-height: 100px;
    max-height: calc(100vh - 220px);
    overflow: auto;
  }
  .dialog-footer {
    text-align: right;
    padding: 10px 20px;
  }
}
</style>

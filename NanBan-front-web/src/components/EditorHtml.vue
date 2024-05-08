<template>
  <div class="editor-html">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    ></Toolbar>
    <Editor
      :style="{ height: height + 'px', 'overflow-y': 'hidden' }"
      :model-value="modelValue"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="onChange"
    ></Editor>
  </div>
</template>

<script setup>
import "@wangeditor/editor/dist/css/style.css";
import { onBeforeUnmount, ref, shallowRef } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { getCurrentInstance } from "vue";
import { useStore } from "vuex";
const { proxy } = getCurrentInstance();
const store = useStore();
const props = defineProps({
  modelValue: {
    // 父组件 v-model没有指定参数名，则默认是modelValue
    type: String,
    default: "",
  },
  height: {
    type: Number,
    default: 500,
  },
});

const mode = ref("default");
const editorRef = shallowRef();

const toolbarConfig = {
  excludeKeys: [
    "uploadVideo", //排除菜单组， 写菜单组的key即可
  ],
};

const editorConfig = {
  placeholder: "请输入内容...",
  excludeKeys: ["uploadVideo"],
  MENU_CONF: {
    uploadImage: {
      maxFileSize: 3 * 1024 * 1024,
      server: "api/file/uploadImage",
      filedName: "file",
      customInsert(responseData, insertFn) {
        // 正常请求
        if (responseData.code == 200) {
          insertFn(
            proxy.gloabalInfo.imageUrl + responseData.data.filedName,
            "",
            ""
          );
          return;
        } else if (responseData.code == 901) {
          store.commit("showLogin", true);
          store.commit("updateLoginUserInfo", null);
          return;
        }
        proxy.Message.error(responseData.info);
      },
    },
  },
};

const emit = defineEmits();
const onChange = (editor) => {
  emit("update:modelValue", editor.getHtml());
};

// 组件销毁时。也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) {
    return;
  }
  editor.destroy();
});

const handleCreated = (editor) => {
  editorRef.value = editor; //纪录editor实例
};
</script>

<style lang="scss">
.editor-html {
  border: 1px solid #ddd;
  z-index: 1001;
}
</style>

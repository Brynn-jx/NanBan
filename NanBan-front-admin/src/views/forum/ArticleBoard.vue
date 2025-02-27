<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="false"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="80px"
      >
        <el-form-item label="标题">
          {{ formData.title }}
        </el-form-item>
        <el-form-item label="板块" prop="boardIds">
          <el-cascader
            :options="boardList"
            v-model="formData.boardIds"
            clearable
            placeholder="请选择板块"
            :props="boardProps"
            :style="{ width: '100%' }"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const api = {
  loadBoard: "/board/loadBoard",
  updateBoard: "/forum/updateBoard",
};

const dialogConfig = reactive({
  show: false,
  title: "修改板块",
  buttons: [
    {
      type: "primary",
      text: "确定",
      click: (e) => {
        submitForm();
      },
    },
  ],
});

const formData = ref({});
const formDataRef = ref();
const rules = {
  boardIds: [{ required: true, message: "请选择板块" }],
};
// 板块信息
const boardProps = {
  multiple: false,
  checkStrictly: true,
  value: "boardId",
  label: "boardName",
};
const boardList = ref([]);
const loadBoardList = async () => {
  let result = await proxy.Request({
    url: api.loadBoard,
  });
  if (!result) {
    return;
  }
  boardList.value = result.data;
};
loadBoardList();

const emit = defineEmits();
const submitForm = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {
      articleId: formData.value.articleId,
    };
    params.boardIds = formData.value.boardIds;
    if (params.boardIds && params.boardIds.length == 1) {
      params.pBoardId = params.boardIds[0];
    } else if (params.boardIds && params.boardIds.length == 2) {
      params.pBoardId = params.boardIds[0];
      params.boardId = params.boardIds[1];
    }
    delete params.boardIds;

    let result = await proxy.Request({
      url: api.updateBoard,
      params: params,
    });
    if (!result) {
      return;
    }
    dialogConfig.show = false;
    // 触发父组件的传递过来的reload方法
    emit("reload");
  });
};

const updateBoard = (data) => {
  dialogConfig.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    data.boardIds = [];
    data.boardIds.push(data.pBoardId);
    if (data.boardId != null && data.boardId != 0) {
      data.boardIds.push(data.boardId);
    }
    formData.value = data;
  });
};
defineExpose({ updateBoard });
</script>

<style lang="scss"></style>

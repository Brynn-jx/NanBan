<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="500px"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="80px"
      >
        <el-form-item label="消息内容" prop="message">
          <el-input
            clearable
            placeholder="请输入系统消息内容"
            type="textarea"
            :rows="5"
            :maxlength="200"
            resize="none"
            show-word-limit
            v-model="formData.message"
          ></el-input>
        </el-form-item>
        <el-form-item label="积分" prop="integral">
          <el-input
            clearable
            placeholder="请输入积分，为空或者0不增减积分，负数为减积分，正数为增加积分"
            v-model="formData.integral"
          ></el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const api = {
  sendMessage: "/user/sendMessage",
};

const dialogConfig = reactive({
  show: false,
  title: "系统消息",
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
  message: [{ required: true, message: "请输入系统消息内容" }],
};

const sendMessage = (data) => {
  dialogConfig.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = {
      userId: data.userId,
      nickName: data.nickName,
    };
  });
};
defineExpose({ sendMessage });

// 提交表单，发送消息
const emit = defineEmits(["reload"]);
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    let result = await proxy.Request({
      url: api.sendMessage,
      params: params,
    });
    if (!result) {
      return;
    }
    dialogConfig.show = false;
    proxy.Message.success("发送成功");
    emit("reload");
  });
};
</script>

<style lang="scss"></style>

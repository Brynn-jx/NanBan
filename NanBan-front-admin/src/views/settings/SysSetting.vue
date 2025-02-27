<template>
  <div>
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="150px"
      :style="{ width: '800px' }"
    >
      <el-divider content-position="left">用户注册欢迎信息</el-divider>
      <el-row>
        <el-col :span="24">
          <!-- 这里 registerWelcomInfo 拼写错误了-->
          <el-form-item label="欢迎消息" prop="registerWelcomInfo">
            <el-input
              v-model="formData.registerWelcomInfo"
              placeholder="请输入注册欢迎消息"
              maxlength="250"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">邮件设置</el-divider>
      <el-row>
        <el-col :span="24">
          <el-form-item label="邮件标题" prop="emailTitle">
            <el-input
              v-model="formData.emailTitle"
              placeholder="请输入邮件标题"
              maxlength="200"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="邮件内容" prop="emailContent">
            <el-input
              v-model="formData.emailContent"
              placeholder="请输入邮件内容，验证码使用%s占位符"
              maxlength="300"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">审核设置</el-divider>
      <el-row>
        <el-col :span="12">
          <el-form-item label="帖子是否需要审核" prop="postAudit">
            <el-radio-group v-model="formData.postAudit">
              <el-radio :value="false">无需审核</el-radio>
              <el-radio :value="true">需要审核</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="评论是否需要审核" prop="commentAudit">
            <el-radio-group v-model="formData.commentAudit">
              <el-radio :value="false">无需审核</el-radio>
              <el-radio :value="true">需要审核</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">发帖设置</el-divider>
      <el-row>
        <el-col :span="12">
          <el-form-item label="发帖积分" prop="postIntegral">
            <el-input
              v-model="formData.postIntegral"
              placeholder="请输入发帖可以获得的积分"
            ></el-input>
          </el-form-item>
          <el-form-item label="每天可发帖数量" prop="postDayCountThreshold">
            <el-input
              v-model="formData.postDayCountThreshold"
              placeholder="请输入每天可发帖数量"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="每天可上传图片数量" prop="dayImageUploadCount">
            <el-input
              v-model="formData.dayImageUploadCount"
              placeholder="请输入每天可上传图片数量"
            ></el-input>
          </el-form-item>
          <el-form-item label="允许附件大小（MB）" prop="attachmentSize">
            <el-input
              v-model="formData.attachmentSize"
              placeholder="请输入附件允许最大大小"
            >
              <template #append>MB</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">评论设置</el-divider>
      <el-row>
        <el-col :span="24">
          <el-form-item label="是否开启评论" prop="commentOpen">
            <el-radio-group v-model="formData.commentOpen">
              <el-radio :value="true">开启</el-radio>
              <el-radio :value="false">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="评论积分" prop="commentIntegral">
            <el-input
              v-model="formData.commentIntegral"
              placeholder="请输入评论可以获得的积分"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="每天可发评论数量"
            prop="commentDayCountThreshold"
          >
            <el-input
              v-model="formData.commentDayCountThreshold"
              placeholder="请输入每天可发评论数量"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">点赞设置</el-divider>
      <el-row>
        <el-col :span="12">
          <el-form-item label="每天可点赞数量" prop="likeDayCountThreshold">
            <el-input
              v-model="formData.likeDayCountThreshold"
              placeholder="请输入每天可点赞数量"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="">
        <el-button type="primary" @click="saveSetting">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, nextTick, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const api = {
  loadSetting: "/setting/getSetting",
  saveSetting: "/setting/saveSetting",
};

const formData = ref({});
const formDataRef = ref();
const rules = {
  registerWelcomeInfo: [{ required: true, message: "请输入欢迎消息" }],
  emailTitle: [{ required: true, message: "请输入邮件标题" }],
  emailContent: [{ required: true, message: "请输入邮件内容" }],
  postAudit: [{ required: true, message: "请选择帖子是否需要审核" }],
  commentAudit: [{ required: true, message: "请选择评论是否需要审核" }],
  postIntegral: [
    { required: true, message: "请输入发帖积分" },
    { validator: proxy.Verify.number, message: "请输入有效的数字" },
  ],
  postDayCountThreshold: [
    { required: true, message: "请输入每天可发帖数量" },
    { validator: proxy.Verify.number, message: "请输入有效的数字" },
  ],
  dayImageUploadCount: [
    { required: true, message: "请输入每天可上传图片数量" },
    { validator: proxy.Verify.number, message: "请输入有效的数字" },
  ],
  attachmentSize: [
    { required: true, message: "请输入附件允许最大大小" },
    { validator: proxy.Verify.number, message: "请输入有效的数字" },
  ],
  commentOpen: [{ required: true, message: "请选择是否开启评论" }],
  commentIntegral: [
    { required: true, message: "请输入评论可以获得的积分" },
    { validator: proxy.Verify.number, message: "请输入有效的数字" },
  ],
  commentDayCountThreshold: [
    { required: true, message: "请输入每天可发评论数量" },
    { validator: proxy.Verify.number, message: "请输入有效的数字" },
  ],
  likeDayCountThreshold: [
    { required: true, message: "请输入每天可点赞数量" },
    { validator: proxy.Verify.number, message: "请输入有效的数字" },
  ],
};
// 获取系统设置
const getSetting = async () => {
  let result = await proxy.Request({
    url: api.loadSetting,
  });
  if (!result) {
    return;
  }
  let resultData = result.data;
  for (let item in resultData) {
    let subData = resultData[item];
    if (subData != null) {
      for (let sub in subData) {
        formData.value[sub] = subData[sub];
      }
    }
  }
};
getSetting();

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

const saveSetting = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.saveSetting,
      params: formData.value,
    });
    if (!result) {
      result;
    }
    proxy.Message.success("保存成功");
  });
};
</script>

<style lang="scss"></style>

<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    @close="dialogConfig.show = false"
    width="450px"
    :buttons="dialogConfig.buttons"
    :showCancel="false"
  >
    <el-form :model="formData" ref="formDataRef" label-width="40px">
      <el-form-item label="昵称" prop="nickName">
        {{ formData.nickName }}
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <CoverUpload
          :imageUrlPrefix="proxy.globalInfo.avatarUrl"
          v-model="formData.avatar"
        ></CoverUpload>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :label="0"> 女 </el-radio>
          <el-radio :label="1"> 男 </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="" prop="">
        <el-input
          v-model="formData.personDescription"
          placeholder="请输入简介"
          type="textarea"
          :row="5"
          :maxlength="100"
          resize="none"
          show-word-limit
          clearable
        ></el-input>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import CoverUpload from "@/components/CoverUpload.vue";
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const formData = ref({});
const formDataRef = ref();
const api = {
  updateUserInfo: "/ucenter/updateUserInfo",
};
const dialogConfig = reactive({
  show: false,
  title: "编辑个人信息",
  buttons: [
    {
      type: "primary",
      text: "确定",
      click: (e) => {
        updateUserInfoHandler();
      },
    },
  ],
});

const emit = defineEmits(["resetUserInfo"]);
const updateUserInfoHandler = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    let result = await proxy.Request({
      url: api.updateUserInfo,
      params: params,
    });
    if (!result) {
      return;
    }
    dialogConfig.show = false;
    if (params.avatar instanceof File) {
      router.go(0); // 刷新页面
    } else {
      emit("resetUserInfo", params);
    }
  });
};

// 抛出显示修改框函数
const showEditUserInfoDialog = (userInfo) => {
  dialogConfig.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    const dataInfo = JSON.parse(JSON.stringify(userInfo));
    dataInfo.avatar = {
      imageUrl: dataInfo.userId,
    };
    formData.value = dataInfo;
  });
};
defineExpose({ showEditUserInfoDialog });
</script>

<style lang="scss"></style>

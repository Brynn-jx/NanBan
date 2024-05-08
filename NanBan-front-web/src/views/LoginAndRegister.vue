<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      @close="closeDialog"
      width="400px"
      :buttons="dialogConfig.buttons"
    >
      <el-form
        :model="formData"
        ref="formDataRef"
        :rules="rules"
        class="login-register"
      >
        <el-form-item prop="email">
          <el-input
            clearable
            size="large"
            placeholder="请输入邮箱"
            v-model="formData.email"
          >
            <!-- 具名插槽 叫做prefix 将template中的内容放入了el-input对应的插槽位置-->
            <template v-slot:prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 登录密码 -->
        <el-form-item prop="password" v-if="opType == 1">
          <el-input
            size="large"
            placeholder="请输入密码"
            v-model="formData.password"
            type="password"
            show-password
            clearable
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 注册 -->
        <div v-if="opType == 0 || opType == 2">
          <el-form-item prop="emailCode">
            <div class="send-email-panel">
              <el-input
                clearable
                size="large"
                placeholder="请输入邮箱验证码"
                v-model="formData.emailCode"
              >
                <template #prefix>
                  <span class="iconfont icon-checkcode"></span>
                </template>
              </el-input>
              <el-button
                class="send-email-btn"
                type="primary"
                size="large"
                @click="getEmailCode"
                >获取验证码</el-button
              >
            </div>
            <el-popover placement="left" :width="500" trigger="click">
              <div>
                <p>1.在垃圾箱中查找邮箱验证码</p>
                <p>2.在邮箱中头像->设置->反垃圾->白名单->设置邮箱地址白名单</p>
                <p>3.将邮箱【493874410@qq.com】添加到白名单不知道怎么设置？</p>
              </div>
              <template #reference>
                <span class="a-link" :style="{ 'font-size': '12px' }"
                  >未收到邮箱验证码？</span
                >
              </template>
            </el-popover>
          </el-form-item>
          <el-form-item prop="nickName" v-if="opType == 0">
            <el-input
              clearable
              size="large"
              placeholder="请输入昵称"
              v-model="formData.nickName"
              maxlength="20"
            >
              <template #prefix>
                <span class="iconfont icon-account"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="registerPassword">
            <el-input
              clearable
              size="large"
              placeholder="请输入密码"
              v-model="formData.registerPassword"
              type="password"
              show-password
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="reRegisterPassword">
            <el-input
              clearable
              size="large"
              placeholder="请再次输入密码"
              v-model="formData.reRegisterPassword"
              type="password"
              show-password
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              clearable
              size="large"
              placeholder="请输入验证码"
              v-model="formData.checkCode"
              @keyup.enter="doSubmit"
            >
              <!-- 具名插槽 叫做prefix-->
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrl"
              class="check-code"
              @click="changeCheckCode(0)"
            />
          </div>
        </el-form-item>
        <el-form-item v-if="opType == 1">
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberMe">记住我</el-checkbox>
          </div>
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(2)"
              >忘记密码？</a
            >
            <a href="javascript:void(0)" class="a-link" @click="showPanel(0)"
              >没有账号？</a
            >
          </div>
        </el-form-item>
        <el-form-item v-if="opType == 0">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)"
            >已有账号？</a
          >
        </el-form-item>
        <el-form-item v-if="opType == 2">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)"
            >去登录？</a
          >
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doSubmit" class="op-btn">
            <span v-if="opType == 0">注册</span>
            <span v-if="opType == 1">登录</span>
            <span v-if="opType == 2">重置密码</span>
          </el-button>
        </el-form-item>
      </el-form>
    </Dialog>
    <Dialog
      :show="dialogConfig4SendMailCode.show"
      :title="dialogConfig4SendMailCode.title"
      @close="dialogConfig4SendMailCode.show = false"
      width="500px"
      :buttons="dialogConfig4SendMailCode.buttons"
    >
      <el-form
        :model="formData4SendMailCode"
        ref="formData4SendMailCodeRef"
        :rules="rules"
        size="normal"
        label-width="80px"
      >
        <el-form-item label="邮箱">
          {{ formData.email }}
        </el-form-item>

        <el-form-item label="验证码 " prop="checkCode">
          <div class="check-code-panel">
            <el-input
              clearable
              size="large"
              placeholder="请输入验证码"
              v-model="formData4SendMailCode.checkCode"
            >
              <!-- 具名插槽 叫做prefix-->
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrl4SendMailCode"
              class="check-code"
              @click="changeCheckCode(1)"
            />
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, getCurrentInstance } from "vue";
import md5 from "js-md5";
import { useStore } from "vuex";
const store = useStore();
const { proxy } = getCurrentInstance();
const api = {
  checkCode: "/api/checkCode",
  sendMailCode: "/sendEmailCode",
  register: "/register",
  login: "/login",
  resetPwd: "/resetPwd",
};
// 0注册  1 登录 2 找回密码
const opType = ref();
const showPanel = (type) => {
  opType.value = type;
  resetForm();
};
defineExpose({ showPanel });
const dialogConfig = reactive({
  show: false,
  title: "标题",
});
const formData = ref({});
const formDataRef = ref();
// 再次校验密码
const checkRePassword = (rule, value, callback) => {
  if (value != formData.value.reRegisterPassword) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};
//    validator: (rule, value, callback)
//    (1) rule  当前校验规则相关的信息
//    (2) value 所校验的表单元素目前的表单值
//    (3) callback 无论成功还是失败，都需要 callback 回调
//        - callback() 校验成功
//        - callback(new Error(错误信息)) 校验失败
const rules = {
  email: [
    { required: true, message: "请输入内容" },
    { max: 150, message: "邮箱太长" },
    { validator: proxy.Verify.email, message: "请输入正确的邮箱" },
  ],
  password: [{ required: true, message: "请输入密码" }],
  emailCode: [{ required: true, message: "请输入邮箱验证码" }],
  nickName: [{ required: true, message: "请输入昵称" }],
  registerPassword: [
    { required: true, message: "请输入密码" },
    {
      validator: proxy.Verify.password,
      message: "至少8位,必须包含字母、数字",
    },
  ],
  reRegisterPassword: [
    { required: true, message: "请再次输入密码" },
    {
      validator: proxy.Verify.password,
      message: "两次输入的密码不一致",
    },
  ],
  checkCode: [{ required: true, message: "请输入图片验证码" }],
};

// 验证码
const checkCodeUrl = ref(api.checkCode);
const changeCheckCode = (type) => {
  if (type == 0) {
    checkCodeUrl.value =
      api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  } else {
    checkCodeUrl4SendMailCode.value =
      api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  }
};

// 重置表单
const resetForm = () => {
  dialogConfig.show = true;
  if (opType.value == 0) {
    dialogConfig.title = "注册";
  } else if (opType.value == 1) {
    dialogConfig.title = "登录";
  } else if (opType.value == 2) {
    dialogConfig.title = "重置密码";
  }
  nextTick(() => {
    changeCheckCode(0);
    formDataRef.value.resetFields();
    formData.value = {};
    // 登录
    if (opType.value == 1) {
      let cookieLoginInfo = proxy.VueCookies.get("loginInfo");
      if (cookieLoginInfo) {
        formData.value = cookieLoginInfo;
      }
    }
  });
};
// 发送邮箱验证码弹窗
const formData4SendMailCode = ref({});
const formData4SendMailCodeRef = ref();
const checkCodeUrl4SendMailCode = ref(api.checkCode);
const dialogConfig4SendMailCode = reactive({
  show: false,
  title: "发送邮箱验证码",
  buttons: [
    {
      type: "primary",
      text: "发送验证码",
      click: () => {
        sendEmailCode();
      },
    },
  ],
});

// 获取邮箱验证码
const getEmailCode = () => {
  formDataRef.value.validateField("email", (valid) => {
    if (!valid) {
      return;
    }
    dialogConfig4SendMailCode.show = true;
    nextTick(() => {
      formData4SendMailCodeRef.value.resetFields();
      changeCheckCode(1);
      formData4SendMailCode.value = {
        email: formData.value.email,
      };
    });
  });
};

// 发送验证码
const sendEmailCode = () => {
  formData4SendMailCodeRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    // nextTick(() => {
    //   formData4SendMailCodeRef.value.resetFields();
    //   changeCheckCode(1);
    // });
    const params = Object.assign({}, formData4SendMailCode.value);
    params.type = opType.value == 0 ? 0 : 1; // 0 注册 1 找回密码
    let result = await proxy.Request({
      url: api.sendMailCode,
      params: params,
      errorCallback: () => {
        changeCheckCode(1);
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("验证码发送成功,请登录邮箱查看");
    dialogConfig4SendMailCode.show = false;
  });
};

// 登录，注册，重置密码，提交表单
const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    // 注册 重置密码
    if (opType.value == 0 || opType.value == 2) {
      params.password = params.registerPassword;
      delete params.reRegisterPassword;
      delete params.registerPassword;
    }
    // 登录
    if (opType.value == 1) {
      let cookieLoginInfo = proxy.VueCookies.get("loginInfo");
      let cookiePassword =
        cookieLoginInfo == null ? null : cookieLoginInfo.password;
      if (cookiePassword != params.password) {
        params.password = md5(params.password);
      }
    }
    let url = null;
    if (opType.value == 0) {
      url = api.register;
    } else if (opType.value == 1) {
      url = api.login;
    } else if (opType.value == 2) {
      url = api.resetPwd;
    }
    let result = await proxy.Request({
      url: url,
      params: params,
      errorCallback: () => {
        changeCheckCode(0);
      },
    });
    if (!result) {
      return;
    }
    // 注册返回
    if (opType.value == 0) {
      proxy.Message.success("注册成功,请登录");
      showPanel(1);
    } else if (opType.value == 1) {
      // 登录
      if (params.rememberMe) {
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe,
        };
        proxy.VueCookies.set("loginInfo", loginInfo, "7d");
      } else {
        proxy.VueCookies.remove("loginInfo");
      }
      dialogConfig.show = false;
      proxy.Message.success("登录成功");
      store.commit("updateLoginUserInfo", result.data);
    } else if (opType.value == 2) {
      // 重置密码
      showPanel(1);
      proxy.Message.success("重置密码成功,请登录");
    }
  });
};

const closeDialog = () => {
  dialogConfig.show = false;
  store.commit("showLogin", false);
};
</script>

<style lang="scss">
.login-register {
  .send-email-panel {
    display: flex;
    width: 100%;
    justify-content: space-between;
    .send-email-btn {
      margin-left: 5px;
    }
  }

  .rememberme-panel {
    width: 100%;
  }
  .no-account {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .op-btn {
    width: 100%;
  }
}
.check-code-panel {
  display: flex;
  .check-code {
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>

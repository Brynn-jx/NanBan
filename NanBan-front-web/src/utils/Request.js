import axios from "axios";
import { ElLoading } from "element-plus";
import Message from "@/utils/Message";
import store from "@/store";
const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson = "application/json";

const instance = axios.create({
  baseURL: "/api",
  timeout: 10 * 1000,
});

// 请求前过滤器
let loading = null;
instance.interceptors.request.use(
  (config) => {
    if (config.showLoading) {
      loading = ElLoading.service({
        lock: true,
        text: "加载中......",
        background: "rgba(0,0,0,0.7)",
      });
    }
    return config;
  },
  (error) => {
    if (error.config.showLoading && loading) {
      loading.close();
    }
    Message.error("请求发送失败");
    return Promise.reject("请求发送失败");
  }
);

// 请求后过滤器
instance.interceptors.response.use(
  (response) => {
    const { showLoading, showError, errorCallback } = response.config;
    if (showLoading && loading) {
      loading.close();
    }
    const resposeData = response.data;
    if (resposeData.code == 200) {
      return resposeData;
    } else if (resposeData.code == 901) {
      store.commit("updateLoginUserInfo", null);
      store.commit("showLogin", true);
      return Promise.reject({ showError: false, msg: "登录超时" });
    } else {
      // debugger;
      if (errorCallback) {
        errorCallback(resposeData);
      }
      return Promise.reject({ showError: showError, msg: resposeData.info });
    }
  },
  (error) => {
    if (error.config.showLoading && loading) {
      loading.close();
    }
    return Promise.reject({ showError: true, msg: "网络异常" });
  }
);

const request = (config) => {
  const {
    url,
    params,
    dataType,
    showLoading = true,
    errorCallback,
    showError = true,
  } = config;
  let contentType = contentTypeForm;
  let formData = new FormData();
  for (let key in params) {
    formData.append(key, params[key] == undefined ? "" : params[key]);
  }
  if (dataType != null && dataType == "json") {
    contentType = contentTypeJson;
  }
  let headers = {
    "Content-Type": contentType,
    "X-Requested-With": "XMLHttpRequest",
  };
  return instance
    .post(url, formData, {
      headers: headers,
      showLoading: showLoading,
      errorCallback: errorCallback,
      showError: showError,
    })
    .catch((error) => {
      if (error.showError) {
        Message.error(error.msg);
      }
      return null;
    });
};

export default request;

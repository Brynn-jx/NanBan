//引入cookies
import VueCookies from "vue-cookies";
//引入element plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
//使用scss 所以这里将base.css 改成base.scss
import "@/assets/base.scss";
//图标
import "@/assets/icon/iconfont.css";
// 全局组件
import Dialog from "@/components/Dialog.vue";
import Avatar from "@/components/Avatar.vue";
import Cover from "@/components/Cover.vue";
import Table from "./components/Table.vue";
import CoverUpload from "./components/CoverUpload.vue";

import Verify from "@/utils/Verify";
import Message from "@/utils/Message";
import Request from "@/utils/Request";
import Utils from "@/utils/Utils";
import Confirm from "@/utils/Confirm";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.globalInfo = {
  bodyWidth: 1300,
  avatarUrl: "/api/file/getAvatar/",
  imageUrl: "/api/file/getImage/",
  webDomain: import.meta.env.VITE_WEB_DOMAIN,
};
app.config.globalProperties.Verify = Verify;
app.config.globalProperties.Message = Message;
app.config.globalProperties.Request = Request;
app.config.globalProperties.Utils = Utils;
app.config.globalProperties.Confirm = Confirm;

app.component("Dialog", Dialog);
app.component("Avatar", Avatar);
app.component("Cover", Cover);
app.component("Table", Table);
app.component("CoverUpload", CoverUpload);

app.use(router);
app.use(ElementPlus);

app.mount("#app");

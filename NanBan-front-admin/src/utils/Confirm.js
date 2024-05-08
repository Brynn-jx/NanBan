import { ElMessageBox } from "element-plus";

const Confirm = (message, okfun) => {
  ElMessageBox.confirm(message, "提示", {
    confirmButtonText: "确定",
    cancelButtonClass: "取消",
    type: "info",
  })
    .then(async () => {
      okfun();
    })
    .catch(() => {});
};

export default Confirm;

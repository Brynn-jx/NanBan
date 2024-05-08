export default {
  sizeToStr: (size) => {
    var data = "";
    if (size < 0.1 * 1024) {
      // 如果小于0.1KB转化为B
      data = size.toFixed(2) + "B";
    } else if (size < 0.1 * 1024 * 1024) {
      // 如果小于0.1MB转化为kb
      data = (size / 1024).toFixed(2) + "KB";
    } else if (size < 0.1 * 1024 * 1024 * 1024) {
      data = (size / (1024 * 1024)).toFixed(2) + "MB";
    } else {
      data = (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    }
    var sizestr = data + "";
    var len = sizestr.indexOf(".");
    var dec = sizestr.substr(len + 1, 2);
    if (dec == "00") {
      return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
    }
    return sizestr;
  },
};

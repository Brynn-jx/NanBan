<template>
  <div class="post-comment-panel">
    <div class="user-avatar">
      <div
        class="avatar"
        style="width: 50px; height: 50px; border-radius: 25px"
      >
        <div class="no-login" v-if="userId == null">未登录</div>
        <Avatar v-else :userId="userId" :width="avatarWidth"></Avatar>
      </div>
    </div>

    <div class="comment-form">
      <el-form :model="formData" ref="formDataRef" :rules="rules">
        <!-- textarea输入 -->
        <!-- prop传入的是form表单中model中的字段 对其进行校验 -->
        <el-form-item prop="content">
          <el-input
            type="textarea"
            :rows="3"
            :maxlength="800"
            show-word-limit
            v-model="formData.content"
            :placeholder="placeholderInfo"
            clearable
            resize="none"
          ></el-input>
          <div class="insert-img" v-if="showInsertImg">
            <div class="pre-img" v-if="commentImg">
              <CommentImage :src="commentImg"></CommentImage>
              <span
                class="iconfont icon-remove"
                @click="removeCommentImg"
              ></span>
            </div>
            <el-upload
              v-else
              name="file"
              :show-file-list="false"
              accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
              :multiple="false"
              :http-request="selecImg"
            >
              <span class="iconfont icon-image"></span>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="send-btn" @click="postCommentDo">发表</div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import CommentImage from "./CommentImage.vue";
import message from "@/utils/Message";

const { proxy } = getCurrentInstance();

const api = {
  postComment: "/comment/postComment",
};
const props = defineProps({
  articleId: {
    type: String,
  },
  avatarWidth: {
    type: Number,
  },
  userId: {
    type: String,
  },
  showInsertImg: {
    type: Boolean,
  },
  placeholderInfo: {
    type: String,
    default: "请大家文明发言",
  },
  pCommentId: {
    type: Number,
  },
  replyUserId: {
    type: String,
  },
});
//form信息
const checkPostComment = (rule, value, callback) => {
  if (value == null && formData.value.image == null) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};
const formData = ref({});
const formDataRef = ref();
const rules = {
  content: [
    { required: true, message: "请输入评论内容", validator: checkPostComment },
    { min: 5, message: "评论至少5个字" },
  ],
};

// 自定义上传方法
const commentImg = ref(null);
const selecImg = (file) => {
  file = file.file;
  let img = new FileReader();
  img.readAsDataURL(file);
  img.onload = ({ target }) => {
    let imgData = target.result;
    commentImg.value = imgData;
    formData.value.image = file;
  };
};

const removeCommentImg = () => {
  commentImg.value = null;
  formData.value.image = null;
};
// 发布评论
const emit = defineEmits(["postCommentFinish"]);
const postCommentDo = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = Object.assign({}, formData.value);
    params.articleId = props.articleId;
    params.pCommentId = props.pCommentId;
    params.replyUserId = props.replyUserId;
    let result = await proxy.Request({
      url: api.postComment,
      params,
    });
    if (!result) {
      return;
    }
    proxy.Message.success("评论发表成功");
    formDataRef.value.resetFields();
    removeCommentImg(), emit("postCommentFinish", result.data);
  });
};
</script>

<style lang="scss">
.post-comment-panel {
  display: flex;
  align-items: top;
  .user-avatar {
    width: 60px;
    .avatar {
      display: flex;
      background: rgb(238, 238, 238);
      align-items: center;
      overflow: hidden;
      cursor: pointer;
      .no-login {
        width: 100%;
        text-align: center;
        font-size: 13px;
      }
    }
  }
  .comment-form {
    flex: 1;
    margin: 0px 10px;
    .el-textarea__inner {
      height: 60px;
    }
    .insert-img {
      line-height: normal;
      .iconfont {
        margin-top: 3px;
        font-size: 20px;
      }
    }
    .pre-img {
      margin-top: 10px;
      position: relative;
      .iconfont {
        cursor: pointer;
        position: absolute;
        top: -10px;
        right: -10px;
        color: rgb(121, 121, 121);
      }
    }
  }
  .send-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    background: rgb(22, 142, 240);
    color: #fff;
    text-align: center;
    width: 60px;
    height: 60px;
    padding: 0 14px;
    border-radius: 5px;
  }
}
</style>

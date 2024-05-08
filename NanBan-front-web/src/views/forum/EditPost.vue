<template>
  <div class="edit-post">
    <el-form
      :model="formData"
      ref="formDataRef"
      :rules="rules"
      label-width="60px"
      class="post-panel"
    >
      <div class="post-editor">
        <el-card :body-style="{ padding: '5px' }">
          <template #header>
            <div class="post-editor-title">
              <span>正文</span>
              <div class="change-editor-type">
                <span class="iconfont icon-change" @click="changeEditor">
                  切换为{{
                    editorType == 0 ? "markdown编辑器" : "富文本编辑器"
                  }}
                </span>
              </div>
            </div>
          </template>
          <!-- card body -->
          <el-form-item prop="content" label-width="0">
            <EditorHtml
              :height="htmlEditorHeight"
              v-if="editorType == 0"
              v-model="formData.content"
            ></EditorHtml>
            <EditorMarkdown
              :height="markdownHeight"
              v-if="editorType == 1"
              v-model="formData.markdownContent"
              @htmlContent="setHtmlContent"
            ></EditorMarkdown>
          </el-form-item>
        </el-card>
      </div>
      <div class="post-setting">
        <el-card :body-style="{ padding: '5px' }">
          <template #header>
            <span>设置</span>
          </template>
          <div class="setting-inner">
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="formData.title"
                clearable
                placeholder="标题信息"
                :maxlength="150"
              ></el-input>
            </el-form-item>
            <el-form-item label="板块" prop="boardIds">
              <el-cascader
                placeholder="请选择板块"
                :options="boardList"
                v-model="formData.boardIds"
                clearable
                :props="boardProps"
                :style="{ width: '100%' }"
              >
              </el-cascader>
            </el-form-item>
            <el-form-item label="封面" prop="cover">
              <CoverUpload v-model="formData.cover"></CoverUpload>
            </el-form-item>
            <el-form-item label="摘要" prop="summary">
              <el-input
                clearable
                placeholder="提示信息"
                type="textarea"
                :rows="5"
                :maxlength="200"
                resize="none"
                show-word-limit
                v-model="formData.summary"
              ></el-input>
            </el-form-item>
            <el-form-item label="附件" prop="attachment">
              <AttachmentSelector
                v-model="formData.attachment"
              ></AttachmentSelector>
            </el-form-item>
            <el-form-item
              label="积分"
              prop="integral"
              v-if="formData.attachment"
            >
              <el-input
                v-model="formData.integral"
                placeholder="请输入积分"
                clearable
              ></el-input>
              <span class="tips">附件下载积分，0表示无需积分下载</span>
            </el-form-item>

            <el-form-item label="">
              <el-button
                type="primary"
                :style="{ width: '100%' }"
                @click="postHandler"
                >保存</el-button
              >
            </el-form-item>
          </div>
        </el-card>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import EditorMarkdown from "@/components/EditorMarkdown.vue";
import EditorHtml from "@/components/EditorHtml.vue";
import { ref, getCurrentInstance, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import message from "@/utils/Message";

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const markdownHeight = window.innerHeight - 80 - 60;
const htmlEditorHeight = window.innerHeight - 80 - 140;

const api = {
  loadBoard4Post: "/forum/loadBoard4Post",
  postArticle: "/forum/postArticle",
  articleDetail4Update: "/forum/articleDetail4Update",
  updateArticle: "/forum/updateArticle",
};

const articleId = ref(null);

const getArticleDetail = () => {
  nextTick(async () => {
    formDataRef.value.resetFields();
    if (articleId.value) {
      // 修改
      let result = await proxy.Request({
        url: api.articleDetail4Update,
        params: {
          articleId: articleId.value,
        },
        showError: false,
        errorCallback: (response) => {
          ElMessageBox.alert(response.info, "错误", {
            "show-close": false,
            callback: (action) => {
              // route查看路由信息，router进行路由跳转
              router.go(-1);
            },
          });
        },
      });
      if (!result) {
        return;
      }
      let articleInfo = result.data.forumArticle;
      // 设置编辑器
      editorType.value = articleInfo.editorType;
      // 设置板块信息
      articleInfo.boardIds = [];
      articleInfo.boardIds.push(articleInfo.pBoardId);
      if (articleInfo.boardId != null && articleInfo.boardId != 0) {
        articleInfo.boardIds.push(articleInfo.boardId);
      }
      // 设置封面信息
      if (articleInfo.cover) {
        articleInfo.cover = { imageUrl: articleInfo.cover };
      }
      // 设置附件
      if (result.data.attachment) {
        articleInfo.attachment = {
          name: result.data.attachment.fileName,
        };
        articleInfo.integral = result.data.attachment.integral;
      }
      formData.value = articleInfo;
    } else {
      formData.value = {};
      editorType.value = proxy.VueCookies.get("editorType") || 0;
    }
  });
};

// 设置markdown编辑器的富文本信息
const setHtmlContent = (htmlContent) => {
  formData.value.content = htmlContent;
};

watch(
  () => route,
  (newVal, oldVal) => {
    if (
      newVal.path.indexOf("/editPost") != -1 ||
      newVal.path.indexOf("/newPost") != -1
    ) {
      articleId.value = newVal.params.articleId;
      getArticleDetail();
    }
  },
  { immediate: true, deep: true }
);
const formData = ref({});
const formDataRef = ref();
const rules = {
  title: [{ required: true, message: "请输入内容" }],
  boardIds: [{ required: true, message: "请选择板块" }],
  content: [{ required: true, message: "请输入正文" }],
  integral: [
    { required: true, message: "请输入下载所需积分" },
    { validator: proxy.Verify.number, message: "积分只能是数字" },
  ],
};

// 提交信息
const postHandler = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    // 设置板块ID
    if (params.boardIds.length == 1) {
      params.pBoardId = params.boardIds[0];
    } else if (params.boardIds.length == 2) {
      params.pBoardId = params.boardIds[0];
      params.boardId = params.boardIds[1];
    }
    delete params.boardIds;
    // 设置编辑器类型
    params.editorType = editorType.value;
    // 获取内容
    const contentText = params.content.replace(/<(?!img).*?>/g, "");
    if (contentText == "") {
      proxy.Message.warning("正文不能为空");
      return;
    }
    if (params.attachment != null) {
      params.attachmentType = 1;
    } else {
      params.attachmentType = 0;
    }
    // 封面 当重新上传时是一个文件流
    console.log(params.cover);
    if (!(params.cover instanceof File)) {
      delete params.cover;
    }
    // 附件不是文件类型，值设置为空
    if (!(params.attachment instanceof File)) {
      delete params.attachment;
    }
    let result = await proxy.Request({
      url: params.articleId ? api.updateArticle : api.postArticle,
      params: params,
    });
    if (!result) {
      return;
    }
    console.log(params);
    proxy.Message.success("保存成功");
    router.push(`/post/${result.data}`);
  });
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
    url: api.loadBoard4Post,
  });
  if (!result) {
    return;
  }
  boardList.value = result.data;
};
loadBoardList();

// 编辑器类型 0：富文本 1：markdown
const editorType = ref(0);
const changeEditor = () => {
  proxy.Confirm("切换编辑器会清空正在编辑的内容，确定要切换吗？", () => {
    editorType.value = editorType.value == 0 ? 1 : 0;
    formData.value.content = "";
    formData.value.markdownContent = "";
    proxy.VueCookies.set("editorType", editorType.value, -1);
  });
};
</script>

<style lang="scss">
.edit-post {
  .post-panel {
    display: flex;
    .el-card__header {
      padding: 10px;
    }
    .post-editor {
      flex: 1;
      .post-editor-title {
        display: flex;
        justify-content: space-between;
        .change-editor-type {
          .iconfont {
            cursor: pointer;
            color: var(--link);
            font-size: 14px;
          }
        }
      }
    }
    .post-setting {
      width: 450px;
      margin-left: 10px;
      .setting-inner {
        max-height: calc(100vh - 150px);
        overflow: auto;
        .el-form-item {
          align-items: flex-start;
        }
      }
    }
    .tips {
      color: #797979;
      font-size: 13px;
    }
  }
}
</style>

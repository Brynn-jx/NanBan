<template>
  <div
    class="container-body article-detail-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
    v-if="Object.keys(articleInfo).length > 0"
  >
    <!-- 板块导航 -->
    <div class="board-info">
      <router-link :to="`/forum/${articleInfo.pBoardId}`" class="a-link"
        >{{ articleInfo.pBoardName }}
      </router-link>
      <span class="iconfont icon-right"></span>
      <template v-if="articleInfo.boardId">
        <router-link
          class="a-link"
          :to="`/forum/${articleInfo.pBoardId}/${articleInfo.boardId}`"
        >
          {{ articleInfo.boardName }}
        </router-link>
        <span class="iconfont icon-right"> </span>
      </template>

      <span>{{ articleInfo.title }}</span>
    </div>
    <!-- 文章详情 -->
    <div class="detail-container" :style="{ width: '1000px' }">
      <div class="article-detail">
        <div class="title">
          <span v-if="articleInfo.status == 0" class="tag tag-no-audit"
            >待审核</span
          >
          {{ articleInfo.title }}
        </div>
        <!-- 用户信息 -->
        <div class="user-info">
          <Avatar :userId="articleInfo.userId" :width="50"></Avatar>
          <div class="user-info-detail">
            <router-link
              :to="`/user/${articleInfo.userId}`"
              class="nick-name"
              >{{ articleInfo.nickName }}</router-link
            >
            <div class="time-info">
              <span>{{ articleInfo.postTime }}</span>
              <span class="address">{{ articleInfo.userIpAddress }}</span>
              <span class="iconfont icon-eye-solid">
                {{
                  articleInfo.readCount == 0 ? "阅读" : articleInfo.readCount
                }}
              </span>
              <router-link
                :to="`/editPost/${articleInfo.articleId}`"
                class="a-link btn-edit"
              >
                <span class="iconfont icon-edit">编辑</span>
              </router-link>
            </div>
          </div>
        </div>
        <!--文章内容 -->
        <div class="detail" id="detail" v-html="articleInfo.content"></div>
      </div>
      <!-- 附件 -->
      <div class="attachment-panel" v-if="attachment" id="view-attachment">
        <div class="title">附件</div>
        <div class="attachment-info">
          <div class="iconfont icon-zip item"></div>
          <div class="file-name item">{{ attachment.fileName }}</div>
          <div class="size item">
            {{ proxy.Utils.sizeToStr(attachment.fileSize) }}
          </div>
          <div class="item">
            需要<span class="integral">{{ attachment.integral }}</span
            >积分
          </div>
          <div class="download-count item">
            已下载{{ attachment.downloadCount }} 次
          </div>
          <div class="download-btn item">
            <el-button
              type="primary"
              size="small"
              @click="downloadAttachment(attachment.fileId)"
            >
              下载
            </el-button>
          </div>
        </div>
      </div>
      <!-- 评论 -->
      <div
        class="comment-panel"
        id="view-comment"
        v-if="showComment && articleInfo.status == 1"
      >
        <!-- 评论组件 -->
        <CommentList
          v-if="articleInfo.articleId"
          :articleId="articleInfo.articleId"
          :articleUserId="articleInfo.userId"
          @updateCommentCount="updateCommentCount"
        ></CommentList>
      </div>
    </div>
    <!-- 目录 -->
    <div class="top-panel">
      <div class="top-container">
        <div class="toc-title">目录</div>
        <div class="toc-list">
          <template v-if="tocArray.length == 0">
            <div class="no-toc">未解析到目录</div></template
          >
          <template v-else>
            <div v-for="toc in tocArray">
              <span
                :class="['toc-item', toc.id == anchorId ? 'active' : '']"
                @click="gotoAnchor(toc.id)"
                :style="{ 'padding-left': toc.level * 15 + 'px' }"
                >{{ toc.title }}</span
              >
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <!-- 左侧快捷操作 -->
  <div class="quick-panel" :style="{ left: quickPanelLeft + 'px' }">
    <!-- 点赞 -->
    <el-badge
      :value="articleInfo.goodCount"
      :max="99"
      :is-dot="false"
      :hidden="!articleInfo.goodCount > 0"
      type="info"
    >
      <div class="quick-item" @click="doLikeHandler">
        <span
          :class="['iconfont icon-good', haveLike ? 'have-like' : '']"
        ></span>
      </div>
    </el-badge>
    <!-- 评论 -->
    <el-badge
      v-if="showComment"
      :value="articleInfo.commentCount"
      :max="99"
      :is-dot="false"
      :hidden="!articleInfo.commentCount > 0"
      type="info"
    >
      <div
        class="quick-item"
        @click="goToPostion('view-comment')"
        v-if="showComment"
      >
        <span class="iconfont icon-comment"></span>
      </div>
    </el-badge>
    <!-- 附件 -->
    <div class="quick-item" @click="goToPostion('view-attachment')">
      <span class="iconfont icon-attachment"></span>
    </div>
    <ImageViewer ref="imageViewerRef" :imageList="previewImgList"></ImageViewer>
  </div>
</template>

<script setup>
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css"; // 样式
import { ref, reactive, onMounted, nextTick, onUnmounted, watch } from "vue";
import { getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import CommentList from "@/views/forum/CommentList.vue";

const store = useStore();
const route = useRoute();
const { proxy } = getCurrentInstance();
const api = {
  getArticleDetail: "/forum/getArticleDetail",
  doLike: "/forum/doLike",
  getUserDownloadInfo: "/forum/getUserDownloadInfo",
  attachmentDownload: "/api/forum/attachmentDownload",
};

const currentUserInfo = ref({});

// 文章详情
const articleInfo = ref({});

// 附件
const attachment = ref({});
// 是否已经点赞
const haveLike = ref(false);
// 快捷操作
const quickPanelLeft =
  (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 110;
const getArticleDetail = async (articleId) => {
  let result = await proxy.Request({
    url: api.getArticleDetail,
    params: {
      articleId: articleId,
    },
  });
  if (!result) {
    return;
  }
  articleInfo.value = result.data.forumArticle;
  attachment.value = result.data.attachment;
  haveLike.value = result.data.haveLike;
  store.commit("setActivePBoardId", result.data.forumArticle.pBoardId);
  store.commit("setActiveBoardId", result.data.forumArticle.boardId);
  // 图片预览
  imagePreview();
  // 代码高亮
  highlightCode();
  // 获取目录
  makeToc();
};

// 监听·登陆用户
watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    currentUserInfo.value = newVal || null;
  },
  { immediate: true, deep: true }
);
onMounted(() => {
  getArticleDetail(route.params.articleId);
});

const goToPostion = (domId) => {
  document.querySelector("#" + domId).scrollIntoView();
};

// 点赞
const doLikeHandler = async () => {
  if (!store.getters.getLoginUserInfo) {
    store.commit("showLogin", true);
    return;
  }
  let result = await proxy.Request({
    url: api.doLike,
    params: {
      articleId: articleInfo.value.articleId,
    },
  });
  if (!result) {
    return;
  }
  haveLike.value = !haveLike.value;
  let goodCount = 1;
  if (!haveLike.value) {
    goodCount = -1;
  }
  articleInfo.value.goodCount = articleInfo.value.goodCount + goodCount;
};

const downloadDo = (fileId) => {
  document.location.href = api.attachmentDownload + "?fileId=" + fileId;
  attachment.value.downloadCount = attachment.value.downloadCount + 1;
};

// 下载附件
const downloadAttachment = async (fileId) => {
  console.log(currentUserInfo.value);
  if (currentUserInfo.value == null) {
    store.commit("showLogin", true);
    return;
  }
  if (
    attachment.value.integral == 0 ||
    currentUserInfo.value.userId == articleInfo.value.userId
  ) {
    downloadDo(fileId);
    return;
  }
  // 获取用户下载信息
  let result = await proxy.Request({
    url: api.getUserDownloadInfo,
    params: {
      fileId: fileId,
    },
  });
  if (!result) {
    return;
  }
  // 如果是已经下载过了
  if (result.data.haveDownload) {
    downloadDo(fileId);
    return;
  }
  // 判断用户积分是否足够
  if (result.data.userIntegral < attachment.value.integral) {
    proxy.Message.warning("你的积分不够无法下载");
    return;
  }
  proxy.Confirm(
    `你还有${result.data.userIntegral}积分，当前下载会扣除${attachment.value.integral}积分，确定要下载吗？`,
    () => {
      downloadDo(fileId);
    }
  );
};

//  文章图片预览
const imageViewerRef = ref(null);
const previewImgList = ref([]);
const imagePreview = () => {
  nextTick(() => {
    const imageNodeList = document
      .querySelector("#detail")
      .querySelectorAll("img");
    const imageList = [];
    imageNodeList.forEach((item, index) => {
      const src = item.getAttribute("src");
      imageList.push(src);
      item.addEventListener("click", () => {
        imageViewerRef.value.show(index);
      });
    });
    previewImgList.value = imageList;
  });
};

//代码高亮
const highlightCode = () => {
  nextTick(() => {
    let blocks = document.querySelectorAll("pre code");
    blocks.forEach((item) => {
      hljs.highlightBlock(item);
    });
  });
};

// 更新评论数量
const updateCommentCount = (commentCount) => {
  articleInfo.value.commentCount = commentCount;
};

// 解析目录
const tocArray = ref([]);
const makeToc = () => {
  nextTick(() => {
    const tocTags = ["H1", "H2", "H3", "H4", "H5", "H6"];
    // 获取所有H标签
    const contentDom = document.querySelector("#detail");
    const childNodes = contentDom.childNodes;

    let index = 0;
    childNodes.forEach((item) => {
      let tagName = item.tagName;
      if (tagName == undefined || !tocTags.includes(tagName.toUpperCase())) {
        return true;
      }
      index++;
      let id = "toc" + index;
      // 加上锚点
      item.setAttribute("id", id);
      tocArray.value.push({
        id: id,
        title: item.innerText,
        level: Number.parseInt(tagName.substring(1)),
        offsetTop: item.offsetTop,
      });
    });
  });
};
const anchorId = ref(null);
const gotoAnchor = (domId) => {
  const dom = document.querySelector("#" + domId);
  dom.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const listenerScroll = () => {
  let currentScrollTop = getScrollTop();
  tocArray.value.some((item, index) => {
    if (
      (index < tocArray.value.length - 1 &&
        currentScrollTop >= tocArray.value[index].offsetTop &&
        currentScrollTop < tocArray.value[index + 1].offsetTop) ||
      (index == tocArray.value.length - 1 &&
        currentScrollTop >= tocArray.value[index].offsetTop)
    ) {
      anchorId.value = item.id;
      return true;
    }
  });
};

// 获取滚动条的高度
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop;
  return scrollTop;
};

onMounted(() => {
  window.addEventListener("scroll", listenerScroll, false);
});

onUnmounted(() => {
  window.removeEventListener("scroll", listenerScroll, false);
});

// 监听系统设置
const showComment = ref(false);
watch(
  () => store.state.sysSetting,
  (newVal, oldVal) => {
    showComment.value = newVal.commentOpen;
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.article-detail-body {
  position: relative;
  padding: 10px 0 20px;
  .board-info {
    line-height: 40px;
    .icon-right {
      margin: 0px 10px;
    }
  }
  .detail-container {
    .article-detail {
      background: #fff;
      padding: 10px;
      .title {
        font-weight: 700;
        font-size: 16px;
      }
      .user-info {
        margin-top: 15px;
        display: flex;
        padding-bottom: 15px;
        border-bottom: 1px solid #ddd;
        .user-info-detail {
          margin-left: 10px;
          .nick-name {
            text-decoration: none;
            color: #4e5969;
            font-size: 15px;
          }
          .nick-name:hover {
            color: var(--link);
          }
          .time-info {
            margin-top: 5px;
            font-size: 13px;
            color: var(--text2);
            .iconfont {
              margin-left: 10px;
            }
            .iconfont:before {
              padding-right: 3px;
            }
            .btn-edit {
              .iconfont {
                font-size: 14px;
              }
            }
          }
        }
      }
      .detail {
        letter-spacing: 1px;
        line-height: 22px;
        a {
          text-decoration: none;
          color: var(--link);
        }
        img {
          max-width: 90%;
          cursor: pointer;
        }
      }
    }
    .attachment-panel {
      background: #fff;
      margin-top: 20px;
      padding: 20px;
      .title {
        font-size: 18px;
      }
      .attachment-info {
        display: flex;
        align-items: center;
        color: #9f9f9f;
        margin-top: 10px;
        .item {
          margin-right: 10px;
        }
        .icon-zip {
          font-size: 20px;
          color: #6ca1f7;
        }
        .file-name {
          color: #6ca1f7;
        }
        .integral {
          color: red;
          padding: 0px 5px;
        }
      }
    }
    .comment-panel {
      background: #fff;
      margin-top: 20px;
      padding: 20px;
    }
  }
}

.quick-panel {
  position: fixed;
  width: 50px;
  top: 200px;
  text-align: center;
  .el-badge__content.is-fixed {
    top: 5px;
    right: 15px;
  }
  .quick-item {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #fff;
    margin-bottom: 30px;
    cursor: pointer;
    .iconfont {
      font-size: 22px;
      color: var(--text2);
    }
    .have-like {
      color: red;
    }
  }
}

.top-panel {
  position: absolute;
  top: 50px;
  right: 0px;
  width: 285px;
  height: 500px;
  .top-container {
    width: 285px;
    position: fixed;
    background: #fff;
    .toc-title {
      border-bottom: 1px solid #ddd;
      padding: 10px;
    }
    .toc-list {
      max-height: cal(100vh -200px);
      overflow: auto;
      padding: 5px;
      .no-toc {
        text-align: center;
        line-height: 40px;
        font-size: 13px;
        color: #5f5f5f;
      }
      .toc-item {
        cursor: pointer;
        text-decoration: none;
        display: block;
        line-height: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #555666;
        border-radius: 3px;
        font-size: 14px;
        border-left: 2px solid #fff;
      }
      .toc-item:hover {
        background: #eeeded;
      }
      .active {
        border-left: 2px solid #6ca1f7;
        border-radius: 0px 3px 3px 0px;
        background: #eeeded;
      }
    }
  }
}
</style>

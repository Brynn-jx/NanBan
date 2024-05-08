<template>
  <div class="comment-body">
    <div class="comment-count-info">
      <div class="title">
        评论
        <span class="count">{{ commentInfo.totalCount }}</span>
      </div>
      <div class="tab">
        <span @click="orderChange(0)" :class="[orderType == 0 ? 'active' : '']"
          >热榜</span
        >
        <el-divider
          direction="vertical"
          content-position="left"
          role="separator"
        ></el-divider>
        <span @click="orderChange(1)" :class="[orderType == 1 ? 'active' : '']"
          >最新</span
        >
      </div>
    </div>
    <!-- 发送评论 -->
    <div class="comment-form-panel">
      <CommentPost
        :articleId="articleId"
        :pCommentId="0"
        :avatarWidth="50"
        :userId="loginUserInfo.userId"
        :showInsertImg="loginUserInfo.userId != null"
        @postCommentFinish="postCommentFinish"
      ></CommentPost>
    </div>
    <div class="comment-list">
      <DataList
        :dataSource="commentInfo"
        :loading="loading"
        @loadData="getCommentInfo"
        noDataMsg="暂无评论，赶紧占沙发吧！"
      >
        <template #default="{ data }">
          <CommentListItem
            :articleId="articleId"
            :commentData="data"
            :currentUserId="loginUserInfo.userId"
            :articleUserId="articleUserId"
            @hiddenAllReply="hiddenAllReplyHandler"
            @reloadData="getCommentInfo"
          ></CommentListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<script setup>
import CommentPost from "./CommentPost.vue";
import { ref, onMounted, watch } from "vue";
import { getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import CommentListItem from "./CommentListItem.vue";

const { proxy } = getCurrentInstance();
const route = useRoute();
const store = useStore();
const api = {
  loadComment: "/comment/loadComment",
};

//  给组件传的参数
const props = defineProps({
  articleId: {
    type: String,
  },
  articleUserId: {
    type: String,
  },
});
// console.log(props.articleUserId);
// 获取用户信息
const loginUserInfo = ref({});
watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    loginUserInfo.value = newVal || {};
  },
  { immediate: true, deep: true }
);

// 排序
const orderType = ref(0);
const orderChange = (type) => {
  orderType.value = type;
  getCommentInfo();
};
// 获取评论信息
const commentInfo = ref({});
const loading = ref(null);
const getCommentInfo = async () => {
  let params = {
    pageNo: commentInfo.value.pageNo,
    articleId: props.articleId,
    orderType: orderType.value,
  };
  loading.value = true;
  let result = await proxy.Request({
    url: api.loadComment,
    params: params,
    showLoading: false,
  });
  loading.value = false;
  if (!result) {
    return;
  }
  commentInfo.value = result.data;
};
onMounted(() => {
  getCommentInfo();
});
//隐藏所有回复框
const hiddenAllReplyHandler = () => {
  commentInfo.value.list.forEach((element) => {
    element.showReply = false;
  });
};

// 评论发布完成
const emit = defineEmits(["updateCommentCount"]);
const postCommentFinish = (resultData) => {
  commentInfo.value.list.unshift(resultData);
  const totalCount = commentInfo.value.totalCount + 1;
  commentInfo.value.totalCount = totalCount;
  emit("updateCommentCount", totalCount);
};
</script>

<style lang="scss">
.comment-body {
  .comment-count-info {
    display: flex;
    .title {
      font-size: 23px;
      font-weight: 500;
      .count {
        font-size: 15px;
        font-weight: 400;
      }
    }
    .tab {
      margin-left: 25px;
      display: flex;
      align-items: center;
      cursor: pointer;
      .active {
        color: var(--link);
      }
    }
  }
  .comment-form-panel {
    margin-bottom: 20px;
  }
}
</style>

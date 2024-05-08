<template>
  <div class="comment-item">
    <div class="avatar">
      <Avatar :userId="commentData.userId" :width="50"></Avatar>
    </div>
    <div class="comment-info">
      <div class="nick-name">
        <span class="name" @click="gotoUcenter(commentData.userId)">{{
          commentData.nickName
        }}</span>
        <span v-if="commentData.userId == articleUserId" class="tag-author">
          作者
        </span>
      </div>
      <div class="comment-content">
        <div>
          <span class="tag tag-topping" v-if="commentData.topType == 1"
            >置顶</span
          >
          <span class="tag no-audit" v-if="commentData.status == 0"
            >待审核</span
          >
          <span v-html="commentData.content"></span>
        </div>

        <CommentImage
          :style="{ 'margin-top': '10px' }"
          v-if="commentData.imgPath"
          :src="
            proxy.globalInfo.imageUrl + commentData.imgPath.replace('.', '_.')
          "
          :img-list="[proxy.globalInfo.imageUrl + commentData.imgPath]"
        ></CommentImage>
      </div>
      <div class="op-panel">
        <div class="time">
          <span>{{ commentData.postTime }}</span>
          <span>&nbsp;·&nbsp;{{ commentData.userIpAddress }}</span>
        </div>
        <div
          :class="[
            'iconfont icon-good',
            commentData.likeType == 1 ? 'active' : '',
          ]"
          @click="doLike(commentData)"
        >
          <span>{{
            commentData.goodCount == 0 ? "点赞" : commentData.goodCount
          }}</span>
        </div>
        <div
          class="iconfont icon-comment reply-btn"
          @click="showReplyPanel(commentData, 0)"
        >
          <span> 回复 </span>
        </div>

        <el-dropdown v-if="currentUserId == articleUserId">
          <div class="iconfont icon-more"></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="opTop(commentData)">
                {{ commentData.topType == 0 ? "置顶" : "取消置顶" }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="comment-sub-list" v-if="commentData.children">
        <div class="comment-sub-item" v-for="sub in commentData.children">
          <Avatar :userId="sub.userId" :width="30"></Avatar>
          <div class="comment-sub-info">
            <div class="nick-name">
              <span class="name" @click="gotoUcenter(sub.userId)">{{
                sub.nickName
              }}</span>
              <span class="tag-author" v-if="sub.userId == articleUserId"
                >作者</span
              >
              <span class="reply-name">回复</span>
              <span @click="gotoUcenter(sub.replyUserId)" class="a-link"
                >@{{ sub.replyNickName }}</span
              >
              <span>： </span>
              <span class="sub-content" v-html="sub.content"></span>
            </div>
            <div class="op-panel">
              <div class="time">
                <span>{{ sub.postTime }}</span>
                <span>&nbsp;·&nbsp;{{ sub.userIpAddress }}</span>
              </div>
              <div
                :class="[
                  'iconfont icon-good',
                  sub.likeType == 1 ? 'active' : '',
                ]"
                @click="doLike(sub)"
              >
                <span>{{ sub.goodCount == 0 ? "点赞" : sub.goodCount }}</span>
              </div>
              <div
                class="iconfont icon-comment reply-btn"
                @click="showReplyPanel(sub, 1)"
              >
                <span> 回复 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="reply-info" v-if="commentData.showReply">
        <CommentPost
          :articleId="articleId"
          :pCommentId="pCommentId"
          :replyUserId="replyUserId"
          :avatarWidth="30"
          :userId="currentUserId"
          :showInsertImg="false"
          :placeholderInfo="placeholderInfo"
          @postCommentFinish="postCommentFinish"
        ></CommentPost>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import ArticleDetail from "./ArticleDetail.vue";
import CommentPost from "./CommentPost.vue";
import Avatar from "@/components/Avatar.vue";
import { useStore } from "vuex";
import CommentImage from "./CommentImage.vue";

const router = useRouter();
const store = useStore();
const { proxy } = getCurrentInstance();
const api = {
  doLike: "/comment/doLike",
  changeTopType: "/comment/changeTopType",
};
// 获取用户信息
const loginUserInfo = ref({});
watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    loginUserInfo.value = newVal || null; // 原来是{}
  },
  { immediate: true, deep: true }
);
const props = defineProps({
  commentData: {
    type: Object,
  },
  articleUserId: {
    type: String,
  },
  currentUserId: {
    type: String,
  },
  articleId: {
    type: String,
  },
});

const pCommentId = ref(0);
const replyUserId = ref(null);
const placeholderInfo = ref(null);
const emit = defineEmits(["hiddenAllReply", "reloadData"]);
const showReplyPanel = (curData, type) => {
  if (loginUserInfo.value == null) {
    store.commit("showLogin", true);
    return;
  }
  const haveShow =
    props.commentData.showReply == undefined
      ? false
      : props.commentData.showReply;
  emit("hiddenAllReply");
  if (type == 0) {
    props.commentData.showReply = !haveShow;
  } else {
    props.commentData.showReply = true;
  }
  pCommentId.value = props.commentData.commentId;
  replyUserId.value = curData.userId;
  placeholderInfo.value = "回复 @" + curData.nickName;
};

const postCommentFinish = (resultData) => {
  props.commentData.children = resultData;
  placeholderInfo.value = undefined;
};

const gotoUcenter = (userId) => {
  router.push(`/user/${userId}`);
};

// 点赞
const doLike = async (data) => {
  console.log(loginUserInfo.value);
  if (loginUserInfo.value == null) {
    store.commit("showLogin", true);
    return;
  }
  let result = await proxy.Request({
    url: api.doLike,
    showLoading: false,
    params: {
      commentId: data.commentId,
    },
  });
  if (!result) {
    return;
  }
  data.goodCount = result.data.goodCount;
  data.likeType = result.data.likeType;
};

// 置顶
const opTop = async (data) => {
  let result = await proxy.Request({
    url: api.changeTopType,
    params: {
      commentId: data.commentId,
      topType: data.topType == 1 ? 0 : 1,
    },
    showLoading: false,
  });
  if (!result) {
    return;
  }
  emit("reloadData");
};
</script>

<style lang="scss">
.comment-item {
  display: flex;
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 25px;
  }
  .comment-info {
    flex: 1;
    margin-left: 15px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
    .nick-name {
      .name {
        margin-top: 5px;
        font-size: 14px;
        color: var(--text2);
      }
    }
    .tag-author {
      background: var(--pink);
      color: #fff;
      font-size: 12px;
      border-radius: 2px;
      padding: 0px 3px;
    }
    .comment-content {
      font-size: 16px;
      line-height: 22px;
      margin-top: 10px;
      .tag {
        margin-right: 5px;
        font-size: 15px;
        border-radius: 3px;
        padding: 0px 5px;
      }
      .tag-topping {
        color: var(--pink);
        border: 1px solid var(--pink);
      }
      .no-audit {
        color: var(--text2);
        border: 1px solid var(--text2);
      }
    }
    .op-panel {
      margin-top: 5px px;
      display: flex;
      align-items: center;
      .time {
        font-size: 13px;
        color: var(--text1);
        margin-right: 20px;
      }
      .iconfont {
        margin-right: 15px;
        color: var(--icon);
        font-size: 15px;
        cursor: pointer;
      }
      .iconfont span {
        display: inline-block;
        padding-left: 5px;
        min-width: 15px;
        font-size: 14px;
      }
      .active {
        color: var(--link);
      }
    }
    .comment-sub-list {
      margin-top: 10px;
      .comment-sub-item {
        display: flex;
        margin: 8px 0px;
        font-size: 14px;
        .comment-sub-info {
          margin-left: 5px;
          .nick-name {
            .reply-name {
              margin: 0px 5px;
            }
          }
          .sub-content {
            font-size: 15px;
          }
        }
      }
    }
  }
}
</style>

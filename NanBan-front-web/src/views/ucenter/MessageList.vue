<template>
  <div
    class="container-body message-center"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <div class="user-banner">
      <router-link to="/" class="a-link">首页</router-link>
      <span class="iconfont icon-right"></span>
      <span>消息中心</span>
    </div>
    <div class="message-panel">
      <div class="tab-list">
        <el-tabs :model-value="activeTabName" @tab-change="changeTab">
          <el-tab-pane name="reply">
            <template #label>
              <div class="tab-item">
                <span>回复我的</span>
                <span class="count-tag" v-if="messageCountInfo.reply > 0">
                  {{
                    messageCountInfo.reply > 99 ? "99+" : messageCountInfo.reply
                  }}
                </span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likePost">
            <template #label>
              <div class="tab-item">
                <span>赞了我的文章</span>
                <span class="count-tag" v-if="messageCountInfo.likePost > 0">
                  {{
                    messageCountInfo.likePost > 99
                      ? "99+"
                      : messageCountInfo.likePost
                  }}
                </span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="downloadAttachment">
            <template #label>
              <div class="tab-item">
                <span>下载了我的附件</span>
                <span
                  class="count-tag"
                  v-if="messageCountInfo.downloadAttachment > 0"
                >
                  {{
                    messageCountInfo.downloadAttachment > 99
                      ? "99+"
                      : messageCountInfo.downloadAttachment
                  }}
                </span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likeComment">
            <template #label>
              <div class="tab-item">
                <span>赞了我的评论</span>
                <span class="count-tag" v-if="messageCountInfo.likeComment > 0">
                  {{
                    messageCountInfo.likeComment > 99
                      ? "99+"
                      : messageCountInfo.likeComment
                  }}
                </span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="sys">
            <template #label>
              <div class="tab-item">
                <span>系统消息</span>
                <span class="count-tag" v-if="messageCountInfo.sys > 0">
                  {{ messageCountInfo.sys > 99 ? "99+" : messageCountInfo.sys }}
                </span>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
        <router-link :to="`/user/${userId}`" class="a-link go-ucenter">
          &lt;&lt;个人中心
        </router-link>
      </div>

      <div class="message-list">
        <DataList
          :dataSource="messageListInfo"
          @loadData="loadMessage"
          :loading="loading"
          noDataMsg="暂无消息"
        >
          <!-- 这里的data是dataSource中的每一项数据 -->
          <!--系统消息  -->
          <template #default="{ data }">
            <div class="message-item" v-if="data.messageType == 0">
              <div class="message-content">
                <span v-html="data.messageContent"></span>
                <span class="create-time">{{ data.createTime }}</span>
              </div>
            </div>
            <!--回复我的 -->
            <div class="message-item" v-if="data.messageType == 1">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  对我的文章【<router-link
                    class="a-link"
                    :to="`/post/${data.articleId}`"
                    >{{ data.articleTitle }}</router-link
                  >】 发表了评论
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
                <div class="reply-content" v-html="data.messageContent"></div>
              </div>
            </div>
            <!-- 赞了我的评论 -->
            <div class="message-item" v-if="data.messageType == 3">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  在文章【<router-link
                    class="a-link"
                    :to="`/post/${data.articleId}`"
                    >{{ data.articleTitle }}</router-link
                  >】 赞了我的评论
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
                <div class="reply-content" v-html="data.messageContent"></div>
              </div>
            </div>
            <!-- 赞了我的文章 -->
            <div class="message-item" v-if="data.messageType == 2">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  赞了我的文章【<router-link
                    class="a-link"
                    :to="`/post/${data.articleId}`"
                    >{{ data.articleTitle }}</router-link
                  >】
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
              </div>
            </div>
            <!-- 下载了我的附件 -->
            <div class="message-item" v-if="data.messageType == 4">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  在文章【<router-link
                    class="a-link"
                    :to="`/post/${data.articleId}`"
                    >{{ data.articleTitle }}</router-link
                  >】中下载了我的附件
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
              </div>
            </div>
          </template>
        </DataList>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const api = {
  loadMessageList: "/ucenter/loadMessageList",
};

const activeTabName = ref("reply");
const changeTab = (type) => {
  router.push(`/user/message/${type}`);
};

// 加载数据列表
const loading = ref(false);
const messageListInfo = ref({});
const loadMessage = async () => {
  loading.value = true;
  let params = {
    pageNo: messageListInfo.value.pageNo,
    code: activeTabName.value,
  };
  let result = await proxy.Request({
    url: api.loadMessageList,
    params: params,
    showLoading: false,
  });
  loading.value = false;
  if (!result) {
    return;
  }
  messageListInfo.value = result.data;
  store.commit("readMessage", activeTabName.value);
};

watch(
  () => route.params.type,
  (newVal, oldVal) => {
    if (newVal) {
      activeTabName.value = newVal;
      loadMessage();
    }
  },
  { immediate: true, deep: true }
);

// 监听用户信息
const userId = ref(null);
watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    if (newVal) {
      userId.value = newVal.userId;
    }
  },
  { immediate: true, deep: true }
);

const messageCountInfo = ref({});
watch(
  () => store.state.messageCountInfo,
  (newVal, oldVal) => {
    messageCountInfo.value = newVal || {};
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.message-center {
  .user-banner {
    line-height: 40px;
    color: #9ba7b9;
    .icon-right {
      padding: 0px, 5px;
    }
  }
  .message-panel {
    background: #fff;
    padding: 10px;
    margin-top: 5px;
    .tab-list {
      position: relative;
      .tab-item {
        position: relative;
        padding: 0px 10px;
        .count-tag {
          position: absolute;
          display: inline-block;
          right: -10px;
          top: -8px;
          background: #f56c6c;
          height: 15px;
          min-width: 20px;
          color: #fff;
          border-radius: 10px;
          font-size: 13px;
          text-align: center;
          line-height: 15px;
          margin-left: 10px;
        }
      }
      .go-ucenter {
        position: absolute;
        top: 5px;
        right: 10px;
        font-size: 14px;
      }
    }
    .message-list {
      .message-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 14px;
        border-bottom: 1px solid #ddd;
        padding: 10px;
        .message-content {
          margin-left: 5px;
          .create-time {
            color: #9ba7b9;
            margin-left: 10px;
          }
          .reply-content {
            border-left: 2px solid rgb(23, 117, 224);
            padding-left: 5px;
            margin-top: 5px;
          }
        }
      }
    }
  }
}
</style>

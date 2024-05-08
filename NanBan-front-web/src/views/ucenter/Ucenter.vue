<template>
  <div
    class="container-body ucenter"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <div class="user-banner">
      <router-link to="/" class="a-link">首页</router-link>
      <span class="iconfont icon-right"></span>
      <span>个人中心</span>
    </div>
    <div class="ucenter-panel">
      <div class="user-side">
        <!-- 头像信息 -->
        <div class="avatar-panel">
          <div
            class="edit-btn a-link"
            v-if="isCurrentUser"
            @click="updateUserInfo"
          >
            编辑资料
          </div>
          <div class="avatar-inner">
            <Avatar :userId="userInfo.userId" :width="120"></Avatar>
          </div>
          <div class="nick-name">
            <span>{{ userInfo.nickName }}</span>
            <span v-if="userInfo.sex == 0" class="iconfont icon-woman"></span>
            <span v-if="userInfo.sex == 1" class="iconfont icon-man"></span>
          </div>
          <div class="desc">
            {{ userInfo.personDescription }}
          </div>
        </div>
        <!-- 扩展信息 -->
        <div class="user-extend-panel">
          <div class="info-item">
            <div class="label iconfont icon-integral">积分</div>
            <div
              class="value a-link"
              v-if="isCurrentUser"
              @click="showIntegralRecord"
            >
              {{ userInfo.currentIntegral }}
            </div>
            <div v-else class="value">{{ userInfo.currentIntegral }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-like">获赞</div>
            <div class="value">
              {{ userInfo.likeCount }}
            </div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-post">发帖</div>
            <div class="value">
              {{ userInfo.postCount }}
            </div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-register">加入</div>
            <div class="value">
              {{ userInfo.joinTime }}
            </div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-login">最后登陆</div>
            <div class="value">
              {{ userInfo.lastLoginTime }}
            </div>
          </div>
        </div>
      </div>
      <div class="article-panel">
        <el-tabs :model-value="activeTabName" @tab-change="changeTab">
          <el-tab-pane label="发帖" :name="0"> </el-tab-pane>
          <el-tab-pane label="评论" :name="1"> </el-tab-pane>
          <el-tab-pane label="点赞" :name="2"> </el-tab-pane>
        </el-tabs>
        <div class="article-list">
          <DataList
            :loading="loading"
            :dataSource="articleListInfo"
            @loadData="loadArticle"
            noDataMsg="暂无相关信息"
          >
            <template #default="{ data }">
              <ArticleListItem
                :data="data"
                :showEdit="activeTabName == 0 && isCurrentUser"
                :showComment="showComment"
              ></ArticleListItem>
            </template>
          </DataList>
        </div>
      </div>
    </div>
  </div>
  <!-- 修改用户信息 -->
  <UcenterEditUserInfo
    ref="ucenterEditUserInfoRef"
    @resetUserInfo="resetUserInfoHandler"
  ></UcenterEditUserInfo>
  <!-- 修改用户积分-->
  <UserIntegralRecord ref="ucenterIntegralRecordRef"></UserIntegralRecord>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import ArticleListItem from "../forum/ArticleListItem.vue";
import UcenterEditUserInfo from "./UcenterEditUserInfo.vue";
import UserIntegralRecord from "./UserIntegralRecord.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const api = {
  getUserInfo: "/ucenter/getUserInfo",
  loadUserArticle: "/ucenter/loadUserArticle",
};

const userInfo = ref({});
const userId = ref(null);

const loadUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
    params: {
      userId: userId.value,
    },
    errorCallback: () => {
      setTimeout(() => {
        router.push("/");
      }, 1500);
    },
  });
  if (!result) {
    return;
  }
  userInfo.value = result.data;
};

// 右侧文章
const activeTabName = ref(0);
const changeTab = (type) => {
  activeTabName.value = type;
  loadArticle();
};
const loading = ref(false);
const articleListInfo = ref({});
const loadArticle = async () => {
  loading.value = true;
  let params = {
    pageNo: articleListInfo.value.pageNo,
    type: activeTabName.value,
    userId: userId.value,
  };
  let result = await proxy.Request({
    url: api.loadUserArticle,
    params: params,
    showLoading: false,
  });
  loading.value = false;
  if (!result) {
    return;
  }
  articleListInfo.value = result.data;
};

const isCurrentUser = ref(false);
// 重置当前用户 watch的触发优先于onMountedd
const resetCurrentUser = () => {
  const loginUserInfo = store.getters.getLoginUserInfo;
  if (loginUserInfo && loginUserInfo.userId == userId.value) {
    isCurrentUser.value = true;
  } else {
    isCurrentUser.value = false;
  }
};

watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    resetCurrentUser();
  },
  { immediate: true, deep: true }
);

watch(
  () => route.params.userId,
  (newVal, oldVal) => {
    if (newVal) {
      userId.value = newVal;
      resetCurrentUser();
      loadUserInfo();
      loadArticle();
    }
  },
  { immediate: true, deep: true }
);
// 修改用户信息
const ucenterEditUserInfoRef = ref(null);
const updateUserInfo = () => {
  ucenterEditUserInfoRef.value.showEditUserInfoDialog(userInfo.value);
};

const resetUserInfoHandler = (data) => {
  userInfo.value = data;
};

// 修改用户积分记录
const ucenterIntegralRecordRef = ref(null);
const showIntegralRecord = () => {
  ucenterIntegralRecordRef.value.showRecord();
};

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
.ucenter {
  .user-banner {
    line-height: 40px;
    color: #9ba7b9;
    .icon-right {
      padding: 0px, 5px;
    }
  }
  .ucenter-panel {
    display: flex;
    .user-side {
      width: 300px;
      margin-right: 10px;
      .avatar-panel {
        background: #fff;
        text-align: center;
        padding: 10px 0px;
        .edit-btn {
          text-align: right;
          cursor: pointer;
          font-size: 13px;
          padding: 0 10px;
        }
        .avatar-inner {
          display: flex;
          justify-content: center;
        }
        .nick-name {
          margin-top: 10px;
          .iconfont {
            margin-left: 5px;
            color: var(--link);
          }
        }
        .desc {
          padding: 10px;
          text-align: left;
          font-size: 13px;
          color: #000;
        }
      }
      .user-extend-panel {
        margin-top: 10px;
        background: #fff;
        padding: 10px;
        .info-item {
          line-height: 30px;
          display: flex;
          justify-content: center;
          .label {
            width: 110px;
            font-size: 13px;
          }
          .iconfont::before {
            font-size: 22px;
            color: #9ba7b9;
            padding-right: 5px;
          }
          .value {
            flex: 1;
            text-align: right;
            font-size: 13px;
            .a-link {
              cursor: pointer;
            }
          }
        }
      }
    }
    .article-panel {
      flex: 1;
    }
  }
}
</style>

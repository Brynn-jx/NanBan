<template>
  <div>
    <div class="header" v-if="showHeader">
      <div
        class="header-content"
        :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
      >
        <RouterLink to="/" class="logo a-link">
          <!-- span用于将一段文本独立出来进行渲染 -->
          <span v-for="item in logoInfo" :style="{ color: item.color }">
            {{ item.letter }}
          </span>
        </RouterLink>
        <!-- 板块信息 -->
        <div class="menu-panel">
          <router-link
            :class="[
              'menu-item home',
              activePBoardId == undefined ? 'active' : '',
            ]"
            to="/"
            >首页</router-link
          >
          <template v-for="board in boardlist">
            <el-popover
              placement="bottom-start"
              :width="300"
              trigger="hover"
              v-if="board.children.length > 0"
            >
              <template #reference>
                <span
                  :class="[
                    'menu-item',
                    board.boardId == activePBoardId ? 'active' : '',
                  ]"
                  @click="boardClickHandler(board)"
                  >{{ board.boardName }}</span
                >
              </template>
              <div class="sub-board-list">
                <span
                  :class="[
                    'sub-board',
                    subBoard.boardId == activePBoardId ? 'active' : '',
                  ]"
                  v-for="subBoard in board.children"
                  @click="subBoardClickHandler(subBoard)"
                  >{{ subBoard.boardName }}</span
                >
              </div>
            </el-popover>
            <span
              :class="[
                'menu-item',
                board.boardId == activePBoardId ? 'active' : '',
              ]"
              @click="boardClickHandler(board)"
              v-else
              >{{ board.boardName }}</span
            >
          </template>
        </div>
        <!-- 用户信息 -->
        <div class="user-info-panel">
          <div class="op-btn">
            <el-button type="primary" @click="newPost"
              >发帖<span class="iconfont icon-add"></span
            ></el-button>
            <el-button type="primary" @click="goSearch"
              >搜索<span class="iconfont icon-search"></span
            ></el-button>
          </div>
          <!-- 显示用户信息 -->
          <template v-if="userInfo.userId">
            <div class="message-info">
              <el-dropdown>
                <el-badge
                  :value="messageCountInfo.total"
                  class="item"
                  :hidden="
                    messageCountInfo.total == null ||
                    messageCountInfo.total == 0
                  "
                >
                  <div class="iconfont icon-message"></div>
                </el-badge>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="gotoMessage('reply')"
                      class="message-item"
                    >
                      <span class="text">回复我的</span>
                      <span
                        class="count-tag"
                        v-if="messageCountInfo.reply > 0"
                        >{{
                          messageCountInfo.reply > 99
                            ? "99+"
                            : messageCountInfo.reply
                        }}</span
                      >
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="gotoMessage('likePost')"
                      class="message-item"
                    >
                      <span class="text">赞了我的文章</span>
                      <span
                        class="count-tag"
                        v-if="messageCountInfo.likePost > 0"
                        >{{
                          messageCountInfo.likePost > 99
                            ? "99+"
                            : messageCountInfo.likePost
                        }}</span
                      >
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="gotoMessage('downloadAttachment')"
                      class="message-item"
                    >
                      <span class="text">下载了我的附件</span>
                      <span
                        class="count-tag"
                        v-if="messageCountInfo.downloadAttachment > 0"
                        >{{
                          messageCountInfo.downloadAttachment > 99
                            ? "99+"
                            : messageCountInfo.downloadAttachment
                        }}</span
                      >
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="gotoMessage('likeComment')"
                      class="message-item"
                    >
                      <span class="text">赞了我的评论</span>
                      <span
                        class="count-tag"
                        v-if="messageCountInfo.likeComment > 0"
                        >{{
                          messageCountInfo.likeComment > 99
                            ? "99+"
                            : messageCountInfo.likeComment
                        }}</span
                      >
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="gotoMessage('sys')"
                      class="message-item"
                    >
                      <span class="text">系统信息</span>
                      <span class="count-tag" v-if="messageCountInfo.sys > 0">{{
                        messageCountInfo.sys > 99 ? "99+" : messageCountInfo.sys
                      }}</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="user-info">
              <el-dropdown>
                <Avatar
                  :userId="userInfo.userId"
                  :width="50"
                  :addLink="false"
                ></Avatar>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="gotoUcenter(userInfo.userId)"
                      >我的主页</el-dropdown-item
                    >
                    <el-dropdown-item @click="logout">退出</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

          <el-button-group :style="{ 'margin-left': '10px' }" v-else>
            <el-button type="primary" plain @click="loginAndRegister(1)"
              >登录</el-button
            >
            <el-button type="primary" plain @click="loginAndRegister(0)"
              >注册</el-button
            >
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="body-content">
      <RouterView></RouterView>
    </div>
    <div class="footer" v-if="showFooter">
      <div
        class="footer-content"
        :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
      >
        <el-row>
          <el-col :span="6" class="item">
            <div class="logo">
              <div class="logo-letter">
                <span v-for="item in logoInfo" :style="{ color: item.color }">
                  {{ item.letter }}
                </span>
              </div>
              <div class="info">欢迎来到NanBan社区</div>
            </div>
          </el-col>
          <el-col :span="6" class="item">
            <div class="title">网站相关</div>
            <div>
              <a herf="####">网站相关链接</a>
            </div>
            <div>
              <a herf="####">网站相关链接</a>
            </div>
            <div>
              <a herf="####">网站相关链接</a>
            </div>
            <div>
              <a herf="####">网站相关链接</a>
            </div>
          </el-col>
          <el-col :span="6" class="item">
            <div class="title">友情链接</div>
          </el-col>
          <el-col :span="6" class="item">
            <div class="title">联系我</div>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- 登陆 注册 -->
    <LoginAndRegister ref="loginRegisterRef"></LoginAndRegister>
    <el-backtop :right="100" :bottom="100"></el-backtop>
  </div>
</template>

<script setup>
import LoginAndRegister from "@/views/LoginAndRegister.vue";
import Dialog from "@/components/Dialog.vue";
import { ref, reactive, getCurrentInstance, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

// 得到this
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();
const api = {
  getUserInfo: "/getUserInfo",
  loadBoard: "/board/loadBoard",
  getMessageCount: "/ucenter/getMessageCount",
  logout: "/logout",
  getSysSetting: "/getSysSetting",
};
const logoInfo = ref([
  {
    letter: "N",
    color: "Brown",
  },
  {
    letter: "a",
    color: "blue",
  },
  {
    letter: "n",
    color: "Orange",
  },
  {
    letter: "B",
    color: "(176,224,230)",
  },
  {
    letter: "a",
    color: "green",
  },
  {
    letter: "n",
    color: "red",
  },
]);

const showHeader = ref(true);
// 获取滚动条的高度
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop;
  return scrollTop;
};

const initScroll = () => {
  let initScrollTop = getScrollTop();
  let scrollType = 0;
  window.addEventListener("scroll", () => {
    let currentScrollTop = getScrollTop();
    if (currentScrollTop > initScrollTop) {
      // 往下滚动
      scrollType = 1;
    } else {
      scrollType = 0;
    }
    initScrollTop = currentScrollTop;
    if (scrollType == 1 && currentScrollTop > 120) showHeader.value = 0;
    else showHeader.value = 1;
  });
};

onMounted(() => {
  initScroll();
  getUserInfo();
  loadSysSetting();
});
// 获取用户信息
const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
  });
  if (!result) {
    return;
  }
  store.commit("updateLoginUserInfo", result.data);
};

// 登陆事件
const loginRegisterRef = ref();
const loginAndRegister = (type) => {
  loginRegisterRef.value.showPanel(type);
};

//获取板块信息  TODO 可以有封面
const boardlist = ref([]);
const loadBoard = async () => {
  let result = await proxy.Request({
    url: api.loadBoard,
  });
  if (!result) {
    return;
  }
  boardlist.value = result.data;
  store.commit("saveBoardList", result.data);
};

loadBoard();

// 监听 登录用户信息
const userInfo = ref({});
watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    if (newVal != undefined && newVal != null) {
      userInfo.value = newVal;
    } else {
      userInfo.value = {};
    }
  },
  { immediate: true, deep: true }
);
// 监视 是否需要登录
watch(
  () => store.state.showLogin,
  (newVal, oldVal) => {
    if (newVal) {
      loginAndRegister(1);
    }
  },
  { immediate: true, deep: true }
);
// 板块点击
// 一级板块
const boardClickHandler = (board) => {
  router.push(`/forum/${board.boardId}`);
};
// 二级板块
const subBoardClickHandler = (subBoard) => {
  router.push(`/forum/${subBoard.pBoardId}/${subBoard.boardId}`);
};

// 当前选中板块
const activePBoardId = ref(0);
watch(
  () => store.state.activePBoardId,
  (newVal) => {
    if (newVal !== 0) {
      activePBoardId.value = newVal;
    }
  }
);

const activeBoardId = ref(0);
watch(
  () => store.state.activeBoardId,
  (newVal) => {
    activeBoardId.value = newVal;
  }
);

// 发帖
const newPost = () => {
  if (!store.getters.getLoginUserInfo) {
    loginAndRegister(1);
  } else {
    router.push("/newPost");
  }
};

const gotoUcenter = (userId) => {
  router.push(`/user/${userId}`);
};

// 消息相关
const gotoMessage = (type) => {
  router.push(`/user/message/${type}`);
};
const messageCountInfo = ref({});
const loadMessageCount = async () => {
  let result = await proxy.Request({
    url: api.getMessageCount,
  });
  if (!result) {
    return;
  }
  messageCountInfo.value = result.data;
  store.commit("updateMessageCountInfo", result.data);
};
watch(
  () => store.state.messageCountInfo,
  (newVal, oldVal) => {
    messageCountInfo.value = newVal || {};
  },
  { immediate: true, deep: true }
);

watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    if (newVal) {
      loadMessageCount();
    }
  },
  { immediate: true, deep: true }
);

// 退出
const logout = () => {
  proxy.Confirm("确定要退出吗？", async () => {
    let result = await proxy.Request({
      url: api.logout,
    });
    if (!result) {
      return;
    }
    store.commit("updateLoginUserInfo", null);
  });
};
// 获取系统设置
const loadSysSetting = async () => {
  let result = await proxy.Request({
    url: api.getSysSetting,
  });
  if (!result) {
    result;
  }
  store.commit("saveSysSetting", result.data);
};

const goSearch = () => {
  router.push("/search");
};

// 是否展示底部
const showFooter = ref(true);
watch(
  () => route.path,
  (newVal, oldVal) => {
    if (newVal.indexOf("newPost") != -1 || newVal.indexOf("editPost") != -1) {
      showFooter.value = false;
    } else {
      showFooter.value = true;
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.header {
  top: 0px;
  width: 100%;
  height: 60px;
  box-shadow: 0 2px 6px 0 #ddd;
  position: fixed;
  background: #fff;
  z-index: 1000;
  .header-content {
    margin: 0 auto;
    align-items: center;
    height: 60px;
    display: flex;
    .logo {
      display: block;
      margin-right: 5px;
      text-decoration: none;
      span {
        font-size: 30px;
      }
    }
    .menu-panel {
      flex: 1;
      .menu-item {
        margin-left: 20px;
        cursor: pointer;
      }
      .home {
        text-decoration: none;
        color: #000;
      }
      .active {
        color: var(--link);
      }
    }
    .user-info-panel {
      width: 300px;
      display: flex;
      align-items: center;
      .op-btn {
        .iconfont {
          margin-left: 5px;
        }
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .message-info {
        .icon-message {
          font-size: 25px;
          color: #858484;
        }
        margin-left: 5px;
        margin-right: 25px;
        cursor: pointer;
      }
    }
  }
}
.sub-board-list {
  display: flex;
  flex-wrap: wrap;
  .sub-board {
    padding: 0px 10px;
    border-radius: 20px;
    margin-right: 10px;
    background: rgb(239, 239, 239);
    border: 1px solid #ddd;
    color: rgb(118, 118, 118);
    margin-top: 10px;
    cursor: pointer;
  }
  .sub-board:hover {
    color: var(--link);
  }
  .active {
    background-color: var(--link);
    color: #fff;
  }
  .active:hover {
    color: #fff;
  }
}
.body-content {
  position: relative;
  margin-top: 60px;
  min-height: calc(100vh - 210px);
}
.message-item {
  display: flex;
  justify-content: space-around;
  .text {
    flex: 1;
  }
  .count-tag {
    display: inline-block;
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

.footer {
  background: #e9e9e9;
  height: 140px;
  margin-top: 10px;
  .footer-content {
    margin: 0px auto;
    padding-top: 10px;
    .item {
      text-align: left;
      .title {
        font-size: 18px;
        margin-bottom: 10px;
      }
      a {
        font-size: 14px;
        text-decoration: none;
        color: var(--text2);
        line-height: 25px;
      }
    }
    .logo {
      .logo-letter {
        font-size: 30px;
      }
      .info {
        margin-top: 10px;
        color: rgb(93, 91, 91);
      }
    }
  }
}
</style>

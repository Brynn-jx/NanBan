<template>
  <div
    class="container-body article-list-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <!-- 二级板块信息 -->
    <div class="sub-board" v-if="pBoardId">
      <span :class="['board-item', boardId == 0 ? 'active' : '']">
        <router-link :to="`/forum/${pBoardId}`">全部</router-link>
      </span>
      <span
        :class="['board-item', item.boardId == boardId ? 'active' : '']"
        v-for="item in subBoardList"
      >
        <router-link :to="`/forum/${item.pBoardId}/${item.boardId}`">
          {{ item.boardName }}
        </router-link>
      </span>
    </div>
    <div class="article-panel">
      <div class="top-tab">
        <div
          :class="['tab', orderType == 0 ? 'active' : '']"
          @click="changeOrderType(0)"
        >
          热榜
        </div>
        <el-divider direction="vertical"></el-divider>
        <div
          :class="['tab', orderType == 1 ? 'active' : '']"
          @click="changeOrderType(1)"
        >
          发布时间
        </div>
        <el-divider direction="vertical"></el-divider>
        <div
          :class="['tab', orderType == 2 ? 'active' : '']"
          @click="changeOrderType(2)"
        >
          最新
        </div>
        <el-divider direction="vertical"></el-divider>
      </div>
      <div class="article-list">
        <DataList
          :dataSource="articleListInfo"
          @loadData="loadArticle"
          :loading="loading"
          noDataMsg="还没有帖子, 你来第一个吧"
        >
          <!-- 这边接受DataList中插槽的数据名:data 他指向item。这边的作用就是将item传给ArticleListItem :data="wjx"-->
          <template #default="{ data }">
            <ArticleListItem
              :data="data"
              :showComment="showComment"
            ></ArticleListItem>
          </template>
        </DataList>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ArticleListItem from "./ArticleListItem.vue";
import { useStore } from "vuex";
// 得到this
const { proxy } = getCurrentInstance();
const api = {
  loadArticle: "/forum/loadArticle",
};
const store = useStore();
const route = useRoute();
const loading = ref(false);
const orderType = ref(0);
// 一级板块
const pBoardId = ref(0);
// 二级板块
const boardId = ref(0);
const changeOrderType = (type) => {
  orderType.value = type;
  loadArticle();
};
// 文章列表
const articleListInfo = ref({});
const loadArticle = async () => {
  loading.value = true;
  let params = {
    pageNo: articleListInfo.value.pageNo,
    pBoardId: pBoardId.value,
    boardId: boardId.value,
    orderType: orderType.value,
  };
  let result = await proxy.Request({
    url: api.loadArticle,
    params: params,
    showLoading: false,
  });
  loading.value = false;
  if (!result) {
    return;
  }
  articleListInfo.value = result.data;
};

//二级板块
const subBoardList = ref([]);
const setSubBoard = () => {
  subBoardList.value = store.getters.getSubBoardList(pBoardId.value);
};
// 监听板块路由
watch(
  () => route.params,
  (newVal, oldVal) => {
    boardId.value = newVal.boardId || 0;
    pBoardId.value = newVal.pBoardId;
    store.commit("setActivePBoardId", pBoardId.value);
    store.commit("setActiveBoardId", boardId.value);
    setSubBoard();
    loadArticle();
  },
  { immediate: true, deep: true }
);

// 监听板块数据变换
watch(
  () => store.state.boardList,
  (newVal, oldVal) => {
    setSubBoard();
  },
  { immediate: true, deep: true }
);

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
.article-list-body {
  .sub-board {
    padding: 10px 0px 10px 0px;
    .board-item {
      background: #fff;
      border-radius: 15px;
      padding: 2px 10px;
      margin-right: 10px;
      color: #909090;
      cursor: pointer;
      font-size: 14px;
      a {
        text-decoration: none;
        color: #909090;
      }
    }
    .active {
      background-color: var(--link);
      a {
        color: #fff;
      }
    }
  }
  .article-panel {
    background: #fff;
    .top-tab {
      padding: 10px 15px;
      align-items: center;
      font-size: 15px;
      display: flex;
      border-bottom: 1px solid #ddd;
      .tab {
        cursor: pointer;
      }
      .active {
        color: var(--link);
      }
    }
  }
}
</style>

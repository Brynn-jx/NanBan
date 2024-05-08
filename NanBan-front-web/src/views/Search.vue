<template>
  <div
    class="container-body search-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <div
      class="search-panel"
      :style="{ 'padding-top': startSearch ? '0px' : searchPanelHeight + 'px' }"
    >
      <el-form
        :model="formData"
        ref="formDataRef"
        :rules="rules"
        @submit.native.prevent
      >
        <el-form-item prop="keyword">
          <el-input
            size="large"
            clearable
            placeholder="请输入你想要查找的关键词"
            v-model="formData.keyword"
            @keyup.enter="search"
            @focus="startSearchHandler"
            @change="changeInput"
          >
            <template #suffix>
              <span
                class="iconfont icon-search"
                @click="search"
                @blur="formData.keyword = $event.target.value.trim()"
              ></span>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="article-list">
      <DataList
        :dataSource="articleListInfo"
        @loadData="search"
        :loading="loading"
        noDataMsg="还没有帖子, 你来第一个吧"
      >
        <!-- 这边接受DataList中插槽的数据名:data 他指向item。这边的作用就是将item传给ArticleListItem :data="wjx"-->
        <template #default="{ data }">
          <ArticleListItem
            :data="data"
            :showComment="showComment"
            :htmlTitle="true"
          ></ArticleListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, watch } from "vue";
import ArticleListItem from "./forum/ArticleListItem.vue";
import { useStore } from "vuex";

const store = useStore();
const { proxy } = getCurrentInstance();
const formData = ref({});
const formDataRef = ref();
const api = {
  loadArticle: "/forum/search",
};
const rules = {
  keyword: [
    { required: true, message: "请输入内容" },
    { min: 3, message: "字数太少，至少三个字" },
  ],
};

const searchPanelHeight = (window.innerHeight - 60 - 140 - 60) / 2;
// 开始搜索
const startSearch = ref(false);
const startSearchHandler = () => {
  startSearch.value = true;
};
// 结束搜索
const endSearchHandler = () => {
  startSearch.value = false;
};

// 文章列表
const loading = ref(false);
const articleListInfo = ref({});
const search = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
  });
  loading.value = true;
  let params = {
    pageNo: articleListInfo.value.pageNo,
    keyword: formData.value.keyword,
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
  let list = result.data.list;
  list.forEach((element) => {
    element.title = element.title.replace(
      params.keyword,
      "<span style='color:red'>" + params.keyword + "</span>"
    );
  });
  articleListInfo.value = result.data;
};

const changeInput = () => {
  if (formData.value.keyword == "") {
    articleListInfo.value = {};
  }
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
.search-body {
  background: #fff;
  padding: 10px;
  min-height: calc(100vh - 210px);
  .search-panel {
    display: flex;
    justify-content: center;
    .el-input {
      width: 700px;
    }
    .icon-search {
      cursor: pointer;
    }
  }
}
</style>

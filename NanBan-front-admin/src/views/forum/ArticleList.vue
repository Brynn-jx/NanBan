<template>
  <div>
    <div class="top-panel">
      <el-form :model="searchFormData" label-width="50px">
        <el-row>
          <el-col :span="4">
            <el-form-item label="标题" prop="titleFuzzy">
              <el-input
                v-model="searchFormData.titleFuzzy"
                placeholder="请输入标题"
                clearable
                @keyup.native="loadDataList"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="昵称" prop="nickName">
              <el-input
                v-model="searchFormData.nickName"
                placeholder="请输入昵称"
                clearable
                @keyup.native="loadDataList"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="板块" prop="boardIds">
              <el-cascader
                :options="boardList"
                v-model="searchFormData.boardIds"
                clearable
                placeholder="请选择板块"
                :props="boardProps"
                :style="{ width: '100%' }"
              >
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="附件" prop="attachmentType">
              <el-select
                v-model="searchFormData.attachmentType"
                placeholder="请选择"
                clearable
                :style="{ width: '100%' }"
              >
                <el-option :value="1" label="有附件"> </el-option>
                <el-option :value="0" label="无附件"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="searchFormData.status"
                placeholder="请选择状态"
                clearable
                :style="{ width: '100%' }"
              >
                <el-option :value="-1" label="已删除"> </el-option>
                <el-option :value="0" label="待审核"> </el-option>
                <el-option :value="1" label="已审核"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">
            <el-form-item label="置顶" prop="topType">
              <el-select
                v-model="searchFormData.topType"
                placeholder="请选择"
                clearable
                :style="{ width: '100%' }"
              >
                <el-option :value="0" label="未置顶"> </el-option>
                <el-option :value="1" label="已置顶"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" :style="{ 'padding-left': '10px' }">
            <el-button-group>
              <el-button type="primary" @click="loadDataList">搜索</el-button>
              <el-button
                type="success"
                @click="auditBatch"
                :disabled="selectBatchList.length == 0"
                >批量审核</el-button
              >
              <el-button
                type="danger"
                @click="delBatch"
                :disabled="selectBatchList.length == 0"
                >批量删除
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="data-list">
      <Table
        ref="tableRef"
        :columns="columns"
        :dataSource="tableData"
        :fetch="loadDataList"
        :options="tableOptions"
        @rowSelected="setRowSelected"
      >
        <!-- 用户信息 -->
        <!-- Table具名插槽，名字是userInfo，参数以对象的形式传递过来然后被解析出来 -->
        <template #userInfo="{ index, row }">
          <div class="user-info">
            <Avatar :userId="row.userId" :width="50"></Avatar>
            <div class="name-info">
              <div>
                <a
                  :href="`${proxy.globalInfo.webDomain}user/${row.userId}`"
                  class="a-link"
                  target="_blank"
                  >{{ row.nickName }}</a
                >
              </div>
              <div>{{ row.userIpAddress }}</div>
            </div>
          </div>
        </template>
        <!-- 封面 -->
        <template #cover="{ index, row }">
          <Cover :cover="row.cover"></Cover>
        </template>
        <!-- 标题 -->
        <template #titleInfo="{ index, row }">
          <a
            :href="`${proxy.globalInfo.webDomain}post/${row.articleId}`"
            class="a-link"
            target="_blank"
            tag="a"
            >{{ row.title }}</a
          >
        </template>
        <!-- 板块 -->
        <template #boardInfo="{ index, row }">
          <div>
            <span>{{ row.pBoardName }}</span>
            <span v-if="row.boardName">{{ " / " }}{{ row.boardName }}</span>
          </div>
        </template>
        <!-- 互动信息 -->
        <template #interactionInfo="{ index, row }">
          <div>阅读，{{ row.readCount }}</div>
          <div>点赞，{{ row.goodCount }}</div>
          <div>
            <div>
              评论，<span>{{ row.commentCount }}</span>
              <span
                class="a-link"
                :style="{ 'margin-left': '5px' }"
                @click="showComment(row.articleId)"
                v-if="row.commentCount"
                >查看</span
              >
            </div>
          </div>
        </template>
        <!-- 附件信息 -->
        <template #attachmentInfo="{ index, row }">
          <div v-if="row.attachmentType == 0">无附件</div>
          <div v-if="row.attachmentType == 1">
            <span
              @click="showAttachment(row.nickName, row.articleId)"
              class="a-link"
              >查看附件</span
            >
          </div>
        </template>
        <!-- 状态 -->
        <template #statusInfo="{ index, row }">
          <span v-if="row.status == -1" :style="{ color: 'red' }">已删除</span>
          <span v-if="row.status == 0" :style="{ color: 'red' }">待审核</span>
          <span v-if="row.status == 1" :style="{ color: 'green' }">已审核</span>
          <div v-if="row.topType == 1" :style="{ color: 'green' }">已置顶</div>
          <div v-if="row.topType == 0" :style="{ color: 'green' }">未置顶</div>
        </template>
        <!-- 操作信息 -->
        <template #op="{ index, row }">
          <div class="op" v-if="row.status != -1">
            <el-dropdown trigger="click">
              <span class="iconfont icon-more"></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="updateBoard(row)"
                    >修改板块</el-dropdown-item
                  >
                  <el-dropdown-item
                    @click="topArticle(row)"
                    v-if="row.topType == 1 && row.status == 1"
                    >取消置顶</el-dropdown-item
                  >
                  <el-dropdown-item
                    @click="topArticle(row)"
                    v-if="row.topType == 0 && row.status == 1"
                    >置顶</el-dropdown-item
                  >
                  <el-dropdown-item @click="delArticle(row)"
                    >删除</el-dropdown-item
                  >
                  <el-dropdown-item @click="audit(row)">审核</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </Table>
    </div>
    <!-- 修改板块 -->
    <ArticleBoard ref="articleBoardRef" @reload="loadDataList"></ArticleBoard>
    <!-- 查看附件 -->
    <ArticleAttachment ref="articleAttachmentRef"></ArticleAttachment>
    <!-- 查看评论 -->
    <ArticleComment ref="commentRef"></ArticleComment>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, reactive } from "vue";
import ArticleBoard from "./ArticleBoard.vue";
import ArticleAttachment from "./ArticleAttachment.vue";
import ArticleComment from "./ArticleComment.vue";

const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/forum/loadArticle",
  loadBoard: "/board/loadBoard",
  delArticle: "/forum/delArticle",
  topArticle: "/forum/topArticle",
  auditArticle: "/forum/auditArticle",
};

// 搜索
const searchFormData = ref({});

// 板块信息
const boardProps = {
  multiple: false,
  checkStrictly: true,
  value: "boardId",
  label: "boardName",
};
// 加载板块信息
const boardList = ref([]);
const loadBoardList = async () => {
  let result = await proxy.Request({
    url: api.loadBoard,
  });
  if (!result) {
    return;
  }
  boardList.value = result.data;
};
loadBoardList();

const tableOptions = ref({
  selectType: "checkbox",
  extHeight: 100,
});
const columns = [
  {
    label: "用户信息",
    prop: "avatar",
    width: 200,
    scopedSlots: "userInfo",
  },
  {
    label: "封面",
    prop: "cover",
    width: 100,
    scopedSlots: "cover",
  },
  {
    label: "标题",
    scopedSlots: "titleInfo",
  },
  {
    label: "板块",
    width: 200,
    scopedSlots: "boardInfo",
  },
  {
    label: "互动信息",
    width: 150,
    scopedSlots: "interactionInfo",
  },
  {
    label: "是否有附件",
    prop: "attachment",
    width: 100,
    scopedSlots: "attachmentInfo",
  },
  {
    label: "状态信息",
    prop: "status",
    width: 100,
    scopedSlots: "statusInfo",
  },
  {
    label: "发布时间",
    prop: "postTime",
    width: 180,
  },
  {
    label: "发布地址",
    prop: "userIpAddress",
    width: 100,
  },
  {
    label: "操作",
    prop: "op",
    width: 80,
    scopedSlots: "op",
  },
];

const tableData = ref({});
// 加载显示的列表信息,包括搜索的后的加载
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
  };
  Object.assign(params, searchFormData.value);
  if (params.boardIds && params.boardIds.length == 1) {
    params.pBoardId = params.boardIds[0];
  } else if (params.boardIds && params.boardIds.length == 2) {
    params.pBoardId = params.boardIds[0];
    params.boardId = params.boardIds[1];
  }
  delete params.boardIds;

  let result = await proxy.Request({
    url: api.loadDataList,
    params: params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
};

// 修改板块
// 因为要调用子组件的方法所以定义ref
const articleBoardRef = ref();
const updateBoard = (data) => {
  articleBoardRef.value.updateBoard(data);
};

// 批量选择
const selectBatchList = ref([]);
const setRowSelected = (rows) => {
  selectBatchList.value = [];
  rows.forEach((element) => {
    selectBatchList.value.push(element.articleId);
  });
};

// 审核
const audit = (data) => {
  proxy.Confirm(`你确定要审核【${data.title}】吗？`, async () => {
    let result = await proxy.Request({
      url: api.auditArticle,
      params: {
        articleIds: data.articleId,
      },
    });
    if (!result) {
      return;
    }
    loadDataList();
  });
};

// 删除
const delArticle = (data) => {
  proxy.Confirm(`你确定要删除【${data.title}】吗？`, async () => {
    let result = await proxy.Request({
      url: api.delArticle,
      params: {
        articleIds: data.articleId,
      },
    });
    if (!result) {
      return;
    }
    loadDataList();
  });
};

// 批量操作
const tableRef = ref();
const auditBatch = () => {
  proxy.Confirm(`你确定要批量审核吗？`, async () => {
    let result = await proxy.Request({
      url: api.auditArticle,
      params: {
        articleIds: selectBatchList.value.join(","),
      },
    });
    if (!result) {
      return;
    }
    tableRef.value.clearSelection();
    loadDataList();
  });
};

// 置顶
const topArticle = (data) => {
  const opName = data.topType == 0 ? "设为置顶" : "取消置顶";
  proxy.Confirm(`你确定要将【${data.title}】${opName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.topArticle,
      params: {
        topType: data.topType == 0 ? 1 : 0,
        articleId: data.articleId,
      },
    });
    if (!result) {
      return;
    }
    loadDataList();
  });
};

const delBatch = () => {
  proxy.Confirm(`你确定要批量删除吗？`, async () => {
    let result = await proxy.Request({
      url: api.delArticle,
      params: {
        articleIds: selectBatchList.value.join(","),
      },
    });
    if (!result) {
      return;
    }
    tableRef.value.clearSelection();
    loadDataList();
  });
};

// 查看附件
const articleAttachmentRef = ref();
const showAttachment = (nickName, articleId) => {
  articleAttachmentRef.value.show(nickName, articleId);
};

// 查看评论
const commentRef = ref();
const showComment = (articleId) => {
  commentRef.value.show(articleId);
};
</script>

<style lang="scss">
.data-list {
  .user-info {
    display: flex;
    align-items: center;
    .name-info {
      margin-left: 5px;
      font-size: 13px;
    }
  }
  .op {
    .iconfont {
      cursor: pointer;
    }
  }
}
</style>

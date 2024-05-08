<template>
  <div class="skeleton" v-if="loading">
    <el-skeleton :rows="5" animated></el-skeleton>
  </div>
  <div
    v-if="!loading && dataSource.list != null && dataSource.list.length == 0"
  >
    <NoData :msg="noDataMsg"></NoData>
  </div>
  <div v-for="item in dataSource.list" v-if="!loading">
    <slot :data="item"></slot>
  </div>
  <div class="paignation">
    <el-pagination
      v-if="dataSource.pageTotal > 1"
      @current-change="handlePageNoChange"
      v-model:currentPage="dataSource.pageNo"
      layout="prev, pager, next"
      :total="dataSource.totalCount"
      background
      style="text-align: right"
      :page-size="15"
    >
      :pager-count="7">
    </el-pagination>
  </div>
</template>

<script setup>
const props = defineProps({
  dataSource: {
    type: Object,
  },
  loading: {
    type: Boolean,
  },
  noDataMsg: {
    type: String,
    default: "暂无数据",
  },
});
const emit = defineEmits(["loadData"]);
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo;
  emit("loadData");
};
</script>

<style lang="scss">
.paignation {
  padding: 10px 0px 10px 10px;
}
</style>

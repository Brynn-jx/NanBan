<template>
  <div>
    <el-table
      ref="dataTable"
      :data="dataSource.list || []"
      :height="tableHeight"
      :stripe="options.stripe"
      :border="options.border"
      highlight-current-row
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
    >
      <!-- selection选择框 -->
      <el-table-column
        v-if="options.selectType && options.selectType == 'checkbox'"
        type="selection"
        width="50"
        align="center"
      >
      </el-table-column>
      <!-- 序号 -->
      <el-table-column
        v-if="options.showIndex"
        label="序号"
        type="index"
        width="60"
        align="center"
      >
      </el-table-column>
      <!-- 数据列 -->
      <template v-for="(column, index) in columns">
        <template v-if="column.scopedSlots">
          <el-table-column
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :align="column.align || 'left'"
            :width="column.width"
          >
            <!-- 这个是element plus的作用域插槽， 将行中的数据以对象的形式发送过来，scope接受-->
            <template #default="scope">
              <!-- 具名插槽传参，名字是column.scopedSlots，将slot里面的东西（name，index，row）以对象的形式传递给父组件 -->
              <slot
                :name="column.scopedSlots"
                :index="scope.$index"
                :row="scope.row"
              ></slot>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :align="column.align || 'left'"
            :width="column.width"
          >
          </el-table-column>
        </template>
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="pagination" v-if="showPagination">
      <el-pagination
        v-if="dataSource.totalCount"
        background
        :total="dataSource.totalCount"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="dataSource.pageSize"
        :current-page.sync="dataSource.pageNo"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageNoChange"
        style="text-align: right"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  dataSource: Object,
  // 是否展示分页
  showPagination: {
    type: Boolean,
    default: true,
  },
  // 表格属性
  options: {
    type: Object,
    default: {
      tableHeight: null,
      stripe: true,
      border: false,
      extHeight: 0,
      showIndex: false,
    },
  },
  // 数据列
  columns: Array,
  fetch: Function, // 获取数据的函数
  initFetch: {
    type: Boolean,
    default: true,
  },
});

// 顶部60 内容区域距离顶部20 上下间距15 * 2 分页区域高度46
const topHeight = 60 + 20 + 30 + 46;

const tableHeight = ref(
  props.options.tableHeight
    ? props.options.tableHeight
    : window.innerHeight - topHeight - (props.options.extHeight || 0)
);

// 初始化
const init = () => {
  if (props.initFetch && props.fetch) {
    props.fetch();
  }
};
init();

const dataTable = ref();
// 清除选中
const clearSelection = () => {
  dataTable.value.clearSelection();
};

// 设置行选中
const setCurrentRow = (rowKey, rowValue) => {
  let row = props.dataSource.list.find((item) => {
    return item[rowKey] === rowValue;
  });
  dataTable.value.setCurrentRow(row);
};
// 将自组件暴露出去，否则副组件无法调用
defineExpose({ setCurrentRow, clearSelection });

const emit = defineEmits(["rowSelected", "rowClick"]);
// 行点击
const handleRowClick = (row) => {
  emit("rowClick", row);
};

// 多选
const handleSelectionChange = (row) => {
  emit("rowSelected", row);
};

// 切换每页大小
const handlePageSizeChange = (size) => {
  props.dataSource.pageSize = size;
  props.dataSource.pageNo = 1;
  props.fetch();
};

// 切换页码
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo;
  props.fetch();
};
</script>

<style lang="scss">
.pagination {
  padding-top: 10px;
}
.el-pagination {
  justify-content: right;
}
.el-table__body tr.current-row > td.el-table__cell {
  background-color: #e6f0f9;
}
.el-table__body tr:hover > td.el-table__cell {
  background-color: #e6f0f9 !important;
}
</style>

<template>
  <div class="layout-body">
    <el-container>
      <el-aside class="aside" :style="{ width: asideWidth + 'px' }">
        <div class="logo">
          <span v-if="!menuCollapse">NanBan管理后台</span>
        </div>
        <div class="menu-panel">
          <el-menu
            :default-openeds="defaultOpeneds"
            :collapse-transition="false"
            :collapse="menuCollapse"
            class="el-menu-vertical-demo"
            default-active="2"
            background-color="#3d3c4a"
            text-color="#fff"
            active-text-color="#fff"
            router
            :defaultActive="defaultActive"
          >
            <template v-for="item in menuList">
              <el-sub-menu :index="item.path" v-if="item.chlidren">
                <template #title>
                  <i :class="['iconfont', item.icon]"></i>
                  <span class="menu-name">{{ item.menuName }}</span>
                </template>
                <el-menu-item
                  v-for="subItem in item.chlidren"
                  :index="subItem.path"
                >
                  <span class="menu-name">{{ subItem.menuName }}</span>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="item.path">
                <template #title>
                  <i :class="['iconfont', item.icon]"></i>
                  <span class="menu-name">{{ item.menuName }}</span>
                </template>
              </el-menu-item>
            </template>
          </el-menu>
        </div>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div
            :class="[
              'op-menu',
              'iconfont',
              menuCollapse ? 'icon-expand' : 'icon-collapse',
            ]"
            @click="opMenu"
          ></div>
          <div class="menu-bread">
            <el-breadcrumb>
              <template v-for="item in menuBreadCrumnList">
                <el-breadcrumb-item v-if="item.name">{{
                  item.name
                }}</el-breadcrumb-item>
              </template>
            </el-breadcrumb>
          </div>
        </el-header>
        <el-main class="main-content">
          <div class="tag-content">
            <el-tabs
              v-model="defaultActive"
              type="border-card"
              @tab-change="tabClic"
              @edit="editTab"
            >
              <el-tab-pane
                v-for="item in tabList"
                :label="item.menuName"
                :name="item.path"
                :closable="tabList.length > 1"
              >
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="content-body">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

// 默认选中
const defaultActive = ref();

// 默认展开的菜单
const defaultOpeneds = ref([]);

const menuList = [
  {
    menuName: "内容管理",
    icon: "icon-article",
    path: "/forum",
    chlidren: [
      {
        menuName: "帖子管理",
        path: "/forum/article",
      },
      {
        menuName: "评论管理",
        path: "/forum/comment",
      },
      {
        menuName: "板块管理",
        path: "/forum/board",
      },
    ],
  },
  {
    menuName: "用户管理",
    icon: "icon-user",
    path: "/user",
    chlidren: [
      {
        menuName: "用户列表",
        path: "/user/list",
      },
    ],
  },
  {
    menuName: "设置",
    icon: "icon-settings",
    path: "/settings",
    chlidren: [
      {
        menuName: "系统设置",
        path: "/settings/sys",
      },
    ],
  },
];
const menuMap = {};
// 默认展开菜单
const init = () => {
  menuList.forEach((item) => {
    defaultOpeneds.value.push(item.path);
    item.chlidren.forEach((subItem) => {
      menuMap[subItem.path] = subItem;
    });
  });
};
init();

// 收起关闭菜单
const menuCollapse = ref(false);
const asideWidth = ref(250);
const opMenu = () => {
  menuCollapse.value = !menuCollapse.value;
  if (menuCollapse.value) {
    asideWidth.value = 63;
  } else {
    asideWidth.value = 250;
  }
};

// tab操作
const tabList = ref([]);
const tabClic = (e) => {
  router.push(e);
  // 回传menuName
};
const editTab = (targetKey, action) => {
  if (action !== "remove") {
    return;
  }
  let currentPath = defaultActive.value;
  let tabs = tabList.value;
  // 关闭当前选中的tab
  if (targetKey == defaultActive.value) {
    tabs.forEach((tab, index) => {
      if (tab.path == targetKey) {
        let nextTab = tabs[index + 1] || tabs[index - 1];
        if (nextTab) {
          currentPath = nextTab.path;
        }
      }
    });
  }
  tabList.value = tabs.filter((tab) => {
    return tab.path !== targetKey;
  });
  if (currentPath !== defaultActive.value) {
    router.push(currentPath);
  }
};
// 面包屑导航
const menuBreadCrumnList = ref([]);
watch(
  () => route,
  (newVal, oldVal) => {
    defaultActive.value = route.path;
    menuBreadCrumnList.value = route.matched;

    let currentPath = tabList.value.find((item) => {
      return item.path == defaultActive.value;
    });
    if (!currentPath) {
      tabList.value.push(menuMap[route.path]);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
// 菜单收起样式
.el-popper {
  border: none !important;
  .el-menu-item.is-active {
    background: var(--el-color-primary);
  }
  .el-menu-item {
    color: #d8d8ee;
  }
  .el-menu--popup {
    padding: 0px;
  }
}
.layout-body {
  .aside {
    background: #3d3c4a;
    .logo {
      display: flex;
      height: 50px;
      color: #fff;
      background: #191828;
      align-items: center;
      font-size: 18px;
      padding-left: 5px;
    }
    .menu-panel {
      height: calc(100vh - 50px);
      .menu-name {
        padding-left: 10px;
      }
      // 去除边框
      .el-menu {
        border-right: none;
      }
      // 每个菜单的颜色
      .el-menu-item {
        background: #353544;
      }
      // 选中的颜色
      .el-menu-item.is-active {
        color: #fff;
        background: var(--link);
      }
      // 鼠标移上去的颜色
      .el-menu-item:hover {
        color: #d8d8ee;
      }
    }
  }
  .header {
    background: #fff;
    border-bottom: 1px solid #ddd;
    height: 50px;
    line-height: 50px;
    padding: 0px 10px !important;
    display: flex;
    align-items: center;
    .op-menu {
      font-size: 20px;
      cursor: pointer;
      color: #3a3a40;
    }
    .menu-bread {
      margin-left: 10px;
    }
  }

  .main-content {
    padding: 0px;
    .tag-content {
      .el-tabs--border-card {
        border: none;
      }
      .el-tabs__content {
        display: none;
      }
    }
    .content-body {
      overflow: hidden;
      padding: 10px 10px 5px 10px;
    }
  }
}
</style>

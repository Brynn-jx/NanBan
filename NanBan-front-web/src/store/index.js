import { createStore } from "vuex";
// 状态管理
export default createStore({
  // 要共享的数据
  state: {
    // 用户信息
    loginUserInfo: null,
    // 是否展示登录界面
    showLogin: false,
    // 板块信息
    boardList: [],
    // 一级板块
    activePBoardId: 0,
    // 二级板块
    activeBoardId: 0,
    // 消息数量
    messageCountInfo: {},
    // 系统设置
    sysSetting: {},
  },
  // 逻辑处理
  getters: {
    getLoginUserInfo: (state) => {
      return state.loginUserInfo;
    },
    getBoardList: (state) => {
      return state.boardList;
    },
    // 嵌套函数， 返回了一个函数 可以通过让 getter 返回一个函数，来实现给 getter 传参。
    getSubBoardList: (state) => (boardId) => {
      let board = state.boardList.find((item) => {
        return item.boardId == boardId;
      });
      return board ? board.children : [];
    },
    getActivePBoardId: (state) => {
      return Store.activePBoardId;
    },
    getActiveBoardId: (state) => {
      return Store.activeBoardId;
    },
    getMessageCountInfo: (state) => {
      return Store.messageCountInfo;
    },
  },
  // 修改数据
  mutations: {
    updateLoginUserInfo(state, value) {
      state.loginUserInfo = value;
    },
    showLogin(state, value) {
      state.showLogin = value;
    },
    saveBoardList(state, value) {
      state.boardList = value;
    },
    setActivePBoardId: (state, value) => {
      state.activePBoardId = value;
    },
    setActiveBoardId: (state, value) => {
      state.activeBoardId = value;
    },
    updateMessageCountInfo: (state, value) => {
      state.messageCountInfo = value;
    },
    readMessage: (state, value) => {
      state.messageCountInfo.total =
        state.messageCountInfo.total - state.messageCountInfo[value];
      state.messageCountInfo[value] = 0;
    },
    saveSysSetting: (state, value) => {
      state.sysSetting = value;
    },
  },
});

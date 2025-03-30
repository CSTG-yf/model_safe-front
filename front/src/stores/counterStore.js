import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
    state: () => ({
        projectName: '',
        access: localStorage.getItem('access') || null,
        refresh: localStorage.getItem('refresh') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        projectId: localStorage.getItem('projectId') || null,
        userId: localStorage.getItem('userId') || null,  // 添加用户ID存储
        questionBankId: null, // 添加新的状态
        transformMethod: null, // 添加变形方法状态
    }),

    actions: {
        updateProjectName(name) {
            this.projectName = name;
        },
        setProjectId(id) {
            this.projectId = id;
            localStorage.setItem('projectId', id);
        },
        setUserInfo(userData) {
            this.access = userData.access;
            this.refresh = userData.refresh;
            this.user = userData.user;
            this.userId = userData.user.id;  // 存储用户ID
            
            // 保存到本地存储
            localStorage.setItem('access', userData.access);
            localStorage.setItem('refresh', userData.refresh);
            localStorage.setItem('user', JSON.stringify(userData.user));
            localStorage.setItem('userId', userData.user.id);
        },
        clearUserInfo() {
            this.access = null;
            this.refresh = null;
            this.user = null;
            this.userId = null;
            this.projectId = null;
            
            // 清除本地存储
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            localStorage.removeItem('projectId');
        },
        // 添加检查是否登录的方法
        isLoggedIn() {
            return !!(this.access && this.user && this.userId);
        },
        setQuestionBankId(id) {
            this.questionBankId = id;
        },
        setTransformMethod(method) {
            this.transformMethod = method;
            localStorage.setItem('transformMethod', method); // 持久化存储
        },
        clearTransformMethod() {
            this.transformMethod = null;
            localStorage.removeItem('transformMethod');
        },
    },

    getters: {
        getProjectName: (state) => state.projectName,
        getUserId: (state) => state.userId,
        getProjectId: (state) => state.projectId,
        getTransformMethod: (state) => state.transformMethod || localStorage.getItem('transformMethod'),
    }
});

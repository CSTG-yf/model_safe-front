import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
    state: () => ({
        projectName: '',  // 初始化为空
        access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQyMzkwMzQ1LCJpYXQiOjE3NDIzMDM5NDUsImp0aSI6IjllYTk0ODJjYWNkMjQ5ZDc5ZGNiMDA4ZGQyMTI4N2VmIiwidXNlcl9pZCI6MX0.lhjf3SPW5uWd3OziwpuMIubl7GINB_K0Xm76Xf0B4ho",
        projectId: null,
    }),

    actions: {
        updateProjectName(name) {
            this.projectName = name;
        },
        setProjectId(id) {
            this.projectId = id;
        }
    },

    getters: {
        getProjectName: (state) => this.state.projectName, // ✅ 正确写法
    }
});

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import EmptyContent from '@/views/EmptyContent.vue'
import NewProject from '@/views/NewProject.vue'
import SearchProject from '@/views/SearchProject.vue'
import Step1 from '@/views/Step1.vue'
import Step2 from '@/views/Step2.vue'
import Step3 from '@/views/Step3.vue'
import Step4 from '@/views/Step4.vue'
import Project from '@/views/Project.vue'
import TestBankGenerate from '@/views/TestBankGenerate.vue'
import TestBankManage from '@/views/TestBankManage.vue'
import Console from '@/views/Console.vue'
import TestBankExtension from '@/views/TestBankExtension.vue'
import TestBankExtension2 from '@/views/TestBankExtension2.vue'
import TestBankExtension3 from "@/views/TestBankExtension3.vue";
import TestBankExtension4 from "@/views/TestBankExtension4.vue";
import TestBankTest from "@/views/TestBankTest.vue";
import TestBankTest2 from "@/views/TestBankTest2.vue";
import TestBankTest3 from "@/views/TestBankTest3.vue";
import JailbreakTransform from "@/views/JailbreakTransform.vue";
import JailbreakTransform2 from "@/views/JailbreakTransform2.vue";
import JailbreakTransform3 from "@/views/JailbreakTransform3.vue";
import TestBankDetail from "@/views/TestBankDetail.vue";
import TestManage from "@/views/TestManage.vue";
import TestReview from "@/views/TestReview.vue";
import PerfEval from "@/views/PerfEval.vue";
import PerfEvalDashboard from "@/views/PerfEvalDashboard.vue";
import PerfEvalResult from "@/views/PerfEvalResult.vue";
import ReportGenerate from "@/views/ReportGenerate.vue";
import ReportGenerateParams from "@/views/ReportGenerateParams.vue";
import ReportGenerateProgress from "@/views/ReportGenerateProgress.vue";
import ReportGenerateDetail from "@/views/ReportGenerateDetail.vue";
import ReportManage from "@/views/ReportManage.vue";
import ReportDetail from "@/views/ReportDetail.vue";
import TestBankGenerateProgress from "@/views/TestBankGenerateProgress.vue";
import TestBankGenerateComplete from "@/views/TestBankGenerateComplete.vue";
import testjson from '../views/testjson.vue'
import { useCounterStore } from '@/stores/counterStore';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/testjson', component: testjson },
    {
        path: '/home',
        component: HomeView,
        children: [
            { path: '', component: EmptyContent },
            {
                path: 'newproject',
                component: NewProject,
                children: [
                    { path: '', redirect: 'step1' },
                    { path: 'step1', component: Step1 },
                    { path: 'step2', component: Step2 },
                    { path: 'step3', component: Step3 },
                    { path: 'step4', component: Step4 },
                    { path: 'finish', component: EmptyContent }
                ]
            },
            { path: 'searchproject', component: SearchProject }
        ]
    },
    {
        path: '/project/:projectId?',
        component: Project,
        children: [
            { path: '', redirect: 'console' },
            { path: 'console', component: Console },
            { path: 'testbank-generate', component: TestBankGenerate },
            { path: 'testbank-generate-progress', component: TestBankGenerateProgress },
            { path: 'testbank-generate-complete', component: TestBankGenerateComplete },
            { path: 'testbank-manage', component: TestBankManage },
            { path: 'testbank-detail', component: TestBankDetail },
            { path: 'testbank-detail/:id', component: TestBankDetail },
            { path: 'testbank-extension', component: TestBankExtension },
            { path: 'testbank-extension2', component: TestBankExtension2 },
            { path: 'testbank-extension3', component: TestBankExtension3 },
            { path: 'testbank-extension4', component: TestBankExtension4 },
            { path: 'testbank-test', component: TestBankTest },
            { path: 'testbank-test2', component: TestBankTest2 },
            { path: 'testbank-test3', component: TestBankTest3 },
            { path: 'test-manage', component: TestManage },
            { path: 'test-review', component: TestReview },
            { path: 'test-review/:testId', component: TestReview },
            { path: 'jailbreak-transform', component: JailbreakTransform },
            { path: 'jailbreak-transform2', component: JailbreakTransform2 },
            { path: 'jailbreak-transform3', component: JailbreakTransform3 },
            { path: 'perf-eval', component: PerfEval },
            { path: 'perf-eval-dashboard', component: PerfEvalDashboard },
            { path: 'perf-eval-result', component: PerfEvalResult },
            { path: 'report-generate', component: ReportGenerate },
            { path: 'report-generate-params', component: ReportGenerateParams },
            { path: 'report-generate-progress', component: ReportGenerateProgress },
            { path: 'report-generate-detail', component: ReportGenerateDetail },
            { path: 'report-manage', component: ReportManage },
            { path: 'report-detail', component: ReportDetail },
            { path: 'report-detail/:id', component: ReportDetail }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
  const store = useCounterStore();
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !store.isLoggedIn()) {
    store.clearUserInfo();  // 确保清除所有状态
    next('/login');
  } else {
    next();
  }
});

export default router

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

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
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
                    { path: 'step4', component: Step4 }
                ]
            },
            { path: 'searchproject', component: SearchProject }
        ]
    },
    {
        path: '/project',
        component: Project,
        children: [
            { path: '', redirect: 'console' },
            { path: 'console', component: Console },
            { path: 'testbank-generate', component: TestBankGenerate },
            { path: 'testbank-manage', component: TestBankManage },
            { path: 'testbank-extension', component: TestBankExtension },
            { path: 'testbank-extension2', component: TestBankExtension2 },
            { path: 'testbank-extension3', component: TestBankExtension3 },
            { path: 'testbank-extension4', component: TestBankExtension4 },
            { path: 'testbank-test', component: TestBankTest },
            { path: 'testbank-test2', component: TestBankTest2 },
            { path: 'testbank-test3', component: TestBankTest3 },
            { path: 'jailbreak-transform', component: JailbreakTransform },
            { path: 'jailbreak-transform2', component: JailbreakTransform2 },
            { path: 'jailbreak-transform3', component: JailbreakTransform3 }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

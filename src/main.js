import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia()
	app.use(pinia)
	// 非PC平台直接挂载，不需要路由
	return {
		app,
	};
}
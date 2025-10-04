import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";
// #ifdef WEB
import router from "./router/index.js";
// #endif
import * as CONFIG from '@/utils/config'
export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia()
	app.use(pinia)
	if (CONFIG.PLATFORM === 'PC') {
		app.use(router)
		app.mount('#app1')
	}
	return {
		app,
	};
}

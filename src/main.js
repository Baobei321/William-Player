import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";
import router from "./router/index.js";
import 'virtual:svg-icons-register'

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia()
	app.use(pinia)
	app.use(router)
	app.mount('#app1')
	return {
		app,
	};
}
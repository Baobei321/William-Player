import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";
import i18n from './i18n'
import router from "./router/index.js";
import 'virtual:svg-icons-register'
import 'element-plus/dist/index.css'

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia()
	app.use(pinia)
	app.use(i18n)
	app.use(router)
	app.mount('#app1')
	return {
		app,
	};
}
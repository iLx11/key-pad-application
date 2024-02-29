import './styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { shareStorePlugin } from './stores/plugins/shareStorePlugin'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
// pinia.use(shareStorePlugin)

app.use(pinia)
app.use(router)

app.mount('#app')

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import YearView from './views/YearView.vue'
import DetailView from './views/DetailView.vue'
import './styles/global.css'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/year/:year', name: 'year', component: YearView },
  { path: '/photo/:id', name: 'photo', component: DetailView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')

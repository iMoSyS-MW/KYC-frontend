import { createApp } from 'vue'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import App from './App.vue'
import router from './router'
import { createConfirmPlugin } from './plugins/confirm'
import './index.css'

const confirmPlugin = createConfirmPlugin()

const app = createApp(App)

app.use(router)
app.use(confirmPlugin)
app.use(Vue3Toastify, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  maxToasts: 5,
  newestOnTop: true,
})

app.mount('#app')

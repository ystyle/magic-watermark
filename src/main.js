import { createApp } from 'vue'
import { Upload, Input, Button, PageHeader, Menu } from 'ant-design-vue'
import App from './App.vue'
import './registerServiceWorker'

const app = createApp(App)
app.use(Upload)
app.use(Input)
app.use(PageHeader)
app.use(Button)
app.use(Menu)
app.config.productionTip = false
app.mount('#app')

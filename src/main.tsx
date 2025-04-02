import NiceModal from '@ebay/nice-modal-react'
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@shoelace-style/shoelace/dist/themes/light.css'
import '@shoelace-style/shoelace/dist/translations/zh-cn.js'

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/')

ReactDOM.createRoot(
  (() => {
    const app = document.createElement('div')
    app.style.position = 'fixed'
    app.style.bottom = '0px'
    app.style.left = '0px'
    app.style.zIndex = '99999'
    app.lang = 'zh-cn'

    document.body.append(app)

    return app
  })(),
).render(
  // <React.StrictMode>
  <NiceModal.Provider>
    <App />
  </NiceModal.Provider>,
  // </React.StrictMode>
)

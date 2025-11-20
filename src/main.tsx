import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FluentProvider } from '@fluentui/react-components'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <FluentProvider>
      <App />
    </FluentProvider>
  </BrowserRouter>,
)

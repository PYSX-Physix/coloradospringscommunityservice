import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FluentProvider, webDarkTheme } from '@fluentui/react-components'
import { BrowserRouter } from 'react-router-dom';
import { initializeCsrfFetch } from './lib/csrf-helpers';

initializeCsrfFetch();
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <FluentProvider theme={webDarkTheme}>
      <App />
    </FluentProvider>
  </BrowserRouter>,
)

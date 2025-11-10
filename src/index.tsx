import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <BrowserRouter>
    <FluentProvider theme={webDarkTheme}>
      <App />
    </FluentProvider>
  </BrowserRouter>
);

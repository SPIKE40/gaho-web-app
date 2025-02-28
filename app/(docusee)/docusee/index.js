import React from 'react';
import ReactDOM from 'react-dom/client'; // createRoot를 사용하기 위해 'react-dom/client'에서 가져옵니다.
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // root element를 생성합니다.

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

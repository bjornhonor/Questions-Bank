// /frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORTE O PROVEDOR

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* O AuthProvider agora "abraça" toda a aplicação */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
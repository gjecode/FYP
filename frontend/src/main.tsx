import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// NOTE: React.StrictMode was removed as a workaround, 
// likely due to conflicts with React v18+ and react-router-dom v5+, 
// causing history to not work correctly (url replaced, component doesn't update).
// Alternatively, react can be downgraded to be v17+ but issues w other dependencies might arise 
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/swRegister.ts';

document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'ar');

document.documentElement.classList.remove('dark');

registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);

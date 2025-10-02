import './style.css'
import { ChainReliefApp } from './chainrelief-app.js'

// Initialize ChainRelief Application
document.addEventListener('DOMContentLoaded', () => {
  const app = new ChainReliefApp();
  app.init();
});

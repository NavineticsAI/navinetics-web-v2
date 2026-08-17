import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
/* Imported for its side effect: installs the scroll listener the partners globe
   uses to stand aside during a gesture. It belongs here rather than in a
   component — its only other importer is the globe, which is lazy-loaded on one
   route, so on every other page the listener would never be installed. */
import './lib/scrollState.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

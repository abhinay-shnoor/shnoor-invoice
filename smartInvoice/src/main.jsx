import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const isValidClientId = rawClientId && rawClientId.trim() !== "" && !rawClientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE");

// Provide a valid format fallback client ID to satisfy the SDK on mount
const fallbackClientId = "100000000000-placeholder.apps.googleusercontent.com";
const activeClientId = isValidClientId ? rawClientId : fallbackClientId;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={activeClientId}>
      <App isGoogleConfigured={isValidClientId} />
    </GoogleOAuthProvider>
  </StrictMode>,
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css'
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email",
      }}
    >
      <BrowserRouter >
        <UserProvider>
          <App />
        </UserProvider>
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)

import { Routes, Route } from 'react-router-dom';

import './App.css';
import { useEffect } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { getMe } from "./services/api";
import { useUser } from "./context/UserContext";
import { connectSocket, disconnectSocket } from "./services/socket";
import MainRouter from './router/MainRouter';
import NavBar from './components/Navbar';
import ContactPage from './pages/Contact'; 
import HomePage    from "./pages/Home";
import OnboardingPage from "./pages/OnboardingPage";

 
function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const { dbUser, setDbUser } = useUser();
  
   useEffect(() => {
    if (!isAuthenticated || !user) return;

    const init = async () => {
      try {
        const token = await getAccessTokenSilently();
        try {
          const me = await getMe(token);
          setDbUser(me);
        } catch {
          setDbUser(null); // new user → needs onboarding  
        }
        connectSocket(token);
      } catch (err) {
        console.error("Init error:", err);
      }
    };

    init(); 
    return () => disconnectSocket();
  }, [isAuthenticated, user, getAccessTokenSilently]);
  
  
  if (isLoading) return <div className="splash">Loading...</div>;


  if (!isAuthenticated) {
    return (
      <>
        <NavBar />
        <Routes>
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/"        element={<HomePage />} />
        </Routes>
      </>
    );
  }
  if (!dbUser) return <OnboardingPage />;

  // ── Fully logged in ──
  return (
     <>
      <NavBar />
      <main className="layout-main">
    <MainRouter />
    </main>
    </>
  );
}
 
export default App;
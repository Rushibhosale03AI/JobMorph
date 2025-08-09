// src/App.js (Corrected)

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

// --- Page Imports ---
import LandingPage from "./components/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UploadPage from "./components/UploadPage";
import DashboardLayout from './pages/DashboardLayout';
import MainDashboardPage from './pages/MainDashboardPage';
import DashboardResultsPage from './pages/DashboardResultsPage';
import HowItWorksPage from './pages/HowItWorksPage'; 
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="about" element={<HowItWorksPage />} />
           <Route path="/jobmorphabout" element={<AboutPage />} />



          {/* --- Protected Routes --- */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            {/* CORRECTED: The index route is now nested inside /dashboard */}
            <Route index element={<MainDashboardPage />} />
            <Route path="history" element={<DashboardResultsPage />} />
            <Route path="upload" element={<UploadPage />} />
            
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
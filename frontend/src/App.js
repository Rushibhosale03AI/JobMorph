// src/App.js
import React from "react";
import { AuthProvider } from './context/AuthContext';
import LandingPage from "./components/LandingPage";
import UploadPage from "./components/UploadPage";
import ResultPage from "./pages/ResultPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PrivateRoute from "./components/PrivateRoute";
import DashboardPage from "./pages/DashboardPage";  
import DashboardResultsPage from "./pages/DashboardResultsPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/result" element={<PrivateRoute><ResultPage /></PrivateRoute>} />
          {/* <Route path="/dashboard" element={<DashboardPage />} />  */}
          <Route path="/dashboard" element={<DashboardResultsPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

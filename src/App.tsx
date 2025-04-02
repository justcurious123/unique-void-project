
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster"
import GoalDetail from './pages/GoalDetail';
import Admin from './pages/Admin';
import { AuthProvider } from './contexts/AuthContext';
import Pricing from './pages/Pricing';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<NavBar />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="goal/:goalId" element={<GoalDetail />} />
            <Route path="auth" element={<Auth />} />
            <Route path="admin" element={<Admin />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

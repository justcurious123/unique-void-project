
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster"
import GoalDetail from './pages/GoalDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavBar />}>
          <Route index element={<Index />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="goal/:goalId" element={<GoalDetail />} />
          <Route path="auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

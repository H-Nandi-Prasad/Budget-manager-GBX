import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { DepartmentsProvider } from '@/contexts/DepartmentsContext';
import { TransactionProvider } from '@/contexts/TransactionContext';
import { ReportsProvider } from '@/contexts/ReportsContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import SimpleReports from "./pages/SimpleReports";
import Login from "./pages/Login";
import TestConnection from "./pages/TestConnection";
import NotFound from "@/pages/NotFound";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "./lib/utils";

function LoadingScreen() {
  const { resetAuthState } = useAuth();
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleReset = () => {
    localStorage.clear();
    resetAuthState();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-xl">Loading...</p>
          
          {showButtons && (
            <>
              <p className="text-sm text-gray-400 mb-4">Taking longer than expected? Try these options:</p>
              <button 
                onClick={handleReset}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reset and Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { isAuthenticated, isLoading });
    console.log('ProtectedRoute - Current location:', location.pathname);
  }, [isAuthenticated, isLoading, location]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    const returnPath = location.pathname !== '/login' ? location.pathname : '/';
    return <Navigate to="/login" state={{ from: returnPath }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation onExpandChange={setIsNavExpanded} />
      <main className={cn(
        "transition-all duration-300",
        isNavExpanded ? 'ml-64' : 'ml-20'
      )}>
        <Outlet />
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/simple-reports" element={<SimpleReports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <AuthProvider>
        <CurrencyProvider>
          <DepartmentsProvider>
            <TransactionProvider>
              <ReportsProvider>
                <AppContent />
                <Toaster />
              </ReportsProvider>
            </TransactionProvider>
          </DepartmentsProvider>
        </CurrencyProvider>
      </AuthProvider>
    </div>
  );
}

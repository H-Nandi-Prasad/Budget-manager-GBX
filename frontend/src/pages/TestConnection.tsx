import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import ApiService from '@/services/api';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const testBackendConnection = async () => {
    try {
      setIsLoading(true);
      setStatus('Testing backend connection...');
      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();
      setStatus(`Backend Status: ${JSON.stringify(data, null, 2)}`);
      toast({
        title: "Success",
        description: "Backend connection successful",
      });
    } catch (error) {
      setStatus('Backend Error: ' + (error as Error).message);
      toast({
        title: "Error",
        description: "Failed to connect to backend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      setStatus('Initializing database...');
      const response = await fetch('http://localhost:3000/api/admin/init-db', {
        method: 'POST'
      });
      const data = await response.json();
      setStatus(`Database initialized: ${JSON.stringify(data, null, 2)}`);
      toast({
        title: "Success",
        description: "Database initialized successfully",
      });
    } catch (error) {
      setStatus('Database Error: ' + (error as Error).message);
      toast({
        title: "Error",
        description: "Failed to initialize database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      setIsLoading(true);
      setStatus('Testing login...');
      const response = await ApiService.login({
        email: 'admin@example.com',
        password: 'admin123'
      });
      setStatus('Login successful! Token: ' + response.data.token);
      toast({
        title: "Success",
        description: "Login successful",
      });
      // Wait 1 second before redirecting
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setStatus('Login Error: ' + (error as Error).message);
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">System Setup & Test</h1>
          <p className="text-gray-400">Initialize and test your system components</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={testBackendConnection}
            disabled={isLoading}
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            1. Test Backend Connection
          </button>

          <button
            onClick={initializeDatabase}
            disabled={isLoading}
            className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            2. Initialize Database
          </button>

          <button
            onClick={testLogin}
            disabled={isLoading}
            className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
          >
            3. Test Login (admin@example.com)
          </button>
        </div>

        {status && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Status:</h2>
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-300">
              {status}
            </pre>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
} 
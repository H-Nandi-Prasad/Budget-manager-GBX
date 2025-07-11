import React, { useState } from 'react';
import { testBackendConnection, testAuthentication } from '../utils/connection-test';

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await testBackendConnection();
      setConnectionStatus(result.message);
    } catch (error: any) {
      setConnectionStatus(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const result = await testAuthentication();
      setAuthStatus(result.message);
    } catch (error: any) {
      setAuthStatus(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Backend Connection Test</h2>
      
      <div className="mb-4">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
        >
          Test Connection
        </button>
        <button 
          onClick={testAuth}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Test Authentication
        </button>
      </div>
      
      {loading && <p className="text-gray-500">Testing connection...</p>}
      
      {connectionStatus && (
        <div className="mb-4">
          <h3 className="font-semibold">Connection Status:</h3>
          <p className={connectionStatus.includes('successful') ? 'text-green-600' : 'text-red-600'}>
            {connectionStatus}
          </p>
        </div>
      )}
      
      {authStatus && (
        <div>
          <h3 className="font-semibold">Authentication Status:</h3>
          <p className={authStatus.includes('successful') ? 'text-green-600' : 'text-red-600'}>
            {authStatus}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest; 
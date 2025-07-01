import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import client from './utils/apolloClient';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TaskList from './components/Tasks/TaskList';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token validity here if needed
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const handleAuth = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {user ? (
          <div>
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <h1 className="text-xl font-semibold">Task Manager</h1>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </header>
            <main className="py-8">
              <TaskList />
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex justify-center items-center">
            <div className="w-full max-w-md">
              <div className="mb-4 text-center">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`mr-4 px-4 py-2 rounded ${isLogin ? 'bg-blue-600 text-white' : 'text-blue-600'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-4 py-2 rounded ${!isLogin ? 'bg-blue-600 text-white' : 'text-blue-600'}`}
                >
                  Register
                </button>
              </div>
              {isLogin ? (
                <Login onLogin={handleAuth} />
              ) : (
                <Register onRegister={handleAuth} />
              )}
            </div>
          </div>
        )}
      </div>
    </ApolloProvider>
  );
}

export default App;
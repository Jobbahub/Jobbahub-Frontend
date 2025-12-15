import React from 'react';
import { useAuth } from '../context/authContext.tsx';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login("gebruiker@voorbeeld.nl", "geheim");
    navigate('/dashboard'); // Stuur gebruiker door na inloggen
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-secondary">Inloggen</h2>
      <p className="mb-4 text-sm text-gray-500">Klik op de knop om in te loggen (simulatie).</p>
      <button 
        onClick={handleLogin} 
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Inloggen
      </button>
    </div>
  );
};

export default Login;
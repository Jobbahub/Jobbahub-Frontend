import React from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login("gebruiker@voorbeeld.nl", "geheim");
    navigate('/dashboard');
  };

  return (
    <div className="form-container">
      <h2 style={{ marginBottom: '20px', color: 'var(--secondary-color)' }}>Inloggen</h2>
      <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Klik op de knop om in te loggen (simulatie).</p>
      <button 
        onClick={handleLogin} 
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        Inloggen
      </button>
    </div>
  );
};

export default Login;
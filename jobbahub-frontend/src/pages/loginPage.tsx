import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Lokale state voor formulier invoer
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Voorkom dat de pagina herlaadt
    setLoading(true);
    setFormError(null);

    try {
      await login(email, password);
      // Als het lukt, stuur door naar dashboard
      navigate('/dashboard');
    } catch (err: any) {
      // Foutafhandeling wordt deels in context gedaan, maar we tonen het hier ook
      setFormError(err.message || "Inloggen mislukt. Controleer je gegevens.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ marginTop: '60px' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--secondary-color)', fontSize: '1.8rem' }}>
        Inloggen
      </h2>
      
      <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
        Vul je gegevens in om toegang te krijgen tot je dashboard.
      </p>

      {formError && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #fca5a5'
        }}>
          {formError}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            E-mailadres
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="naam@voorbeeld.nl"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ textAlign: 'left' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Wachtwoord
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '1rem'
            }}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
          style={{ 
            width: '100%', 
            marginTop: '10px',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Bezig met inloggen...' : 'Inloggen'}
        </button>
      </form>
    </div>
  );
};

export default Login;
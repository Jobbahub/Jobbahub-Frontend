import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../services/apiService';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  // Check for existing lockout on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('lockoutEmail');
    const storedError = localStorage.getItem('lockoutError');
    const storedLockout = localStorage.getItem('loginLockoutEnds');

    if (storedLockout) {
      const endTime = parseInt(storedLockout, 10);
      const now = Date.now();
      if (endTime > now) {
        setLockoutTimer(Math.ceil((endTime - now) / 1000));
        // Restore context if lockout is still active
        if (storedEmail) setEmail(storedEmail);
        if (storedError) setFormError(storedError);
      } else {
        // Expired while away
        localStorage.removeItem('loginLockoutEnds');
        localStorage.removeItem('lockoutEmail');
        localStorage.removeItem('lockoutError');
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer !== null && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          }
          // Timer finished
          localStorage.removeItem('loginLockoutEnds');
          localStorage.removeItem('lockoutEmail');
          localStorage.removeItem('lockoutError');
          return null;
        });
      }, 1000);
    } else if (lockoutTimer === 0) {
      setLockoutTimer(null);
      setFormError(null);
      localStorage.removeItem('loginLockoutEnds');
      localStorage.removeItem('lockoutEmail');
      localStorage.removeItem('lockoutError');
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      await login(email, wachtwoord);
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("Inloggen mislukt. Controleer je gegevens.");

      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes('geblokkeerd') || errorLower.includes('rate limit') || errorLower.includes('inlogpogingen') || errorLower.includes('too many') || errorLower.includes('lock')) {
        const lockoutDuration = 180; // 3 minutes
        setLockoutTimer(lockoutDuration);
        const endTime = Date.now() + lockoutDuration * 1000;
        localStorage.setItem('loginLockoutEnds', endTime.toString());
        localStorage.setItem('lockoutEmail', email);
        localStorage.setItem('lockoutError', errorMessage);
      }

      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2 className="form-title">{t("Inloggen")}</h2>

        <p className="form-description">
          {t("Vul je gegevens in om toegang te krijgen tot je dashboard.")}
        </p>

        {formError && (
          <div className="form-error">
            {formError}
            {lockoutTimer !== null && (
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                {t("account_blocked_timer")} {Math.floor(lockoutTimer / 60)}:{(lockoutTimer % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t("E-mailadres")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t("naam@voorbeeld.nl")}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wachtwoord" className="form-label">
              {t("Wachtwoord")}
            </label>
            <input
              type="password"
              id="wachtwoord"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              required
              placeholder={t("••••••••")}
              className="form-input"
            />
          </div>

          <div className="form-note" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', fontStyle: 'italic' }}>
            {t("login_disclaimer")}
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading || lockoutTimer !== null ? 'btn-disabled' : ''}`}
            disabled={loading || lockoutTimer !== null}
          >
            {loading ? t("Bezig met inloggen...") : t("Inloggen")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

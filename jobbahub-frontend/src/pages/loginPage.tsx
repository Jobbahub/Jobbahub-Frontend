import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      const loggedInUser = await login(email, password);

      // Check of er opgeslagen resultaten zijn
      if (loggedInUser.vragenlijst_resultaten &&
        loggedInUser.vragenlijst_resultaten.aanbevelingen &&
        loggedInUser.vragenlijst_resultaten.aanbevelingen.length > 0) {
        navigate('/vragenlijst');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setFormError(err.message || t("Inloggen mislukt. Controleer je gegevens."));
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
            <label htmlFor="password" className="form-label">
              {t("Wachtwoord")}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t("••••••••")}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? t("Bezig met inloggen...") : t("Inloggen")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
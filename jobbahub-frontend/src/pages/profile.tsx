import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// TODO: change about class names globally to profile where applicable and set styles in css stylesheet

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [education, setEducation] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    // Show modal with passwords
    console.log("Change password clicked");
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      //   Backend api logica hier toevoegen
    } catch (err: any) {
      setFormError(err.message || "Inloggen mislukt. Controleer je gegevens.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1 className="page-hero-title">Profile</h1>
      </div>

      <div className="container" style={{ marginTop: "40px" }}>
        {formError && <div className="form-error">{formError}</div>}
        <div
          className="about-content-box" //change to profile class
          style={{ maxWidth: "400px", margin: "0 auto", minHeight: "auto" }}
        >
          <form
            onSubmit={() => {
              //handleChangeCredentials()
              navigate("/modules");
            }}
            className="login-form"
          >
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Wijzig username
              </label>
              <input
                type="text"
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                placeholder="username"
                className="form-input"
              />
            </div>

            {/* Geen email toegevoegd, kan verwijderd worden */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Wijzig E-mailadres
              </label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                // onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="naam@voorbeeld.nl"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="education" className="form-label">
                Wijzig opleiding
              </label>
              <input
                type="text"
                id="education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                required
                placeholder="ICT"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full`}
              disabled={true}
              onClick={handleChangePassword}
            >
              Verander wachtwoord
            </button>

            <hr />

            <button
              type="submit"
              className={`btn btn-primary w-full ${
                loading ? "btn-disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Bezig met wijzigen..." : "Wijzigingen opslaan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ApiError, apiService } from "../services/apiService";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [userName, setUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
    }
  }, [user]);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!currentPassword) {
      setFormError("Huidig wachtwoord is vereist.");
      return;
    }

    setLoading(true);
    setShowModal(false);

    try {
      const payload: any = { currentPassword };
      if (userName !== user?.name) payload.newNaam = userName;
      if (newPassword) payload.newPassword = newPassword;

      const response = await apiService.changeCredentials(payload);

      updateUser(response.user);

      setSuccessMessage("Gegevens succesvol gewijzigd");
      setNewPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      setFormError(err.message || "Wijziging mislukt.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuestions = async () => {
    if (
      user &&
      window.confirm("Weet je zeker dat je je resultaten wilt verwijderen?")
    ) {
      try {
        await apiService.deleteQuestionnaireResults();
        const updatedUser = { ...user };
        delete updatedUser.vragenlijst_resultaten;
        updateUser(updatedUser);
        setSuccessMessage("Vragenlijst succesvol gereset.");
      } catch (e: any) {
        navigate("/error", {
          state: {
            title: "Resetten mislukt",
            message: "Kon resultaten niet verwijderen.",
            code: e instanceof ApiError ? e.status : "RESET_ERROR",
            from: window.location.pathname,
          },
        });
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1 className="page-hero-title">Profile</h1>
      </div>

      <div className="container" style={{ marginTop: "40px" }}>
        {formError && <div className="form-error">{formError}</div>}
        {successMessage && (
          <div className="profile-form-success">{successMessage}</div>
        )}

        <div
          className="about-content-box"
          style={{ maxWidth: "400px", margin: "0 auto", minHeight: "auto" }}
        >
          <form onSubmit={handleOpenConfirmModal} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-mailadres</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="form-input profile-form-input-disabled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nieuw wachtwoord</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="********"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${
                loading ? "btn-disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Opslaan..." : "Wijzigingen opslaan"}
            </button>

            <hr />

            <button
              type="button"
              className="btn btn-secondary w-full"
              style={{ marginTop: "10px" }}
              onClick={handleResetQuestions}
            >
              Reset vragenlijst
            </button>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <h3>Bevestig wijziging</h3>
            <p>Voer je huidige wachtwoord in om de wijzigingen op te slaan.</p>

            <input
              type="password"
              className="form-input"
              placeholder="Huidig wachtwoord"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoFocus
            />

            <div className="profile-modal-actions">
              <button
                className="btn btn-secondary w-full"
                onClick={() => {
                  setShowModal(false);
                  setCurrentPassword("");
                }}
              >
                Annuleren
              </button>
              <button
                className="btn btn-primary w-full"
                onClick={handleFinalSubmit}
              >
                Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

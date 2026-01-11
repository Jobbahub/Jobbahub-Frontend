import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, apiService } from "../services/apiService";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

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
      setFormError(t("current_password_required"));
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

      setSuccessMessage(t("profile_update_success"));
      setNewPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      setFormError(err.message || t("profile_update_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuestions = async () => {
    if (
      user &&
      window.confirm(t("reset_confirm"))
    ) {
      try {
        await apiService.deleteQuestionnaireResults();
        const updatedUser = { ...user };
        delete updatedUser.vragenlijst_resultaten;
        updateUser(updatedUser);
        setSuccessMessage(t("reset_success"));
      } catch (e: any) {
        navigate("/error", {
          state: {
            title: t("reset_failed_msg"),
            message: t("reset_failed_msg"),
            code: e instanceof ApiError ? e.status : "RESET_ERROR",
            from: window.location.pathname,
          },
        });
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/images/heroes/trees.jpg)`,
      }}>
        <h1 className="page-hero-title hero-title-shadow">{t("profile_page_title")}</h1>
      </div>

      <div className="container profile-container">
        {formError && <div className="form-error">{formError}</div>}
        {successMessage && (
          <div className="profile-form-success">{successMessage}</div>
        )}

        <div
          className="about-content-box profile-content-box"
        >
          <form onSubmit={handleOpenConfirmModal} className="login-form">
            <div className="form-group">
              <label className="form-label">{t("username_label")}</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t("E-mailadres")}</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="form-input profile-form-input-disabled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t("new_password_label")}</label>
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
              className={`btn btn-primary w-full ${loading ? "btn-disabled" : ""
                }`}
              disabled={loading}
            >
              {loading ? t("saving") : t("save_changes")}
            </button>

            <hr />

            <button
              type="button"
              className="btn btn-secondary w-full profile-reset-btn"
              onClick={handleResetQuestions}
            >
              {t("reset_questionnaire_btn")}
            </button>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <h3>{t("confirm_change_modal_title")}</h3>
            <p>{t("confirm_change_modal_text")}</p>

            <input
              type="password"
              className="form-input"
              placeholder={t("current_password_placeholder")}
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
                {t("cancel")}
              </button>
              <button
                className="btn btn-primary w-full"
                onClick={handleFinalSubmit}
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
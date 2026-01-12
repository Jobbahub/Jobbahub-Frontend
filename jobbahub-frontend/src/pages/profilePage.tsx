import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, apiService, AIRecommendation } from "../services/apiService";
import { IChoiceModule } from "../types";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();

  const [userName, setUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Module swap state
  const [allModules, setAllModules] = useState<IChoiceModule[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingSwap, setSavingSwap] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      
      // Load recommendations from user data
      if (user.vragenlijst_resultaten?.aanbevelingen) {
        setRecommendations(user.vragenlijst_resultaten.aanbevelingen);
      }
    }
  }, [user]);

  // Fetch all modules for the swap search
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modules = await apiService.getModules();
        setAllModules(modules);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
      }
    };
    fetchModules();
  }, []);

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
        setRecommendations([]);
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

  // Module swap functions
  const openSwapModal = (index: number) => {
    setSwapIndex(index);
    setSearchTerm("");
    setShowSwapModal(true);
  };

  const closeSwapModal = () => {
    setShowSwapModal(false);
    setSwapIndex(null);
    setSearchTerm("");
  };

  const getModuleName = (module: IChoiceModule) => {
    if (language === 'en' && module.name_en) {
      return module.name_en;
    }
    return module.name;
  };

  const filteredModules = allModules.filter((module) => {
    const name = getModuleName(module).toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search);
  });

  const handleSelectModule = async (module: IChoiceModule) => {
    if (swapIndex === null || !user?.vragenlijst_resultaten) return;

    setSavingSwap(true);

    try {
      // Create updated recommendations
      const updatedRecs = [...recommendations];
      updatedRecs[swapIndex] = {
        name: module.name,
        match_percentage: updatedRecs[swapIndex]?.match_percentage || 0,
        waarom: t("Handmatig geselecteerd"),
        studycredit: module.studycredit || 0,
        category_scores: {}
      };

      // Save to backend
      const updatedResults = {
        ...user.vragenlijst_resultaten,
        aanbevelingen: updatedRecs
      };

      await apiService.saveQuestionnaireResults(updatedResults);

      // Update local state
      setRecommendations(updatedRecs);
      
      // Update user context
      const updatedUser = {
        ...user,
        vragenlijst_resultaten: updatedResults
      };
      updateUser(updatedUser);

      setSuccessMessage(t("Module succesvol gewijzigd"));
      closeSwapModal();
    } catch (err: any) {
      setFormError(err.message || t("Kon module niet wijzigen"));
    } finally {
      setSavingSwap(false);
    }
  };

  // Find full module data for recommendations
  const getModuleForRec = (rec: AIRecommendation): IChoiceModule | undefined => {
    return allModules.find(m => 
      m.name.toLowerCase().includes(rec.name.toLowerCase()) ||
      rec.name.toLowerCase().includes(m.name.toLowerCase())
    );
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1 className="page-hero-title">{t("profile_page_title")}</h1>
      </div>

      <div className="container profile-container">
        {formError && <div className="form-error">{formError}</div>}
        {successMessage && (
          <div className="profile-form-success">{successMessage}</div>
        )}

        <div className="about-content-box profile-content-box">
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
              className={`btn btn-primary w-full ${loading ? "btn-disabled" : ""}`}
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

        {/* Recommended Modules Section */}
        {recommendations.length > 0 && (
          <div className="profile-modules-section">
            <h2 className="profile-modules-title">{t("Jouw Aanbevolen Modules")}</h2>
            <p className="profile-modules-subtitle">
              {t("Klik op 'Wijzigen' om een module te vervangen door een andere.")}
            </p>
            
            <div className="profile-modules-list">
              {recommendations.map((rec, index) => {
                const moduleData = getModuleForRec(rec);
                return (
                  <div key={index} className="profile-module-item">
                    <div className="profile-module-info">
                      <span className="profile-module-rank">#{index + 1}</span>
                      <div className="profile-module-details">
                        <span className="profile-module-name">
                          {moduleData ? getModuleName(moduleData) : rec.name}
                        </span>
                        <span className="profile-module-match">
                          {rec.match_percentage}% match
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-swap"
                      onClick={() => openSwapModal(index)}
                    >
                      {t("Wijzigen")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Password Confirm Modal */}
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

      {/* Swap Module Modal */}
      {showSwapModal && (
        <div className="profile-modal-overlay">
          <div className="swap-modal-content">
            <div className="swap-modal-header">
              <h3>{t("Module Wijzigen")}</h3>
              <button className="swap-modal-close" onClick={closeSwapModal}>
                ×
              </button>
            </div>
            
            <div className="swap-modal-body">
              <p className="swap-modal-subtitle">
                {t("Zoek en selecteer een nieuwe module")}
              </p>
              
              <input
                type="text"
                className="form-input swap-search-input"
                placeholder={t("Zoek op modulenaam...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />

              <div className="swap-results-list">
                {searchTerm.length > 0 && filteredModules.length === 0 && (
                  <div className="swap-no-results">
                    {t("Geen modules gevonden")}
                  </div>
                )}
                
                {filteredModules.slice(0, 10).map((module) => (
                  <div
                    key={module._id}
                    className="swap-result-item"
                    onClick={() => !savingSwap && handleSelectModule(module)}
                  >
                    <div className="swap-result-info">
                      <span className="swap-result-name">{getModuleName(module)}</span>
                      <span className="swap-result-meta">
                        {module.studycredit} EC • {module.location || t("Onbekend")}
                      </span>
                    </div>
                    <span className="swap-result-select">
                      {savingSwap ? "..." : t("Selecteer")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, apiService, AIRecommendation } from "../services/apiService";
import { IChoiceModule } from "../types";

const MAX_MODULES = 5;

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
  const [isAddingNew, setIsAddingNew] = useState(false);
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
    setIsAddingNew(false);
    setSearchTerm("");
    setShowSwapModal(true);
  };

  const openAddModal = () => {
    setSwapIndex(null);
    setIsAddingNew(true);
    setSearchTerm("");
    setShowSwapModal(true);
  };

  const closeSwapModal = () => {
    setShowSwapModal(false);
    setSwapIndex(null);
    setIsAddingNew(false);
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
    if (!user) return;

    setSavingSwap(true);
    setFormError(null);

    try {
      let updatedRecs = [...recommendations];

      if (isAddingNew) {
        // Add new module
        const newRec: AIRecommendation = {
          name: module.name,
          match_percentage: 0,
          waarom: "Handmatig toegevoegd",
          studycredit: module.studycredit || 0,
          category_scores: {}
        };
        updatedRecs.push(newRec);
      } else if (swapIndex !== null) {
        // Swap existing module
        updatedRecs[swapIndex] = {
          name: module.name,
          match_percentage: updatedRecs[swapIndex]?.match_percentage || 0,
          waarom: "Handmatig geselecteerd",
          studycredit: module.studycredit || 0,
          category_scores: {}
        };
      }

      // Build the complete results object with all required fields
      const existingResults = user.vragenlijst_resultaten || {};
      
      const updatedResults = {
        // Provide default empty antwoorden if not present
        antwoorden: existingResults.antwoorden || {
          keuze_taal: null,
          keuze_locatie: null,
          keuze_punten: null,
          open_antwoord: "",
          knoppen_input: {}
        },
        // Keep existing cluster_suggesties or empty array
        cluster_suggesties: existingResults.cluster_suggesties || [],
        // Updated aanbevelingen
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

      setSuccessMessage(isAddingNew ? t("Module succesvol toegevoegd") : t("Module succesvol gewijzigd"));
      closeSwapModal();
    } catch (err: any) {
      console.error("Error saving module:", err);
      setFormError(err.message || t("Kon module niet wijzigen"));
    } finally {
      setSavingSwap(false);
    }
  };

  const handleRemoveModule = async (index: number) => {
    if (!user || !window.confirm(t("Weet je zeker dat je deze module wilt verwijderen?"))) return;

    try {
      const updatedRecs = recommendations.filter((_, i) => i !== index);

      const existingResults = user.vragenlijst_resultaten || {};
      
      const updatedResults = {
        antwoorden: existingResults.antwoorden || {
          keuze_taal: null,
          keuze_locatie: null,
          keuze_punten: null,
          open_antwoord: "",
          knoppen_input: {}
        },
        cluster_suggesties: existingResults.cluster_suggesties || [],
        aanbevelingen: updatedRecs
      };

      await apiService.saveQuestionnaireResults(updatedResults);

      setRecommendations(updatedRecs);
      
      const updatedUser = {
        ...user,
        vragenlijst_resultaten: updatedResults
      };
      updateUser(updatedUser);

      setSuccessMessage(t("Module verwijderd"));
    } catch (err: any) {
      setFormError(err.message || t("Kon module niet verwijderen"));
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

        {/* Modules Section - Always visible */}
        <div className="profile-modules-section">
          <h2 className="profile-modules-title">{t("Mijn Modules")}</h2>
          <p className="profile-modules-subtitle">
            {recommendations.length > 0 
              ? t("Beheer je geselecteerde modules. Je kunt modules wijzigen, verwijderen of toevoegen.")
              : t("Je hebt nog geen modules geselecteerd. Voeg modules toe of vul de vragenlijst in voor aanbevelingen.")}
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
                      {rec.match_percentage > 0 ? (
                        <span className="profile-module-match">
                          {rec.match_percentage}% match
                        </span>
                      ) : (
                        <span className="profile-module-match profile-module-manual">
                          {t("Handmatig toegevoegd")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="profile-module-actions">
                    <button
                      className="btn btn-swap"
                      onClick={() => openSwapModal(index)}
                    >
                      {t("Wijzigen")}
                    </button>
                    <button
                      className="btn btn-remove"
                      onClick={() => handleRemoveModule(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {recommendations.length === 0 && (
              <div className="profile-modules-empty">
                <p>{t("Nog geen modules toegevoegd")}</p>
              </div>
            )}
          </div>

          {/* Add module button */}
          {recommendations.length < MAX_MODULES && (
            <button
              className="btn btn-add-module"
              onClick={openAddModal}
            >
              + {t("Module toevoegen")}
            </button>
          )}
        </div>
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

      {/* Swap/Add Module Modal */}
      {showSwapModal && (
        <div className="profile-modal-overlay">
          <div className="swap-modal-content">
            <div className="swap-modal-header">
              <h3>{isAddingNew ? t("Module Toevoegen") : t("Module Wijzigen")}</h3>
              <button className="swap-modal-close" onClick={closeSwapModal}>
                ×
              </button>
            </div>
            
            <div className="swap-modal-body">
              <p className="swap-modal-subtitle">
                {t("Zoek en selecteer een module")}
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
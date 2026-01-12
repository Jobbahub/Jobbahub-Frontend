import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, apiService, VragenlijstData } from "../services/apiService";
import { TOPICS } from "../data/constants";

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

  // Interests editor state
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<VragenlijstData | null>(null);
  const [savingInterests, setSavingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState<string | null>(null);
  const [interestsSuccess, setInterestsSuccess] = useState<string | null>(null);

  // Get the actual questionnaire answers from the correct path
  // Structure: user.vragenlijst_resultaten = { antwoorden, aanbevelingen, cluster_suggesties }
  const questionnaireResults = user?.vragenlijst_resultaten;
  const userAnswers: VragenlijstData | null = questionnaireResults?.antwoorden || null;

  // Memoize translated topics
  const translatedTopics = useMemo(() => {
    return TOPICS.map(topic => ({
      ...topic,
      label: t(topic.label),
      question: t(topic.question)
    }));
  }, [t]);

  // Group topics by type - only interests needed
  const interestTopics = translatedTopics.filter(topic => topic.type === 'interest');

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
    }
  }, [user]);

  // Initialize edited answers when entering edit mode
  useEffect(() => {
    if (isEditingInterests && userAnswers) {
      setEditedAnswers({ ...userAnswers });
    }
  }, [isEditingInterests, userAnswers]);

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
        setIsEditingInterests(false);
        setEditedAnswers(null);
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

  // Interest editing handlers
  const handleScoreChange = (topicId: string, score: number) => {
    if (!editedAnswers) return;
    setEditedAnswers(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        knoppen_input: {
          ...prev.knoppen_input,
          [topicId]: { ...prev.knoppen_input[topicId], score }
        }
      };
    });
  };

  const handleWeightToggle = (topicId: string) => {
    if (!editedAnswers) return;
    setEditedAnswers(prev => {
      if (!prev) return prev;
      const currentWeight = prev.knoppen_input[topicId]?.weight || 1;
      return {
        ...prev,
        knoppen_input: {
          ...prev.knoppen_input,
          [topicId]: { ...prev.knoppen_input[topicId], weight: currentWeight === 2 ? 1 : 2 }
        }
      };
    });
  };

  const handleSaveInterests = async () => {
    if (!editedAnswers || !user || !questionnaireResults) return;

    setSavingInterests(true);
    setInterestsError(null);
    setInterestsSuccess(null);

    try {
      // Keep the existing recommendations but update the answers
      const dataToSave = {
        antwoorden: editedAnswers,
        aanbevelingen: questionnaireResults.aanbevelingen || [],
        cluster_suggesties: questionnaireResults.cluster_suggesties || []
      };

      const updatedStudent = await apiService.saveQuestionnaireResults(dataToSave);

      // Update user context with new questionnaire results
      updateUser({
        ...user,
        vragenlijst_resultaten: updatedStudent.vragenlijst_resultaten
      });

      setInterestsSuccess(t("Interesses succesvol opgeslagen!"));
      setIsEditingInterests(false);
    } catch (err: any) {
      setInterestsError(err.message || t("Kon interesses niet opslaan"));
    } finally {
      setSavingInterests(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingInterests(false);
    setEditedAnswers(null);
    setInterestsError(null);
  };

  const getScoreLabel = (score: number) => {
    switch (score) {
      case -1: return t("Nee");
      case 0: return t("Neutraal");
      case 1: return t("Ja");
      default: return t("Neutraal");
    }
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case -1: return "var(--text-muted)";
      case 0: return "var(--text-color)";
      case 1: return "var(--primary-color)";
      default: return "var(--text-color)";
    }
  };

  // Render a topic item (either view or edit mode)
  const renderTopicItem = (topic: typeof translatedTopics[0], answers: VragenlijstData) => {
    const answer = answers.knoppen_input?.[topic.id];
    if (!answer) return null;

    const isWeighted = answer.weight === 2;

    if (isEditingInterests && editedAnswers) {
      const editedAnswer = editedAnswers.knoppen_input?.[topic.id];
      const editedIsWeighted = editedAnswer?.weight === 2;

      return (
        <div key={topic.id} className="interest-item interest-item-edit">
          <div className="interest-header">
            <span className="interest-label">{topic.label}</span>
            {topic.type === 'interest' && (
              <button
                type="button"
                className={`weight-toggle-btn ${editedIsWeighted ? 'active' : ''}`}
                onClick={() => handleWeightToggle(topic.id)}
                title={editedIsWeighted ? t("Klik om prioriteit te verwijderen") : t("Klik om als prioriteit te markeren")}
              >
                {editedIsWeighted ? '★ 2x' : '☆'}
              </button>
            )}
          </div>
          <div className="interest-score-buttons">
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice btn-small ${editedAnswer?.score === -1 ? 'active' : ''}`}
              onClick={() => handleScoreChange(topic.id, -1)}
            >
              {t("Nee")}
            </button>
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice btn-small ${editedAnswer?.score === 0 ? 'active' : ''}`}
              onClick={() => handleScoreChange(topic.id, 0)}
            >
              {t("Neutraal")}
            </button>
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice btn-small ${editedAnswer?.score === 1 ? 'active' : ''}`}
              onClick={() => handleScoreChange(topic.id, 1)}
            >
              {t("Ja")}
            </button>
          </div>
        </div>
      );
    }

    // View mode
    return (
      <div key={topic.id} className="interest-item">
        <div className="interest-header">
          <span className="interest-label">
            {topic.label}
            {isWeighted && (
              <span className="priority-badge-small">★ 2x</span>
            )}
          </span>
        </div>
        <span
          className="interest-score"
          style={{ color: getScoreColor(answer.score) }}
        >
          {getScoreLabel(answer.score)}
        </span>
      </div>
    );
  };

  // Check if user has completed the questionnaire
  const hasQuestionnaireResults = userAnswers?.knoppen_input && Object.keys(userAnswers.knoppen_input).length > 0;

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1 className="page-hero-title hero-title-shadow">{t("profile_page_title")}</h1>
      </div>

      <div className="container profile-container">
        {formError && <div className="form-error">{formError}</div>}
        {successMessage && (
          <div className="profile-form-success">{successMessage}</div>
        )}

        {/* Account Settings Box */}
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

        {/* Interests Section - Below Account Settings */}
        <div className="about-content-box profile-content-box interests-editor-section">
          <h3 className="interests-main-title">{t("Jouw Interesses")}</h3>

          {interestsError && <div className="form-error">{interestsError}</div>}
          {interestsSuccess && <div className="profile-form-success">{interestsSuccess}</div>}

          {!hasQuestionnaireResults ? (
            <div className="no-questionnaire-message">
              <p>{t("Je hebt de vragenlijst nog niet ingevuld.")}</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/vragenlijst')}
              >
                {t("Vragenlijst invullen")}
              </button>
            </div>
          ) : (
            <>
              {/* Interest Topics Only */}
              <div className="interests-grid">
                {interestTopics.map(topic => renderTopicItem(topic, isEditingInterests && editedAnswers ? editedAnswers : userAnswers!))}
              </div>

              {/* Action Buttons */}
              <div className="interests-actions">
                {isEditingInterests ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={savingInterests}
                    >
                      {t("Annuleren")}
                    </button>
                    <button
                      type="button"
                      className={`btn btn-primary ${savingInterests ? 'btn-disabled' : ''}`}
                      onClick={handleSaveInterests}
                      disabled={savingInterests}
                    >
                      {savingInterests ? t("Opslaan...") : t("Wijzigingen opslaan")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsEditingInterests(true)}
                  >
                    {t("Interesses aanpassen")}
                  </button>
                )}
              </div>
            </>
          )}
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
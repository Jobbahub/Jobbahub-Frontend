import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, apiService } from "../services/apiService";
import type { VragenlijstData, ChangeCredentialsPayload } from "../types/questionnaire";
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

  // Group topics by type
  const interestTopics = translatedTopics.filter(topic => topic.type === 'interest');
  const valueTopics = translatedTopics.filter(topic => topic.type === 'value');
  const goalTopics = translatedTopics.filter(topic => topic.type === 'goal');

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
      const payload: ChangeCredentialsPayload = { currentPassword };
      if (userName !== user?.name) payload.newNaam = userName;
      if (newPassword) payload.newPassword = newPassword;

      const response = await apiService.changeCredentials(payload);

      updateUser(response.user);

      setSuccessMessage(t("profile_update_success"));
      setNewPassword("");
      setCurrentPassword("");
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("profile_update_failed");
      setFormError(errorMessage);
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
      } catch (e: unknown) {
        const errorCode = e instanceof ApiError ? e.status : "RESET_ERROR";
        navigate("/error", {
          state: {
            title: t("reset_failed_msg"),
            message: t("reset_failed_msg"),
            code: errorCode,
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



  const handleSaveInterests = async () => {
    if (!editedAnswers || !user || !questionnaireResults) return;

    setSavingInterests(true);
    setInterestsError(null);
    setInterestsSuccess(null);

    try {
      // 1. Fetch new recommendations based on updated answers
      const aiResponse = await apiService.verstuurVragenlijst(editedAnswers);

      // 2. Prepare data to save (answers + NEW recommendations)
      const dataToSave = {
        antwoorden: editedAnswers,
        aanbevelingen: aiResponse.aanbevelingen || [],
        cluster_suggesties: aiResponse.cluster_suggesties || []
      };

      // 3. Save everything to backend
      const updatedStudent = await apiService.saveQuestionnaireResults(dataToSave);

      updateUser({
        ...user,
        vragenlijst_resultaten: updatedStudent.vragenlijst_resultaten
      });

      setInterestsSuccess(t("interests_saved_success"));
      setIsEditingInterests(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("interests_save_error");
      setInterestsError(errorMessage);
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



  const getScoreClassName = (score: number) => {
    switch (score) {
      case -1: return "chart-score-badge chart-score-negative";
      case 0: return "chart-score-badge chart-score-neutral";
      case 1: return "chart-score-badge chart-score-positive";
      default: return "";
    }
  };

  // Render a topic item (either view or edit mode)
  const renderTopicItem = (topic: typeof translatedTopics[0], answers: VragenlijstData) => {
    const answer = answers.knoppen_input?.[topic.id];
    if (!answer) return null;

    if (isEditingInterests && editedAnswers) {
      const editedAnswer = editedAnswers.knoppen_input?.[topic.id];

      return (
        <div key={topic.id} className="interest-item interest-item-edit">
          <div className="interest-header">
            <span className="interest-label">
              {topic.label}
            </span>
          </div>
          <div className="interest-score-buttons">
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice btn-small ${editedAnswer?.score === -1 ? 'active-negative' : ''}`}
              onClick={() => handleScoreChange(topic.id, -1)}
            >
              {t("Nee")}
            </button>
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice btn-small ${editedAnswer?.score === 0 ? 'active-neutral' : ''}`}
              onClick={() => handleScoreChange(topic.id, 0)}
            >
              {t("Neutraal")}
            </button>
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice btn-small ${editedAnswer?.score === 1 ? 'active-positive' : ''}`}
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
          </span>
        </div>
        <span
          className={getScoreClassName(answer.score)}
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
              {/* Interest Topics */}
              <div className="interests-grid">
                {interestTopics.map(topic => renderTopicItem(topic, isEditingInterests && editedAnswers ? editedAnswers : userAnswers!))}
              </div>

              {/* Values Section */}
              <h3 className="interests-main-title mt-8">{t("Jouw Waarden")}</h3>
              <div className="interests-grid">
                {valueTopics.map(topic => renderTopicItem(topic, isEditingInterests && editedAnswers ? editedAnswers : userAnswers!))}
              </div>

              {/* Goals Section */}
              <h3 className="interests-main-title mt-8">{t("Jouw Doelen")}</h3>
              <div className="interests-grid">
                {goalTopics.map(topic => renderTopicItem(topic, isEditingInterests && editedAnswers ? editedAnswers : userAnswers!))}
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
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      className={`btn btn-primary ${savingInterests ? 'btn-disabled' : ''}`}
                      onClick={handleSaveInterests}
                      disabled={savingInterests}
                    >
                      {savingInterests ? t("saving") : t("save_changes")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsEditingInterests(true)}
                  >
                    {t("edit_interests")}
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

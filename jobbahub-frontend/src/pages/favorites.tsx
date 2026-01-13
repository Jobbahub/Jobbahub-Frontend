import React, { useEffect, useState, useCallback } from 'react';
import { IChoiceModule } from '../types';
import { apiService, ApiError } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/LanguageContext';
import RecentlyViewed from '../components/RecentlyViewed';

const Favorites: React.FC = () => {
    const [favoriteModules, setFavoriteModules] = useState<IChoiceModule[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const allModules = await apiService.getModules();
                const favIds = await apiService.getFavorites();
                setFavoriteIds(favIds);
                const filtered = allModules.filter(mod => favIds.includes(mod._id));
                setFavoriteModules(filtered);
            } catch (err: unknown) {
                console.error(err);
                const status = err instanceof ApiError ? err.status : "FAVORITES_LOAD_ERROR";
                navigate('/error', {
                    state: {
                        title: "Kon favorieten niet laden",
                        message: "Er ging iets mis bij het ophalen van je favorieten.",
                        code: status
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, t, navigate]);

    const handleDetailsClick = useCallback((id: string) => {
        navigate(`/modules/${id}`);
    }, [navigate]);

    const handleToggleFavorite = async (moduleId: string) => {
        try {
            await apiService.removeFavorite(moduleId);
            setFavoriteIds(prev => prev.filter(id => id !== moduleId));
            setFavoriteModules(prev => prev.filter(mod => mod._id !== moduleId));
        } catch (err: unknown) {
            console.error("Fout bij verwijderen favoriet:", err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="page-wrapper">
                <div className="page-hero">
                    <h1 className="page-hero-title hero-title-shadow">{t("Mijn Favorieten")}</h1>
                </div>
                <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>{t("Je moet ingelogd zijn om favorieten te bekijken.")}</p>
                </div>

                {/* Recently Viewed Section */}
                <RecentlyViewed />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* Hero Section */}
            <div className="page-hero">
                <h1 className="page-hero-title hero-title-shadow">{t("Mijn Favorieten")}</h1>
            </div>

            <div className="container" style={{ marginTop: '40px' }}>
                <p className="page-intro">
                    {t("Hier vind je een overzicht van de modules die jij hebt bewaard.")}
                </p>
            </div>

            <ModuleGrid
                modules={favoriteModules}
                loading={loading}
                error={error}
                onViewDetails={handleDetailsClick}
                favorites={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                isAuthenticated={isAuthenticated}
            />

            {/* Recently Viewed Section */}
            <RecentlyViewed />
        </div>
    );
};

export default Favorites;

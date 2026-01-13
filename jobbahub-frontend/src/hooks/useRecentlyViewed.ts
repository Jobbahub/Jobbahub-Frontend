import { useState, useCallback } from 'react';

const STORAGE_KEY = 'recentlyViewedModules';
const MAX_RECENT_MODULES = 5;

interface RecentlyViewedItem {
  moduleId: string;
  viewedAt: number;
}

// ✅ FIX: Helper function to load from localStorage (used for lazy init)
const loadFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: RecentlyViewedItem[] = JSON.parse(stored);
      return parsed
        .sort((a, b) => b.viewedAt - a.viewedAt)
        .map(item => item.moduleId);
    }
  } catch (error) {
    console.error('Error loading recently viewed modules:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
  return [];
};

export const useRecentlyViewed = () => {
  // ✅ FIX: Use lazy initialization instead of useEffect + setState
  // This runs only once during initial render, avoiding cascading renders
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(loadFromStorage);

  // Add a module to recently viewed
  const addRecentlyViewed = useCallback((moduleId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists (to move it to the front)
      items = items.filter(item => item.moduleId !== moduleId);

      // Add new item at the beginning
      items.unshift({
        moduleId,
        viewedAt: Date.now()
      });

      // Keep only the most recent MAX_RECENT_MODULES
      items = items.slice(0, MAX_RECENT_MODULES);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      // Update state
      setRecentlyViewedIds(items.map(item => item.moduleId));
    } catch (error) {
      console.error('Error saving recently viewed module:', error);
    }
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewedIds([]);
  }, []);

  return {
    recentlyViewedIds,
    addRecentlyViewed,
    clearRecentlyViewed
  };
};

export default useRecentlyViewed;

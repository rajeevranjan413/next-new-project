'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface HomeData {
  title: string;
  description: string;
  featuredItems: Array<{
    id: string;
    name: string;
    description: string;
    image?: string;
  }>;
  loading: boolean;
  error: string | null;
}

interface HomeContextType {
  homeData: HomeData;
  updateHomeData: (data: Partial<HomeData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addFeaturedItem: (item: HomeData['featuredItems'][0]) => void;
  removeFeaturedItem: (id: string) => void;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [homeData, setHomeData] = useState<HomeData>({
    title: 'Welcome to Home',
    description: 'This is your home page',
    featuredItems: [],
    loading: false,
    error: null,
  });

  const updateHomeData = (data: Partial<HomeData>) => {
    setHomeData((prev) => ({ ...prev, ...data }));
  };

  const setLoading = (loading: boolean) => {
    setHomeData((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setHomeData((prev) => ({ ...prev, error }));
  };

  const addFeaturedItem = (item: HomeData['featuredItems'][0]) => {
    setHomeData((prev) => ({
      ...prev,
      featuredItems: [...prev.featuredItems, item],
    }));
  };

  const removeFeaturedItem = (id: string) => {
    setHomeData((prev) => ({
      ...prev,
      featuredItems: prev.featuredItems.filter((item) => item.id !== id),
    }));
  };

  const value: HomeContextType = {
    homeData,
    updateHomeData,
    setLoading,
    setError,
    addFeaturedItem,
    removeFeaturedItem,
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};

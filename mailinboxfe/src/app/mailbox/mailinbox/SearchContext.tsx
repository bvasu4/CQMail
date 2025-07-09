'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type SearchContextType = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showSidebar: boolean;
  setShowSidebar: (value: boolean | ((prev: boolean) => boolean)) => void;
};

const SearchContext = createContext<SearchContextType>({
  searchTerm: '',
  setSearchTerm: () => {},
  showSidebar: false,
  setShowSidebar: () => {},
});

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, showSidebar, setShowSidebar }}>
      {children}
    </SearchContext.Provider>
  );
}

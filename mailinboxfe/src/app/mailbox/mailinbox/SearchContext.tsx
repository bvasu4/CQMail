'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type SearchContextType = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

const SearchContext = createContext<SearchContextType>({
  searchTerm: '',
  setSearchTerm: () => {},
});

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
}

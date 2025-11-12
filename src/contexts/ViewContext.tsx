import { createContext, useContext, useState, ReactNode } from "react";

interface ViewContextType {
  showValues: boolean;
  toggleShowValues: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [showValues, setShowValues] = useState(true);

  const toggleShowValues = () => {
    setShowValues((prev) => !prev);
  };

  return (
    <ViewContext.Provider value={{ showValues, toggleShowValues }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}

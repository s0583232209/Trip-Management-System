import { createContext, useContext, useState, useRef } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const count = useRef(0);

  const show = () => {
    count.current += 1;
    setVisible(true);
  };

  const hide = () => {
    count.current = Math.max(0, count.current - 1);
    if (count.current === 0) setVisible(false);
  };

  return (
    <LoadingContext.Provider value={{ loading: visible, show, hide }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);

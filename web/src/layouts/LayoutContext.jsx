import { createContext, useContext } from "react";

export const LayoutContext = createContext({
  isSourceOpen: false,
  toggleSource: () => {},
  openSourceWithData: () => {},
  openAuthModal: () => {},
  authModalOpen: false
});

export const useLayout = () => {
  return useContext(LayoutContext);
};

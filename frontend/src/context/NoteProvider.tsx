import React, { createContext, ReactNode, useState } from "react";

export interface Flow {
  flowId: string;
  topic: string;
}

export interface User {
  id: string;
  username: string;
}

export interface NoteProviderPros {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  flowcharts: Flow[];
  setFlowcharts: React.Dispatch<React.SetStateAction<Flow[]>>;
  currentFlowId: string | null;
  setCurrentFlowId: React.Dispatch<React.SetStateAction<string | null>>;
  currentNoteId: string | null;
  setCurrentNoteId: React.Dispatch<React.SetStateAction<string | null>>;
}

const defaultValues: NoteProviderPros = {
  user: null,
  setUser: () => {},
  flowcharts: [],
  setFlowcharts: () => {},
  currentFlowId: null,
  setCurrentFlowId: () => {},
  currentNoteId: null,
  setCurrentNoteId: () => {},
};

export const NoteContext = createContext<NoteProviderPros>(defaultValues);

const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [flowcharts, setFlowcharts] = useState<Flow[]>([]);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  const contextValues: NoteProviderPros = {
    user,
    setUser,
    flowcharts,
    setFlowcharts,
    currentFlowId,
    setCurrentFlowId,
    currentNoteId,
    setCurrentNoteId,
  };

  return (
    <NoteContext.Provider value={contextValues}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteProvider;

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface StoredPassword {
  _id: string;
  website: string;
  username: string;
  password: string;
  createdAt?: string;
}

interface PasswordsContextType {
  editPassword: StoredPassword | null;
  isPasswordEditMode: boolean;
  hiddenId: string | null;
  startEditPassword: (item: StoredPassword) => void;
  cancelEditPassword: () => void;
  finishEditPassword: () => void;
}

const PasswordsContext = createContext<PasswordsContextType | null>(null);

export function PasswordsProvider({ children }: { children: ReactNode }) {
  const [editPassword, setEditPassword] = useState<StoredPassword | null>(null);
  const [isPasswordEditMode, setIsPasswordEditMode] = useState<boolean>(false);
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  const startEditPassword = (item: StoredPassword) => {
    setEditPassword(item);
    setIsPasswordEditMode(true);
    setHiddenId(item._id);
  };

  const cancelEditPassword = () => {
    setEditPassword(null);
    setIsPasswordEditMode(false);
    setHiddenId(null);
  };

  const finishEditPassword = () => {
    setEditPassword(null);
    setIsPasswordEditMode(false);
    setHiddenId(null);
  };

  return (
    <PasswordsContext.Provider
      value={{ editPassword, isPasswordEditMode, hiddenId, startEditPassword, cancelEditPassword, finishEditPassword }}
    >
      {children}
    </PasswordsContext.Provider>
  );
}

export function usePasswords() {
  const context = useContext(PasswordsContext);
  if (!context) throw new Error("usePasswords must be used within PasswordsProvider");
  return context;
}

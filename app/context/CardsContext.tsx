"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface StoredCard {
    _id: string;
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv?: string;
    createdAt?: string;
}

interface CardsContextType {
    editCard: StoredCard | null;
    isCardEditMode: boolean;
    hiddenId: string | null;
    startEditCard: (item: StoredCard) => void;
    cancelEditCard: () => void;
    finishEditCard: () => void;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export function CardsProvider({ children }: { children: ReactNode }) {
    const [editCard, setEditCard] = useState<StoredCard | null>(null);
    const [isCardEditMode, setIsCardEditMode] = useState(false);
    const [hiddenId, setHiddenId] = useState<string | null>(null);

    const startEditCard = (item: StoredCard) => {
        setEditCard(item);
        setIsCardEditMode(true);
        setHiddenId(item._id);
    };

    const cancelEditCard = () => {
        setEditCard(null);
        setIsCardEditMode(false);
        setHiddenId(null);
    };

    const finishEditCard = () => {
        setEditCard(null);
        setIsCardEditMode(false);
        setHiddenId(null);
    };

    return (
        <CardsContext.Provider
            value={{
                editCard,
                isCardEditMode,
                hiddenId,
                startEditCard,
                cancelEditCard,
                finishEditCard,
            }}
        >
            {children}
        </CardsContext.Provider>
    );
}

export const useCards = () => {
    const ctx = useContext(CardsContext);
    if (!ctx) throw new Error("useCards must be used within CardsProvider");
    return ctx;
};

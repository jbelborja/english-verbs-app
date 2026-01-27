import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface QuizResult {
    id: string;
    date: Date;
    score: number;
    total: number;
    mode: 'typed' | 'choice' | 'drag';
}

interface SessionContextType {
    history: QuizResult[];
    addResult: (result: Omit<QuizResult, 'id' | 'date'>) => void;
    clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [history, setHistory] = useState<QuizResult[]>([]);

    const addResult = (result: Omit<QuizResult, 'id' | 'date'>) => {
        const newResult: QuizResult = {
            ...result,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date(),
        };
        setHistory((prev) => [newResult, ...prev]);
    };

    const clearSession = () => {
        setHistory([]);
    };

    return (
        <SessionContext.Provider value={{ history, addResult, clearSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

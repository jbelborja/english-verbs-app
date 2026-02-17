import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';

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
    loadingHistory: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<QuizResult[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Load history when user changes
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const loadHistory = async () => {
            if (user) {
                setLoadingHistory(true);

                // Failsafe: stop loading after 8 seconds no matter what
                timeoutId = setTimeout(() => {
                    setLoadingHistory(current => {
                        if (current) {
                            console.warn('SessionContext: History loading timed out (8s)');
                        }
                        return false;
                    });
                }, 8000);

                try {
                    const onlineHistory = await userService.getQuizHistory(user.uid);
                    setHistory(onlineHistory);
                } catch (error) {
                    console.error('Failed to load history:', error);
                } finally {
                    setLoadingHistory(false);
                    clearTimeout(timeoutId);
                }
            } else {
                setHistory([]);
            }
        };

        loadHistory();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user]);

    const addResult = async (result: Omit<QuizResult, 'id' | 'date'>) => {
        const newResult: QuizResult = {
            ...result,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date(),
        };

        // Update local state immediately
        setHistory((prev) => [newResult, ...prev]);

        // Save to Firebase if user is logged in
        if (user) {
            try {
                await userService.saveQuizResult(user.uid, result);
            } catch (error) {
                console.error('Failed to save result to Firebase:', error);
            }
        }
    };

    const clearSession = () => {
        setHistory([]);
    };

    return (
        <SessionContext.Provider value={{ history, addResult, clearSession, loadingHistory }}>
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

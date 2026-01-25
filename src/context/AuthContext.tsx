import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInAnonymously as firebaseSignInAnonymously,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
    AuthCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInAnonymously: () => Promise<void>;
    signInWithGoogleCredential: (credential: AuthCredential) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInAnonymously = async () => {
        try {
            await firebaseSignInAnonymously(auth);
        } catch (error) {
            console.error('Anonymous sign in failed', error);
            throw error;
        }
    };

    const signInWithGoogleCredential = async (credential: AuthCredential) => {
        try {
            await signInWithCredential(auth, credential);
        } catch (error) {
            console.error('Google sign in failed', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInAnonymously, signInWithGoogleCredential, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

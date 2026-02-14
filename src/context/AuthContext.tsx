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
        console.log("AuthContext: Setting up onAuthStateChanged listener");
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("AuthContext: onAuthStateChanged triggered", user ? "User found" : "No user");
            setUser(user);
            setLoading(false);
        });

        // Force stop loading after 5 seconds if firebase doesn't respond to prevent infinite spinner
        const timeoutId = setTimeout(() => {
            setLoading((currentLoading) => {
                if (currentLoading) {
                    console.warn("AuthContext: Loading timed out (5s), forcing loading to false");
                    return false;
                }
                return currentLoading;
            });
        }, 5000);

        return () => {
            clearTimeout(timeoutId);
            unsubscribe();
        };
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

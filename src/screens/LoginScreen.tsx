import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider } from 'firebase/auth';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

import { theme } from '../styles/theme';

export default function LoginScreen() {
    const { signInAnonymously, signInWithGoogleCredential, loading } = useAuth();

    const redirectUri = makeRedirectUri({
        scheme: 'englishverbsapp',
        preferLocalhost: true,
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '364645965860-j2m30laq1notojgupjhqmuchq60q5n3p.apps.googleusercontent.com',
        webClientId: '364645965860-sjietr9u3dcdvt8ieecekga0jp7ul37g.apps.googleusercontent.com',
        redirectUri,
        responseType: 'id_token',
    });

    useEffect(() => {
        const handleResponse = async () => {
            if (response) {
                console.log('Google Auth Response:', response);
            }
            if (response?.type === 'success') {
                try {
                    const { id_token, access_token } = response.params;
                    const credential = GoogleAuthProvider.credential(id_token, access_token);
                    await signInWithGoogleCredential(credential);
                } catch (error: any) {
                    console.error('Error processing Google sign in:', error);
                    alert(`Error al procesar el inicio con Google: ${error.message}`);
                }
            } else if (response?.type === 'error') {
                console.error('Google Auth Error:', response.error);
                console.error('Response Details:', response);
                alert(`Error de autenticación con Google: ${response.error?.message || 'Error desconocido'}`);
            }
        };
        handleResponse();
    }, [response]);

    const handleAnonymousSignIn = async () => {
        try {
            await signInAnonymously();
        } catch (error: any) {
            alert(`Error de inicio anónimo: ${error.message}`);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await promptAsync();
        } catch (error: any) {
            alert(`Error de inicio con Google: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>📚</Text>
                    </View>
                    <Text style={styles.title}>Verbos en Inglés</Text>
                    <Text style={styles.subtitle}>Domina los verbos irregulares de forma divertida</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.googleButton]}
                        onPress={handleGoogleSignIn}
                        disabled={!request}
                    >
                        <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.anonymousButton]}
                        onPress={handleAnonymousSignIn}
                    >
                        <Text style={styles.anonymousButtonText}>Continuar Anónimamente</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Aprende inglés paso a paso</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: theme.roundness.xl,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
        marginBottom: 20,
    },
    logoEmoji: {
        fontSize: 40,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        gap: theme.spacing.md,
    },
    button: {
        paddingVertical: 16,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
    },
    googleButton: {
        backgroundColor: theme.colors.primary,
    },
    anonymousButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    anonymousButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
    },
});

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

import { theme } from '../styles/theme';

export default function LoginScreen() {
  const { signInAnonymously, signInWithGoogleCredential, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // Check if running in Tauri
      const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;

      if (isTauri) {
        const { start } = await import('@fabianlars/tauri-plugin-oauth');
        const { open } = await import('@tauri-apps/plugin-shell');

        // Start local server to receive the code/token
        const port = await start(async (url: string) => {
          console.log('Received OAuth redirect:', url);
          try {
            // Extract the access_token from the fragment (#)
            const hash = url.split('#')[1];
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const idToken = params.get('id_token');

            if (accessToken || idToken) {
              const credential = GoogleAuthProvider.credential(idToken, accessToken);
              await signInWithGoogleCredential(credential);
            }
          } catch (e) {
            console.error('Failed to handle OAuth redirect', e);
          }
        });

        const clientId = "364645965860-sjietr9u3dcdvt8ieecekga0jp7ul37g.apps.googleusercontent.com";
        const redirectUri = `http://localhost:${port}`;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid`;

        await open(authUrl);
        return;
      }

      // Web flow (Standard Firebase popup)
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error with Google sign in:', error);
      alert(`Error al iniciar con Google: ${error.message}`);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously();
    } catch (error: any) {
      alert(`Error de inicio anónimo: ${error.message}`);
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

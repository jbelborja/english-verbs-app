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
        const { open } = await import('@tauri-apps/plugin-shell');
        // Use Android client ID for mobile, web client ID for desktop
        const webClientId = "364645965860-sjietr9u3dcdvt8ieecekga0jp7ul37g.apps.googleusercontent.com";
        const iosClientId = "364645965860-nqbdumepglaguhhr437tqas70aqb6ck0.apps.googleusercontent.com";
        const isMobile = window.navigator.userAgent.includes('Android') || window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad');
        const clientId = isMobile ? iosClientId : webClientId;
        console.log("Login Environment - isTauri:", isTauri, "isMobile:", isMobile, "UserAgent:", window.navigator.userAgent, "ClientID:", clientId);

        if (isMobile) {
          const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
          const { openUrl } = await import('@tauri-apps/plugin-opener');

          // Using iOS Client ID for mobile to support implicit flow on Android/iOS
          const redirectUri = "com.googleusercontent.apps.364645965860-nqbdumepglaguhhr437tqas70aqb6ck0:/oauth2redirect";
          // Use response_type=token for better compatibility with native clients
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid`;

          console.log('--- MOBILE OAUTH DEBUG ---');
          console.log('Client ID:', clientId);
          console.log('Redirect URI:', redirectUri);
          console.log('Auth URL:', authUrl);
          console.log('--------------------------');

          await onOpenUrl(async (urls) => {
            console.log('Received deep link urls:', urls);
            const url = urls[0];
            if (url && (url.includes('access_token') || url.includes('id_token'))) {
              try {
                // Determine if parameters are in the hash (#) or search (?)
                const delimiter = url.includes('#') ? '#' : '?';
                const hashOrSearch = url.split(delimiter)[1];
                const params = new URLSearchParams(hashOrSearch);
                const accessToken = params.get('access_token');
                const idToken = params.get('id_token');

                if (accessToken || idToken) {
                  const credential = GoogleAuthProvider.credential(idToken, accessToken);
                  await signInWithGoogleCredential(credential);
                }
              } catch (e) {
                console.error('Failed to handle OAuth redirect', e);
              }
            }
          });

          console.log('Opening Google Auth URL via opener.openUrl:', authUrl);
          try {
            await openUrl(authUrl);
          } catch (err) {
            console.error('Failed to open URL:', err);
            // Fallback for debugging if shell still fails
            alert('Error opening browser: ' + JSON.stringify(err));
          }
          return;
        }

        // Desktop Desktop / Generic Tauri Desktop fallback (OAuth plugin)
        const { start, onUrl } = await import('@fabianlars/tauri-plugin-oauth');
        const { openUrl } = await import('@tauri-apps/plugin-opener');

        // Register listener before starting the server
        const unlisten = await onUrl(async (url: string) => {
          console.log('Received OAuth redirect:', url);
          try {
            const hash = url.split('#')[1];
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const idToken = params.get('id_token');

            if (accessToken || idToken) {
              const credential = GoogleAuthProvider.credential(idToken, accessToken);
              await signInWithGoogleCredential(credential);
            }
            // Optional: unlisten() if you only want one-time behavior
            // unlisten();
          } catch (e) {
            console.error('Failed to handle OAuth redirect', e);
          }
        });

        let port;
        try {
          port = await start({
            ports: [14200, 14201, 14202] // Try a few ports
          });
          console.log('OAuth server started on port:', port);
        } catch (e) {
          console.error('Failed to start OAuth server:', e);
          alert('Failed to start local server for login. Please check logs.');
          return;
        }

        const redirectUri = `http://localhost:${port}`;
        console.log('--- OAuth Debug ---');
        console.log('Redirect URI:', redirectUri);
        console.log('Client ID:', clientId);
        console.log('-------------------');

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid`;

        console.log('Opening Auth URL:', authUrl);
        await openUrl(authUrl);
        return;
      }

      // Web flow (Standard Firebase popup)
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error with Google sign in:', error);
      const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : JSON.stringify(error));
      alert(`Error al iniciar con Google: ${errorMessage}`);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously();
    } catch (error: any) {
      console.error('Anonymous sign in failed', error);
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

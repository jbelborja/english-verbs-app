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
        const isMobile = window.navigator.userAgent.includes('Android') || window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad');

        if (isMobile) {
          const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
          const { openUrl } = await import('@tauri-apps/plugin-opener');

          // Android Client ID from Google Cloud Console
          const clientId = "364645965860-j2m30laq1notojgupjhqmuchq60q5n3p.apps.googleusercontent.com";
          const redirectUri = `com.googleusercontent.apps.364645965860-j2m30laq1notojgupjhqmuchq60q5n3p:/oauth2redirect`;

          // PKCE Helpers (Minimal Implementation for Browser Environments)
          const generateRandomString = (length: number) => {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
            let result = '';
            for (let i = 0; i < length; i++) {
              result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return result;
          };

          const sha256 = async (plain: string) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(plain);
            const hash = await window.crypto.subtle.digest('SHA-256', data);
            return hash;
          };

          const base64urlencode = (a: ArrayBuffer) => {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(a) as any))
              .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          };

          const codeVerifier = generateRandomString(64);
          const codeChallenge = base64urlencode(await sha256(codeVerifier));

          const state = generateRandomString(16);
          const scope = encodeURIComponent('email profile openid');
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

          console.log('--- MOBILE OAUTH DEBUG (CODE FLOW + PKCE) ---');
          console.log('Client ID:', clientId);
          console.log('Redirect URI:', redirectUri);
          console.log('Auth URL:', authUrl);

          await onOpenUrl(async (urls) => {
            console.log('Received deep link urls:', urls);
            const url = urls[0];
            if (url && url.includes('code=')) {
              try {
                const params = new URLSearchParams(url.split('?')[1] || url.split('#')[1] || '');
                const code = params.get('code');
                const returnedState = params.get('state');

                if (code && returnedState === state) {
                  // Exchange code for tokens
                  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                      client_id: clientId,
                      code: code,
                      code_verifier: codeVerifier,
                      grant_type: 'authorization_code',
                      redirect_uri: redirectUri,
                    }).toString(),
                  });

                  const tokens = await tokenResponse.json();
                  if (tokens.id_token) {
                    const credential = GoogleAuthProvider.credential(tokens.id_token, tokens.access_token);
                    await signInWithGoogleCredential(credential);
                  } else {
                    console.error('Failed to get tokens:', tokens);
                  }
                }
              } catch (e) {
                console.error('Failed to handle OAuth redirect', e);
              }
            }
          });

          await openUrl(authUrl);
          return;
        }

        // Desktop Flow (Existing but cleaned up)
        const { start, onUrl } = await import('@fabianlars/tauri-plugin-oauth');
        const { openUrl } = await import('@tauri-apps/plugin-opener');

        const clientId = "364645965860-sjietr9u3dcdvt8ieecekga0jp7ul37g.apps.googleusercontent.com"; // Web Client ID for Desktop

        const unlisten = await onUrl(async (url: string) => {
          try {
            const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
            const accessToken = params.get('access_token');
            const idToken = params.get('id_token');

            if (accessToken || idToken) {
              const credential = GoogleAuthProvider.credential(idToken, accessToken);
              await signInWithGoogleCredential(credential);
            }
            unlisten();
          } catch (e) {
            console.error('Failed to handle OAuth redirect', e);
          }
        });

        const port = await start({ ports: [14200, 14201, 14202] });
        const redirectUri = `http://localhost:${port}`;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid`;

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

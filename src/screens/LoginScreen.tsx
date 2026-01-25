import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider } from 'firebase/auth';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const { signInAnonymously, signInWithGoogleCredential, loading } = useAuth();

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '364645965860-sjietr9u3dcdvt8ieecekga0jp7ul37g.apps.googleusercontent.com',
        // For iOS, you'll need to add an iOS app in Firebase Console and get the iOS client ID
        // iosClientId: 'YOUR_IOS_CLIENT_ID',
        webClientId: '364645965860-sjietr9u3dcdvt8ieecekga0jp7ul37g.apps.googleusercontent.com',
        redirectUri: makeRedirectUri({
            scheme: 'englishverbsapp'
        })
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithGoogleCredential(credential);
        }
    }, [response]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quiz de Verbos en Inglés</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.googleButton]}
                    onPress={() => promptAsync()}
                    disabled={!request}
                >
                    <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.anonymousButton]}
                    onPress={() => signInAnonymously()}
                >
                    <Text style={styles.buttonText}>Continuar Anónimamente</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 50,
        color: '#333',
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    googleButton: {
        backgroundColor: '#4285F4',
    },
    anonymousButton: {
        backgroundColor: '#757575',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

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

    // TODO: Add your Google Client IDs here
    // Check documentation or implementation plan regarding where to get these
    const [request, response, promptAsync] = Google.useAuthRequest({
        // iosClientId: 'YOUR_IOS_CLIENT_ID',
        // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        // webClientId: 'YOUR_WEB_CLIENT_ID',
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
            <Text style={styles.title}>English Verbs Quiz</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.googleButton]}
                    onPress={() => promptAsync()}
                    disabled={!request}
                >
                    <Text style={styles.buttonText}>Sign in with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.anonymousButton]}
                    onPress={() => signInAnonymously()}
                >
                    <Text style={styles.buttonText}>Continue Anonymously</Text>
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

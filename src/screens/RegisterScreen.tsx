import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await signUp(email, password);
            // Auth state listener in App.tsx will redirect to Main
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Correo electrónico no válido.');
            } else {
                setError('Error al registrarse: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>¡Únete a la aventura!</Text>
                    <Text style={styles.subtitle}>Crea una cuenta para guardar todo lo que aprendes.</Text>
                </View>

                <View style={styles.form}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirmar Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Registrarse</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    scrollContent: tw`min-h-full justify-center px-4 py-6`,
    header: tw`mb-6 items-center rounded-3xl bg-[#e7f1ff] px-5 py-6`,
    title: tw`mb-2 text-center text-[28px] font-black text-[#172554]`,
    subtitle: tw`text-center text-base leading-6 text-[#52617f]`,
    form: tw`rounded-3xl border border-[#e7ecf6] bg-white p-5 shadow-sm`,
    errorText: tw`mb-4 text-center font-semibold text-[#ef4444]`,
    inputContainer: tw`mb-4`,
    label: tw`mb-1 text-sm font-bold text-[#4b5563]`,
    input: tw`min-h-[52px] rounded-xl border border-[#dce4f2] bg-[#fbfcff] px-4 py-3 text-base text-[#172554]`,
    button: tw`mt-2 min-h-[56px] items-center justify-center rounded-2xl bg-[#19a879] p-4 shadow-sm`,
    buttonDisabled: tw`opacity-70`,
    buttonText: tw`text-lg font-black text-white`,
    linkButton: tw`mt-5 items-center py-2`,
    linkText: tw`font-bold text-[#4f46e5]`,
};

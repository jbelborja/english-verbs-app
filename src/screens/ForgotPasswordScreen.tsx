import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
    const { sendPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor, ingresa tu correo electrónico.');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordReset(email);
            Alert.alert(
                'Correo Enviado',
                'Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (err: any) {
            console.error(err);
            Alert.alert('Error', 'No se pudo enviar el correo: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
                <Text style={styles.subtitle}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para recuperarla.
                </Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="tu@correo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Enviar Enlace</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>Volver al inicio de sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = {
    container: tw`flex-1 justify-center bg-[#f5f8ff] p-5`,
    content: [tw`w-full self-center items-center`, { maxWidth: 480 }],
    title: tw`mb-3 text-center text-2xl font-black text-[#172554]`,
    subtitle: tw`mb-6 text-center text-base leading-6 text-[#52617f]`,
    form: tw`w-full rounded-3xl border border-[#e7ecf6] bg-white p-5 shadow-sm`,
    input: tw`mb-5 min-h-[52px] rounded-xl border border-[#dce4f2] bg-[#fbfcff] px-4 py-3 text-base text-[#172554]`,
    button: tw`min-h-[56px] items-center justify-center rounded-2xl bg-[#19a879] p-4 shadow-sm`,
    buttonDisabled: tw`opacity-70`,
    buttonText: tw`text-lg font-black text-white`,
    linkButton: tw`mt-5 items-center py-2`,
    linkText: tw`font-bold text-[#4f46e5]`,
};

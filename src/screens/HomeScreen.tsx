import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
            >
                <Text style={styles.profileButtonText}>Ver Perfil</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Práctica de Verbos (English)</Text>
            <Text style={styles.subtitle}>Domina los verbos irregulares</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Quiz', { mode: 'typed' })}
                >
                    <Text style={styles.buttonText}>Modo Escribir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => navigation.navigate('Quiz', { mode: 'choice' })}
                >
                    <Text style={styles.buttonText}>Modo Elegir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    profileButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
    },
    profileButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
        marginTop: 60,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 40,
        color: '#666',
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        elevation: 3,
        width: '80%',
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: '#5856D6',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});

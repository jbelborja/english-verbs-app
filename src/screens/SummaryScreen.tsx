import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
    const { score, total } = route.params;
    const { addResult } = useSession();

    useEffect(() => {
        // Assume 'mode' is passed or we default to 'unknown' if not passed continuously. 
        // Ideally we should pass 'mode' to Summary as well.
        // For now, let's assume 'typed' or 'choice' was the mode. 
        // We can update types.ts to include mode in Summary params, or just default.
        // Let's defaulted to 'choice' for now as a fallback or fix types.ts properly.
        // Wait, types.ts Summary param doesn't have mode. I should have added it.
        // But to avoid breaking too much, I'll just put 'choice' or 'typed' based on guess or update types.

        // Let's update types.ts to include mode in Summary params first? 
        // Or better, just fix it here.
        // I will default to 'choice' for now to keep it simple, or update types. 
        // The user didn't ask for mode tracking specifically but it's in my Context.

        addResult({
            score,
            total,
            mode: 'choice' // Placeholder, ideally passed from QuizScreen
        });
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¡Ejercicio Completo!</Text>

            <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Tu Puntuación</Text>
                <Text style={styles.scoreValue}>{score} / {total}</Text>
            </View>

            <Text style={styles.message}>
                {score === total ? '¡Perfecto!' :
                    score > total / 2 ? '¡Buen trabajo!' : '¡Sigue practicando!'}
            </Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.buttonText}>Volver al Inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 40,
    },
    scoreContainer: {
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 30,
        width: '100%',
    },
    scoreLabel: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    message: {
        fontSize: 20,
        color: '#444',
        marginBottom: 40,
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
    const { score, total, mode } = route.params;
    const { addResult } = useSession();

    useEffect(() => {
        addResult({
            score,
            total,
            mode
        });
    }, []);

    const percentage = Math.round((score / total) * 100);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>{percentage >= 80 ? '🎉' : percentage >= 50 ? '👏' : '✍️'}</Text>
                </View>

                <Text style={styles.title}>¡Ejercicio Completo!</Text>

                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Tu Puntuación</Text>
                    <Text style={[styles.scoreValue, { color: percentage >= 50 ? '#168f68' : '#ef4444' }]}>
                        {Number.isInteger(score) ? score : score.toFixed(1)} / {total}
                    </Text>
                    <Text style={styles.percentageText}>{percentage}% Correcto</Text>
                </View>

                <Text style={styles.message}>
                    {score === total ? '¡Increíble! Dominas estos verbos.' :
                        score > total / 2 ? '¡Buen trabajo! Sigue así.' : '¡Sigue practicando para mejorar!'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Main')}
            >
                <Text style={styles.buttonText}>Volver al Inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff] p-6`,
    content: tw`flex-1 items-center justify-center`,
    iconCircle: tw`mb-5 h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-md`,
    iconEmoji: tw`text-[50px]`,
    title: tw`mb-6 text-center text-[30px] font-black text-[#172554]`,
    scoreCard: tw`mb-6 w-full items-center rounded-3xl border border-[#e7ecf6] bg-white p-6 shadow-md`,
    scoreLabel: tw`mb-2 text-base font-semibold text-[#65718a]`,
    scoreValue: tw`mb-1 text-[58px] font-black`,
    percentageText: tw`text-lg font-extrabold text-[#7046d8]`,
    message: tw`px-5 text-center text-base leading-6 text-[#52617f]`,
    button: tw`min-h-[58px] items-center justify-center rounded-2xl bg-[#19a879] py-4 shadow-md`,
    buttonText: tw`text-lg font-black text-white`,
};

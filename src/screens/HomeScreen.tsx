import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { theme } from '../styles/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Práctica de Verbos</Text>
                <Text style={styles.subtitle}>Selecciona un modo para comenzar a practicar</Text>
            </View>

            <View style={styles.cardContainer}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Quiz', { mode: 'typed' })}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                        <Text style={styles.cardIcon}>✍️</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Modo Escribir</Text>
                        <Text style={styles.cardDescription}>Escribe la forma correcta del verbo para practicar tu ortografía.</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Quiz', { mode: 'choice' })}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
                        <Text style={styles.cardIcon}>🎯</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Modo Elegir</Text>
                        <Text style={styles.cardDescription}>Selecciona la opción correcta de una lista de alternativas.</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Quiz', { mode: 'drag' })}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={styles.cardIcon}>🖱️</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Modo Arrastrar</Text>
                        <Text style={styles.cardDescription}>Ordena las formas correctas en sus respectivos lugares.</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoText}>💡 Tip: Practica 10 minutos al día para dominar todos los verbos.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
    },
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    cardContainer: {
        gap: theme.spacing.md,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.roundness.xl,
        padding: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: theme.roundness.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    cardIcon: {
        fontSize: 30,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: 2,
    },
    cardDescription: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    infoCard: {
        marginTop: 'auto',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.lg,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        ...theme.shadows.sm,
        marginBottom: theme.spacing.xl,
    },
    infoText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
});

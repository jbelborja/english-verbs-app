import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import tw from 'twrnc';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
};

const modes = [
    {
        mode: 'choice' as const,
        icon: '🎯',
        title: 'Elige la respuesta',
        description: 'Escoge la forma correcta entre varias opciones.',
        color: '#eee7ff',
    },
    {
        mode: 'typed' as const,
        icon: '✍️',
        title: 'Escribe la respuesta',
        description: 'Escribe las formas del verbo y demuestra lo que sabes.',
        color: '#dff8ef',
    },
    {
        mode: 'drag' as const,
        icon: '🧩',
        title: 'Ordena las palabras',
        description: 'Completa cada verbo colocando las palabras en su sitio.',
        color: '#fff2d6',
    },
];

export default function HomeScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const isWide = width >= 760;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.page}>
                <View style={[styles.hero, isWide && styles.heroWide]}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.eyebrow}>🌟 ¡Tu aventura empieza aquí!</Text>
                        <Text style={styles.title}>¡A jugar con los verbos!</Text>
                        <Text style={styles.subtitle}>
                            Aprende inglés paso a paso. Elige un reto y conviértete en una estrella de los verbos.
                        </Text>
                    </View>
                    <View style={styles.heroArt}>
                        <Text style={styles.heroEmoji}>🦸‍♀️</Text>
                        <Text style={styles.heroSparkle}>✨</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>¿Qué reto quieres probar?</Text>
                <View style={[styles.cardContainer, isWide && styles.cardContainerWide]}>
                    {modes.map((item) => (
                        <TouchableOpacity
                            key={item.mode}
                            accessibilityRole="button"
                            style={[styles.card, isWide && styles.cardWide]}
                            onPress={() => navigation.navigate('Quiz', { mode: item.mode })}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                                <Text style={styles.cardIcon}>{item.icon}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDescription}>{item.description}</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.tipCard}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <View style={styles.tipCopy}>
                        <Text style={styles.tipTitle}>Truco de superaprendiz</Text>
                        <Text style={styles.tipText}>¡Practica un poquito cada día y verás cuánto aprendes!</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    scrollContent: tw`px-4 pb-8 pt-5`,
    page: [tw`w-full self-center`, { maxWidth: 1050 }],
    hero: tw`mb-6 flex-row items-center justify-between overflow-hidden rounded-[28px] bg-[#e7f1ff] px-5 py-6`,
    heroWide: tw`px-8 py-8`,
    heroCopy: tw`flex-1`,
    eyebrow: tw`mb-2 text-sm font-bold text-[#315b9a]`,
    title: tw`mb-2 text-[30px] font-black text-[#172554]`,
    subtitle: tw`max-w-[620px] text-base leading-6 text-[#465779]`,
    heroArt: tw`ml-2 h-[92px] w-[92px] items-center justify-center rounded-full bg-[#d5e7ff]`,
    heroEmoji: tw`text-[54px]`,
    heroSparkle: [tw`absolute right-2 top-1 text-2xl`, { right: 4, top: 0 }],
    sectionTitle: tw`mb-4 text-xl font-black text-[#172554]`,
    cardContainer: tw`gap-3`,
    cardContainerWide: tw`flex-row flex-wrap`,
    card: tw`min-h-[118px] flex-row items-center rounded-3xl border border-[#e7ecf6] bg-white p-4 shadow-sm`,
    cardWide: { width: '32%' as const },
    iconContainer: tw`mr-4 h-[58px] w-[58px] items-center justify-center rounded-2xl`,
    cardIcon: tw`text-[32px]`,
    cardContent: tw`flex-1`,
    cardTitle: tw`mb-1 text-base font-extrabold text-[#172554]`,
    cardDescription: tw`text-sm leading-5 text-[#65718a]`,
    cardArrow: tw`ml-2 text-2xl font-bold text-[#7046d8]`,
    tipCard: tw`mt-6 flex-row items-start rounded-2xl bg-[#fff6da] p-4`,
    tipIcon: tw`mr-3 text-2xl`,
    tipCopy: tw`flex-1`,
    tipTitle: tw`mb-1 text-sm font-extrabold text-[#815c00]`,
    tipText: tw`text-sm leading-5 text-[#78653a]`,
};

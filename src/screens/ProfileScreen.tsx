import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSession, QuizResult } from '../context/SessionContext';
import tw from 'twrnc';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { history, loadingHistory } = useSession();

    if (loadingHistory) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f6df5" />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: QuizResult }) => {
        // Ensure item.date is a Date object
        const date = item.date instanceof Date ? item.date : new Date(item.date);

        return (
            <View style={styles.historyItem}>
                <View>
                    <Text style={styles.historyDate}>{date.toLocaleDateString()} - {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    <Text style={styles.historyMode}>
                        {item.mode === 'typed' ? 'Escritura' : item.mode === 'choice' ? 'Selección' : 'Arrastrar'}
                    </Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.historyScore}>
                        {item.score}/{item.total}
                    </Text>
                </View>
            </View>
        );
    };

    const userInitial = user?.email ? user.email[0].toUpperCase() : '?';

    return (
        <View style={styles.container}>
            <View style={styles.userHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
                <Text style={styles.emailText}>
                    {user?.isAnonymous ? 'Usuario Anónimo' : user?.email}
                </Text>
                <Text style={styles.statsLabel}>Has completado {history.length} sesiones</Text>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>Historial Completo</Text>

                {history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Todavía no has realizado ejercicios.</Text>
                        <Text style={styles.emptySubtext}>¡Comienza uno ahora desde la pantalla de inicio!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    userHeader: tw`items-center border-b border-[#e7ecf6] bg-white p-6 shadow-sm`,
    avatar: tw`mb-3 h-20 w-20 items-center justify-center rounded-full bg-[#7154d9]`,
    avatarText: tw`text-[32px] font-black text-white`,
    emailText: tw`mb-1 text-lg font-extrabold text-[#172554]`,
    statsLabel: tw`text-sm text-[#65718a]`,
    historySection: tw`flex-1 p-5`,
    sectionTitle: tw`mb-4 text-xl font-black text-[#172554]`,
    listContainer: tw`pb-8`,
    historyItem: tw`mb-3 flex-row items-center justify-between rounded-2xl border border-[#e7ecf6] bg-white p-4 shadow-sm`,
    historyDate: tw`mb-1 text-sm text-[#65718a]`,
    historyMode: tw`text-sm font-bold text-[#4f46e5]`,
    scoreBadge: tw`rounded-full bg-[#eef4ff] px-3 py-2`,
    historyScore: tw`text-sm font-black text-[#172554]`,
    emptyContainer: tw`mt-10 flex-1 items-center justify-center`,
    emptyText: tw`text-center text-base font-bold text-[#52617f]`,
    emptySubtext: tw`mt-1 text-center text-sm text-[#73809a]`,
    logoutButton: tw`mt-4 rounded-xl bg-[#fee2e2] px-4 py-2`,
    logoutText: tw`text-sm font-bold text-[#dc2626]`,
    loadingContainer: tw`flex-1 items-center justify-center bg-[#f5f8ff]`,
    loadingText: tw`mt-3 text-base text-[#65718a]`,
};

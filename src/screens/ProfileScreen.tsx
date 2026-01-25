import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSession, QuizResult } from '../context/SessionContext';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { history } = useSession();

    const renderItem = ({ item }: { item: QuizResult }) => (
        <View style={styles.historyItem}>
            <Text style={styles.historyDate}>{item.date.toLocaleTimeString()}</Text>
            <Text style={styles.historyScore}>
                {item.score} / {item.total} ({Math.round((item.score / item.total) * 100)}%)
            </Text>
            <Text style={styles.historyMode}>{item.mode.toUpperCase()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.email}>
                    {user?.isAnonymous ? 'Anonymous User' : user?.email}
                </Text>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Session History</Text>

            {history.length === 0 ? (
                <Text style={styles.emptyText}>No quizzes taken in this session.</Text>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    email: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    logoutButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: '#ff4444',
        borderRadius: 20,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    listContainer: {
        paddingBottom: 20,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        marginBottom: 10,
    },
    historyDate: {
        color: '#666',
        fontSize: 12,
    },
    historyScore: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    historyMode: {
        fontSize: 12,
        color: '#888',
        backgroundColor: '#eee',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
});

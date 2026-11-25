import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { QuizResult } from '../context/SessionContext';

export const userService = {
    /**
     * Saves a quiz result to the signed-in user's Firestore history.
     */
    async saveQuizResult(userId: string, result: Omit<QuizResult, 'id' | 'date'>) {
        try {
            await addDoc(collection(db, 'users', userId, 'results'), {
                ...result,
                date: Timestamp.now(),
            });
        } catch (error) {
            console.error('Error saving quiz result to Firestore:', error);
            throw error;
        }
    },

    /**
     * Fetches the latest quiz results for a user from Firestore.
     */
    async getQuizHistory(userId: string): Promise<QuizResult[]> {
        try {
            const resultsQuery = query(
                collection(db, 'users', userId, 'results'),
                orderBy('date', 'desc'),
                limit(50),
            );
            const snapshot = await getDocs(resultsQuery);

            return snapshot.docs.map((resultDoc) => {
                const data = resultDoc.data();
                return {
                    id: resultDoc.id,
                    score: data.score,
                    total: data.total,
                    mode: data.mode,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
                } as QuizResult;
            });
        } catch (error) {
            console.error('Error fetching quiz history from Firestore:', error);
            throw error;
        }
    }
};

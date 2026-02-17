import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { QuizResult } from '../context/SessionContext';

export const userService = {
    /**
     * Saves a quiz result to Firestore
     */
    async saveQuizResult(userId: string, result: Omit<QuizResult, 'id' | 'date'>) {
        try {
            const resultsRef = collection(db, 'users', userId, 'results');
            await addDoc(resultsRef, {
                ...result,
                date: Timestamp.now(),
            });
            console.log('Quiz result saved to Firestore');
        } catch (error) {
            console.error('Error saving quiz result to Firestore:', error);
            throw error;
        }
    },

    /**
     * Fetches the quiz history for a user
     */
    async getQuizHistory(userId: string): Promise<QuizResult[]> {
        try {
            const resultsRef = collection(db, 'users', userId, 'results');
            const q = query(resultsRef, orderBy('date', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    score: data.score,
                    total: data.total,
                    mode: data.mode,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
                } as QuizResult;
            });
        } catch (error) {
            console.error('Error fetching quiz history from Firestore:', error);
            return [];
        }
    }
};

import { supabase } from '../config/supabase';
import { QuizResult } from '../context/SessionContext';

export const userService = {
    /**
     * Saves a quiz result to Supabase
     */
    async saveQuizResult(userId: string, result: Omit<QuizResult, 'id' | 'date'>) {
        try {
            const { error } = await supabase
                .from('quiz_results')
                .insert({
                    user_id: userId,
                    score: result.score,
                    total: result.total,
                    mode: result.mode,
                    date: new Date().toISOString(),
                });

            if (error) throw error;
            console.log('Quiz result saved to Supabase');
        } catch (error) {
            console.error('Error saving quiz result to Supabase:', error);
            throw error;
        }
    },

    /**
     * Fetches the quiz history for a user from Supabase
     */
    async getQuizHistory(userId: string): Promise<QuizResult[]> {
        try {
            const { data, error } = await supabase
                .from('quiz_results')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .limit(50);

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                score: row.score,
                total: row.total,
                mode: row.mode,
                date: new Date(row.date),
            })) as QuizResult[];
        } catch (error) {
            console.error('Error fetching quiz history from Supabase:', error);
            return [];
        }
    }
};

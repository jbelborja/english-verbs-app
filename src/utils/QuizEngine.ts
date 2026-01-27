import { Verb, verbs } from '../data/verbs';
import { checkAnswerWithMisspelling } from './stringUtils';

export type QuestionField = 'infinitive' | 'pastSimple' | 'pastParticiple' | 'spanish';

export interface Question {
    verb: Verb;
    askField: QuestionField;
    answerField?: QuestionField; // For choice mode
    answerFields?: QuestionField[]; // For typed mode
    questionText: string;
    prompt: string;
}

const FIELD_LABELS: Record<QuestionField, string> = {
    infinitive: 'Infinitivo',
    pastSimple: 'Pasado Simple',
    pastParticiple: 'Pasado Participio',
    spanish: 'Significado',
};

export class QuizEngine {
    private usedIndices: Set<number> = new Set();

    // Get a random verb
    private getRandomVerb(): Verb {
        if (this.usedIndices.size === verbs.length) {
            this.usedIndices.clear(); // Reset if all used
        }

        let index;
        do {
            index = Math.floor(Math.random() * verbs.length);
        } while (this.usedIndices.has(index));

        this.usedIndices.add(index);
        return verbs[index];
    }

    // Generate a question (ask X, given Y)
    generateQuestion(mode: 'typed' | 'choice' | 'drag'): Question {
        const verb = this.getRandomVerb();
        const fields: QuestionField[] = ['infinitive', 'pastSimple', 'pastParticiple', 'spanish'];

        if (mode === 'choice') {
            // Force askField to be 'spanish'
            const askField: QuestionField = 'spanish';
            const englishFields: QuestionField[] = ['infinitive', 'pastSimple', 'pastParticiple'];
            const answerField = englishFields[Math.floor(Math.random() * englishFields.length)];

            return {
                verb,
                askField,
                answerField,
                questionText: `¿Cuál es el ${FIELD_LABELS[answerField]}?`,
                prompt: verb[askField], // Just the Spanish word
            };
        } else if (mode === 'drag') {
            // Drag mode: provide Spanish, ask for all 3 English forms (to be dragged)
            const askField: QuestionField = 'spanish';
            const answerFields: QuestionField[] = ['infinitive', 'pastSimple', 'pastParticiple'];

            return {
                verb,
                askField,
                answerFields,
                questionText: 'Ordena las formas correctas:',
                prompt: verb[askField],
            };
        } else {
            // Typed mode: provide Spanish, ask for all 3 English forms
            const askField: QuestionField = 'spanish';
            const answerFields: QuestionField[] = ['infinitive', 'pastSimple', 'pastParticiple'];

            return {
                verb,
                askField,
                answerFields,
                questionText: 'Completa las formas faltantes:',
                prompt: verb[askField], // Just the Spanish word
            };
        }
    }

    generateOptions(currentQuestion: Question, count: number = 4): string[] {
        const field = currentQuestion.answerField;
        if (!field) return []; // Should not happen in choice mode

        const correct = currentQuestion.verb[field];
        const options = new Set<string>();
        options.add(correct);

        // Add other English tenses of the same verb as similar options
        const englishFields: QuestionField[] = ['infinitive', 'pastSimple', 'pastParticiple'];
        englishFields.forEach(f => {
            if (f !== field) {
                options.add(currentQuestion.verb[f]);
            }
        });

        // Add random distractors if we still need more
        while (options.size < count) {
            const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
            const distractor = randomVerb[field];
            if (distractor !== correct) {
                options.add(distractor);
            }
        }

        // Limit to requested count and shuffle
        return Array.from(options).map(opt => Array.isArray(opt) ? opt.join(' / ') : opt).slice(0, count).sort(() => Math.random() - 0.5);
    }

    // Check the answer
    checkAnswer(question: Question, userAnswer: string, field?: QuestionField): boolean {
        return this.getAnswerScore(question, userAnswer, field) === 1.0;
    }

    // Get score for an answer (0, 0.5, or 1)
    getAnswerScore(question: Question, userAnswer: string, field?: QuestionField): number {
        const targetField = field || question.answerField;
        if (!targetField) return 0;

        const rawAnswer = question.verb[targetField];
        const validAnswers = Array.isArray(rawAnswer) ? rawAnswer : rawAnswer.split('/').map((a: string) => a.trim());

        let maxScore = 0;
        for (const valid of validAnswers) {
            const score = checkAnswerWithMisspelling(userAnswer, valid);
            if (score > maxScore) {
                maxScore = score;
            }
            if (maxScore === 1.0) break; // Optimization
        }

        return maxScore;
    }

    getCorrectAnswer(question: Question, field?: QuestionField): string {
        const targetField = field || question.answerField;
        if (!targetField) return '';
        const val = question.verb[targetField];
        return Array.isArray(val) ? val.join(' / ') : val;
    }
}

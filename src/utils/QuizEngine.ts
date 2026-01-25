import { Verb, verbs } from '../data/verbs';

export type QuestionField = 'infinitive' | 'pastSimple' | 'pastParticiple' | 'spanish';

export interface Question {
    verb: Verb;
    askField: QuestionField;
    answerField: QuestionField;
    questionText: string; // e.g., "Spanish form"
    prompt: string; // e.g., "be" (if askField is infinitive)
}

const FIELD_LABELS: Record<QuestionField, string> = {
    infinitive: 'Infinitivo',
    pastSimple: 'Pasado Simple',
    pastParticiple: 'Pasado Participio',
    spanish: 'Español',
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
    generateQuestion(): Question {
        const verb = this.getRandomVerb();
        const fields: QuestionField[] = ['infinitive', 'pastSimple', 'pastParticiple', 'spanish'];

        // Pick two distinct fields randomly
        let askIndex = Math.floor(Math.random() * fields.length);
        let answerIndex;
        do {
            answerIndex = Math.floor(Math.random() * fields.length);
        } while (answerIndex === askIndex);

        const askField = fields[askIndex];
        const answerField = fields[answerIndex];

        return {
            verb,
            askField,
            answerField,
            questionText: `¿Cuál es el ${FIELD_LABELS[answerField]}?`,
            prompt: `${FIELD_LABELS[askField]}: ${verb[askField]}`,
        };
    }

    generateOptions(currentQuestion: Question, count: number = 4): string[] {
        const correct = currentQuestion.verb[currentQuestion.answerField];
        const options = new Set<string>();
        options.add(correct);

        while (options.size < count) {
            const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
            const distractor = randomVerb[currentQuestion.answerField];
            if (distractor !== correct) {
                options.add(distractor);
            }
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    // Check the answer
    checkAnswer(question: Question, userAnswer: string): boolean {
        const correctAnswer = question.verb[question.answerField];

        // Handle multiple possibilities (e.g., "was/were", "learned/learnt")
        const validAnswers = correctAnswer.split('/').map(a => a.trim().toLowerCase());
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();

        return validAnswers.includes(normalizedUserAnswer);
    }

    getCorrectAnswer(question: Question): string {
        return question.verb[question.answerField];
    }
}

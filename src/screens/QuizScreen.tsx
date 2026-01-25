import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { QuizEngine, Question } from '../utils/QuizEngine';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

const TOTAL_QUESTIONS = 10;

export default function QuizScreen({ navigation, route }: Props) {
    const { mode } = route.params;
    const [engine] = useState(() => new QuizEngine());
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [options, setOptions] = useState<string[]>([]);

    const [userAnswer, setUserAnswer] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState<'answering' | 'correct' | 'incorrect'>('answering');
    const [feedback, setFeedback] = useState('');

    // Move loads to a separate function we can call
    const loadNextQuestion = () => {
        if (questionCount >= TOTAL_QUESTIONS) {
            navigation.replace('Summary', { score, total: TOTAL_QUESTIONS });
            return;
        }

        const q = engine.generateQuestion();
        setCurrentQuestion(q);

        if (mode === 'choice') {
            setOptions(engine.generateOptions(q));
        }

        setUserAnswer('');
        setStatus('answering');
        setFeedback('');
        setQuestionCount(prev => prev + 1);
    };

    // Initial load
    useEffect(() => {
        loadNextQuestion();
    }, []);

    const handleAnswer = (answer: string) => {
        if (status !== 'answering') return; // Prevent double submission

        setUserAnswer(answer);

        // In choice mode, we submit immediately. In typed mode, this is just updating state.
        if (mode === 'choice') {
            submitAnswer(answer);
        }
    }

    const submitAnswer = (answerToCheck: string) => {
        if (!currentQuestion) return;

        const isCorrect = engine.checkAnswer(currentQuestion, answerToCheck);

        if (isCorrect) {
            setScore(prev => prev + 1);
            setStatus('correct');
            setFeedback('¡Correcto!');
        } else {
            setStatus('incorrect');
            setFeedback(`Incorrecto. La respuesta es: ${engine.getCorrectAnswer(currentQuestion)}`);
        }
    };

    const handleTypedSubmit = () => {
        submitAnswer(userAnswer);
    };

    const handleNext = () => {
        loadNextQuestion();
    };

    if (!currentQuestion) return null;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.counterText}>Pregunta {questionCount} / {TOTAL_QUESTIONS}</Text>
                <Text style={styles.scoreText}>Puntuación: {score}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.promptLabel}>Dado:</Text>
                <Text style={styles.promptText}>{currentQuestion.prompt}</Text>

                <View style={styles.divider} />

                <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

                {mode === 'typed' ? (
                    <TextInput
                        style={[
                            styles.input,
                            status === 'correct' && styles.inputCorrect,
                            status === 'incorrect' && styles.inputIncorrect
                        ]}
                        value={userAnswer}
                        onChangeText={handleAnswer}
                        placeholder="Escribe tu respuesta aquí..."
                        autoCapitalize="none"
                        editable={status === 'answering'}
                    />
                ) : (
                    <View style={styles.optionsContainer}>
                        {options.map((opt, index) => {
                            const buttonStyles: any[] = [styles.optionButton];
                            // If answered, highlight the selected one
                            if (status !== 'answering') {
                                const isSelected = opt === userAnswer;
                                const isActuallyCorrect = engine.checkAnswer(currentQuestion, opt);

                                if (isActuallyCorrect) {
                                    buttonStyles.push(styles.optionButtonCorrect);
                                } else if (isSelected) {
                                    buttonStyles.push(styles.optionButtonIncorrect);
                                }
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={buttonStyles}
                                    onPress={() => handleAnswer(opt)}
                                    disabled={status !== 'answering'}
                                >
                                    <Text style={styles.optionText}>{opt}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {status !== 'answering' && (
                    <Text style={[
                        styles.feedbackText,
                        status === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect
                    ]}>
                        {feedback}
                    </Text>
                )}

                {status === 'answering' ? (
                    mode === 'typed' && (
                        <TouchableOpacity
                            style={[styles.button, !userAnswer && styles.buttonDisabled]}
                            onPress={handleTypedSubmit}
                            disabled={!userAnswer}
                        >
                            <Text style={styles.buttonText}>Comprobar</Text>
                        </TouchableOpacity>
                    )
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>
                            {questionCount >= TOTAL_QUESTIONS ? 'Terminar' : 'Siguiente Pregunta'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    counterText: {
        fontSize: 16,
        color: '#666',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    promptLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    promptText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 15,
    },
    questionText: {
        fontSize: 18,
        color: '#444',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 18,
        marginBottom: 15,
        backgroundColor: '#fafafa',
    },
    inputCorrect: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    inputIncorrect: {
        borderColor: '#F44336',
        backgroundColor: '#FFEBEE',
    },
    feedbackText: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '600',
    },
    feedbackCorrect: {
        color: '#4CAF50',
    },
    feedbackIncorrect: {
        color: '#F44336',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#A0CFFF',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    optionsContainer: {
        marginBottom: 15,
        gap: 10,
    },
    optionButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    optionButtonCorrect: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    optionButtonIncorrect: {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
});

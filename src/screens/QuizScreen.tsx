import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { QuizEngine, Question } from '../utils/QuizEngine';

import { theme } from '../styles/theme';

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

    useEffect(() => {
        loadNextQuestion();
    }, []);

    const handleAnswer = (answer: string) => {
        if (status !== 'answering') return;
        setUserAnswer(answer);
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
            setFeedback('¡Muy bien! Correcto.');
        } else {
            setStatus('incorrect');
            setFeedback(`Vaya... La respuesta era: ${engine.getCorrectAnswer(currentQuestion)}`);
        }
    };

    const handleTypedSubmit = () => {
        submitAnswer(userAnswer);
    };

    const handleNext = () => {
        loadNextQuestion();
    };

    if (!currentQuestion) return null;

    const progress = (questionCount / TOTAL_QUESTIONS);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.topSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.counterText}>Pregunta {questionCount} de {TOTAL_QUESTIONS}</Text>
                    <Text style={styles.scoreText}>Puntos: {score}</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.promptLabel}>Traduce o conjuga:</Text>
                <Text style={styles.promptText}>{currentQuestion.prompt.split(': ')[1]}</Text>
                <Text style={styles.hintText}>{currentQuestion.questionText}</Text>

                <View style={styles.divider} />

                {mode === 'typed' ? (
                    <TextInput
                        style={[
                            styles.input,
                            status === 'correct' && styles.inputCorrect,
                            status === 'incorrect' && styles.inputIncorrect
                        ]}
                        value={userAnswer}
                        onChangeText={handleAnswer}
                        placeholder="Tu respuesta..."
                        autoCapitalize="none"
                        editable={status === 'answering'}
                        onSubmitEditing={handleTypedSubmit}
                    />
                ) : (
                    <View style={styles.optionsContainer}>
                        {options.map((opt, index) => {
                            const buttonStyles: any[] = [styles.optionButton];
                            let textStyle: any = styles.optionText;

                            if (status !== 'answering') {
                                const isSelected = opt === userAnswer;
                                const isActuallyCorrect = engine.checkAnswer(currentQuestion, opt);

                                if (isActuallyCorrect) {
                                    buttonStyles.push(styles.optionButtonCorrect);
                                    textStyle = [textStyle, { color: theme.colors.white }];
                                } else if (isSelected) {
                                    buttonStyles.push(styles.optionButtonIncorrect);
                                    textStyle = [textStyle, { color: theme.colors.white }];
                                }
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={buttonStyles}
                                    onPress={() => handleAnswer(opt)}
                                    disabled={status !== 'answering'}
                                >
                                    <Text style={textStyle}>{opt}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {status !== 'answering' && (
                    <View style={[
                        styles.feedbackBox,
                        status === 'correct' ? styles.feedbackBoxCorrect : styles.feedbackBoxIncorrect
                    ]}>
                        <Text style={styles.feedbackText}>{feedback}</Text>
                    </View>
                )}

                <View style={styles.actionContainer}>
                    {status === 'answering' ? (
                        mode === 'typed' && (
                            <TouchableOpacity
                                style={[styles.mainButton, !userAnswer && styles.buttonDisabled]}
                                onPress={handleTypedSubmit}
                                disabled={!userAnswer}
                            >
                                <Text style={styles.buttonText}>Comprobar</Text>
                            </TouchableOpacity>
                        )
                    ) : (
                        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.colors.secondary }]} onPress={handleNext}>
                            <Text style={styles.buttonText}>
                                {questionCount >= TOTAL_QUESTIONS ? 'Ver Resultados' : 'Siguiente'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    topSection: {
        marginBottom: theme.spacing.lg,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    counterText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    scoreText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.roundness.xl,
        padding: theme.spacing.xl,
        ...theme.shadows.md,
    },
    promptLabel: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    promptText: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginVertical: theme.spacing.xs,
    },
    hintText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        marginBottom: theme.spacing.md,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    input: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness.lg,
        padding: theme.spacing.md,
        fontSize: 18,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
        marginBottom: theme.spacing.lg,
    },
    inputCorrect: {
        borderColor: theme.colors.success,
        backgroundColor: '#ECFDF5',
    },
    inputIncorrect: {
        borderColor: theme.colors.error,
        backgroundColor: '#FEF2F2',
    },
    optionsContainer: {
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    optionButton: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    optionButtonCorrect: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    optionButtonIncorrect: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
    },
    optionText: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    feedbackBox: {
        padding: theme.spacing.md,
        borderRadius: theme.roundness.lg,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
    },
    feedbackBoxCorrect: {
        backgroundColor: '#ECFDF5',
    },
    feedbackBoxIncorrect: {
        backgroundColor: '#FEF2F2',
    },
    feedbackText: {
        ...theme.typography.body,
        fontWeight: 'bold',
        textAlign: 'center',
        color: theme.colors.text,
    },
    actionContainer: {
        marginTop: theme.spacing.xs,
    },
    mainButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.textLight,
        opacity: 0.5,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

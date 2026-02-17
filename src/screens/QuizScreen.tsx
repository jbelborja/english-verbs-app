import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { QuizEngine, Question, QuestionField } from '../utils/QuizEngine';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

const TOTAL_QUESTIONS = 10;

const FIELD_LABELS: Record<QuestionField, string> = {
    infinitive: 'Infinitivo',
    pastSimple: 'Pasado Simple',
    pastParticiple: 'Pasado Participio',
    spanish: 'Significado',
};

interface DragOption {
    id: string;
    word: string;
}

// Simple component for words in the pool
const WordBubble = ({ option, onPress, disabled }: { option: DragOption, onPress: () => void, disabled: boolean }) => (
    <TouchableOpacity
        style={[styles.dragOption, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
    >
        <Text style={styles.dragOptionText}>{option.word}</Text>
    </TouchableOpacity>
);

export default function QuizScreen({ navigation, route }: Props) {
    const { mode } = route.params;
    const [engine] = useState(() => new QuizEngine());
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [options, setOptions] = useState<string[]>([]);

    const [userAnswer, setUserAnswer] = useState('');
    const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
    const [dragAnswers, setDragAnswers] = useState<Record<string, DragOption | null>>({});
    const [dragOptions, setDragOptions] = useState<DragOption[]>([]);

    const [questionCount, setQuestionCount] = useState(0);
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState<'answering' | 'correct' | 'incorrect'>('answering');
    const [feedback, setFeedback] = useState('');

    const loadNextQuestion = () => {
        if (questionCount >= TOTAL_QUESTIONS) {
            const maxScore = (mode === 'typed' || mode === 'drag') ? TOTAL_QUESTIONS * 3 : TOTAL_QUESTIONS;
            navigation.replace('Summary', { score, total: maxScore, mode });
            return;
        }

        const q = engine.generateQuestion(mode);
        setCurrentQuestion(q);

        if (mode === 'choice') {
            setOptions(engine.generateOptions(q));
            setUserAnswer('');
        } else if (mode === 'drag') {
            const options = (q.answerFields || []).map((f, idx) => {
                const val = q.verb[f];
                const word = Array.isArray(val) ? val.join(' / ') : val;
                return { id: `${f}-${idx}-${Math.random()}`, word };
            });
            setDragOptions([...options].sort(() => Math.random() - 0.5));
            setDragAnswers({});
        } else {
            setTypedAnswers({});
        }

        setStatus('answering');
        setFeedback('');
        setQuestionCount(prev => prev + 1);
    };

    useEffect(() => {
        loadNextQuestion();
    }, []);

    const handleTypedAnswer = (field: string, text: string) => {
        if (status !== 'answering') return;
        setTypedAnswers(prev => ({ ...prev, [field]: text }));
    };

    const handleTapPlace = (option: DragOption) => {
        if (status !== 'answering') return;
        const nextField = (currentQuestion?.answerFields || []).find(f => !dragAnswers[f]);
        if (nextField) {
            setDragAnswers(prev => ({ ...prev, [nextField]: option }));
            setDragOptions(prev => prev.filter(o => o.id !== option.id));
        }
    };

    const handleReturnToPool = (field: string) => {
        if (status !== 'answering' || !dragAnswers[field]) return;
        const option = dragAnswers[field]!;
        setDragOptions(prev => [...prev, option].sort(() => Math.random() - 0.5));
        setDragAnswers(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const submitAnswer = (choiceAnswer?: string) => {
        if (!currentQuestion) return;

        let questionScore = 0;
        let allCorrect = true;
        let anyMisspelled = false;

        if (mode === 'choice') {
            const answerToUse = choiceAnswer !== undefined ? choiceAnswer : userAnswer;
            questionScore = engine.getAnswerScore(currentQuestion, answerToUse, undefined, false);
            allCorrect = questionScore === 1.0;
        } else if (mode === 'drag') {
            const fieldsToVerify = currentQuestion.answerFields || [];
            fieldsToVerify.forEach(f => {
                const s = engine.getAnswerScore(currentQuestion, dragAnswers[f]?.word || '', f);
                questionScore += s;
                if (s < 1.0) allCorrect = false;
            });
        } else {
            const fieldsToVerify = currentQuestion.answerFields || [];
            fieldsToVerify.forEach(f => {
                const s = engine.getAnswerScore(currentQuestion, typedAnswers[f] || '', f);
                questionScore += s;
                if (s < 1.0) allCorrect = false;
                if (s === 0.5) anyMisspelled = true;
            });
        }

        if (allCorrect) {
            setScore(prev => prev + questionScore);
            setStatus('correct');
            setFeedback('¡Muy bien! Todo correcto.');
        } else if (questionScore > 0) {
            setScore(prev => prev + questionScore);
            setStatus('correct');
            let msg = `¡Bien! Has conseguido ${questionScore} puntos.`;
            if (anyMisspelled) msg += '\nCuidado con la ortografía.';
            setFeedback(msg);
        } else {
            setStatus('incorrect');
            if (mode === 'choice') {
                setFeedback(`Vaya... La respuesta era: ${engine.getCorrectAnswer(currentQuestion)}`);
            } else {
                const correctOnes = (currentQuestion.answerFields || [])
                    .map(f => `${FIELD_LABELS[f]}: ${engine.getCorrectAnswer(currentQuestion, f)}`)
                    .join('\n');
                setFeedback(`Incorrecto. Las respuestas eran:\n${correctOnes}`);
            }
        }
    };

    const handleNext = () => {
        loadNextQuestion();
    };

    if (!currentQuestion) return null;

    const progress = (questionCount / TOTAL_QUESTIONS);

    const isAllFilled = () => {
        if (mode === 'choice') return !!userAnswer;
        const fields = currentQuestion.answerFields || [];
        if (mode === 'drag') return fields.every(f => !!dragAnswers[f]);
        return fields.every(f => !!typedAnswers[f]?.trim());
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                    <Text style={styles.promptLabel}>
                        {mode === 'typed' ? 'Completa las formas:' :
                            mode === 'drag' ? 'Ordena las palabras:' :
                                `¿Cómo se dice en ${FIELD_LABELS[currentQuestion.answerField!] || ''}?`}
                    </Text>
                    <Text style={[styles.promptText, mode === 'typed' && { fontSize: 24 }, mode === 'choice' && { fontSize: 32, textAlign: 'center' }]}>
                        {currentQuestion.prompt}
                    </Text>

                    <View style={styles.divider} />

                    {mode === 'typed' ? (
                        <View style={styles.typedContainer}>
                            {(currentQuestion.answerFields || []).map((field) => (
                                <View key={field} style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>{FIELD_LABELS[field]}</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            status !== 'answering' && (
                                                (() => {
                                                    const s = engine.getAnswerScore(currentQuestion, typedAnswers[field] || '', field);
                                                    if (s === 1.0) return styles.inputCorrect;
                                                    if (s === 0.5) return styles.inputWarning;
                                                    return styles.inputIncorrect;
                                                })()
                                            )
                                        ]}
                                        value={typedAnswers[field] || ''}
                                        onChangeText={(text) => handleTypedAnswer(field, text)}
                                        placeholder={`Escribe el ${FIELD_LABELS[field].toLowerCase()}...`}
                                        autoCapitalize="none"
                                        editable={status === 'answering'}
                                    />
                                </View>
                            ))}
                        </View>
                    ) : mode === 'drag' ? (
                        <View style={styles.dragContainer}>
                            <View style={styles.slotsRow}>
                                {(currentQuestion.answerFields || []).map((field) => (
                                    <View key={field} style={styles.slotWrapper}>
                                        <Text style={styles.inputLabel}>{FIELD_LABELS[field]}</Text>
                                        <TouchableOpacity
                                            style={[
                                                styles.slot,
                                                status !== 'answering' && (
                                                    engine.checkAnswer(currentQuestion, dragAnswers[field]?.word || '', field)
                                                        ? styles.inputCorrect
                                                        : styles.inputIncorrect
                                                )
                                            ]}
                                            onPress={() => handleReturnToPool(field)}
                                            disabled={status !== 'answering'}
                                        >
                                            <Text style={styles.slotText}>{dragAnswers[field]?.word || ''}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.optionsPool}>
                                {dragOptions.map((opt) => (
                                    <WordBubble
                                        key={opt.id}
                                        option={opt}
                                        onPress={() => handleTapPlace(opt)}
                                        disabled={status !== 'answering'}
                                    />
                                ))}
                            </View>
                        </View>
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
                                        onPress={() => {
                                            setUserAnswer(opt);
                                            submitAnswer(opt);
                                        }}
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
                            (mode === 'typed' || mode === 'drag') && (
                                <TouchableOpacity
                                    style={[styles.mainButton, !isAllFilled() && styles.buttonDisabled]}
                                    onPress={() => submitAnswer()}
                                    disabled={!isAllFilled()}
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl * 2,
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
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    typedContainer: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    inputWrapper: {
        gap: 4,
    },
    inputLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    input: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness.lg,
        padding: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
    },
    inputCorrect: {
        borderColor: theme.colors.success,
        backgroundColor: '#ECFDF5',
    },
    inputWarning: {
        borderColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
    },
    inputIncorrect: {
        borderColor: theme.colors.error,
        backgroundColor: '#FEF2F2',
    },
    dragContainer: {
        marginBottom: theme.spacing.lg,
    },
    slotsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    slotWrapper: {
        flex: 1,
        gap: 4,
    },
    slot: {
        height: 50,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        borderRadius: theme.roundness.md,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slotText: {
        ...theme.typography.body,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    optionsPool: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        justifyContent: 'center',
        padding: theme.spacing.md,
        backgroundColor: '#F8FAFC',
        borderRadius: theme.roundness.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    dragOption: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.roundness.full,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    dragOptionText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: '600',
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

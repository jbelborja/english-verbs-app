import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { QuizEngine, Question, QuestionField } from '../utils/QuizEngine';
import tw from 'twrnc';

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
    const { width } = useWindowDimensions();
    const isWide = width >= 760;
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
                <View style={styles.page}>
                <View style={styles.topSection}>
                    <View style={styles.progressHeader}>
                        <View>
                            <Text style={styles.eyebrow}>¡Reto en marcha!</Text>
                            <Text style={styles.counterText}>Pregunta {questionCount} de {TOTAL_QUESTIONS}</Text>
                        </View>
                        <View style={styles.scorePill}>
                            <Text style={styles.scoreText}>{score} puntos</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>

                <View style={[styles.card, isWide && styles.cardWide]}>
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
                                        textStyle = [textStyle, styles.optionTextOnColor];
                                    } else if (isSelected) {
                                        buttonStyles.push(styles.optionButtonIncorrect);
                                        textStyle = [textStyle, styles.optionTextOnColor];
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
                            <TouchableOpacity style={[styles.mainButton, styles.nextButton]} onPress={handleNext}>
                                <Text style={styles.buttonText}>
                                    {questionCount >= TOTAL_QUESTIONS ? 'Ver Resultados' : 'Siguiente'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    scrollContent: tw`px-4 pb-10 pt-5`,
    page: [tw`w-full self-center`, { maxWidth: 900 }],
    topSection: tw`mb-5`,
    progressHeader: tw`mb-3 flex-row items-center justify-between`,
    eyebrow: tw`mb-1 text-sm font-black text-[#7046d8]`,
    counterText: tw`text-sm font-bold text-[#52617f]`,
    scorePill: tw`rounded-full bg-[#fff2cc] px-4 py-2`,
    scoreText: tw`text-sm font-black text-[#815c00]`,
    progressBarBg: tw`h-3 overflow-hidden rounded-full bg-[#e1e8f5]`,
    progressBarFill: tw`h-full rounded-full bg-[#19a879]`,
    card: tw`rounded-3xl border border-[#e7ecf6] bg-white p-5 shadow-sm`,
    cardWide: tw`p-8`,
    promptLabel: tw`text-sm font-black uppercase tracking-wider text-[#73809a]`,
    promptText: tw`my-2 text-[30px] font-black text-[#172554]`,
    divider: tw`mb-5 h-px bg-[#e7ecf6]`,
    typedContainer: tw`mb-5 gap-4`,
    inputWrapper: tw`gap-1`,
    inputLabel: tw`text-sm font-bold text-[#52617f]`,
    input: tw`min-h-[54px] rounded-2xl border-2 border-[#dce4f2] bg-[#fbfcff] px-4 py-3 text-lg text-[#172554]`,
    inputCorrect: tw`border-[#19a879] bg-[#e8faf3]`,
    inputWarning: tw`border-[#f59e0b] bg-[#fffbeb]`,
    inputIncorrect: tw`border-[#ef4444] bg-[#fff0f0]`,
    dragContainer: tw`mb-5`,
    slotsRow: tw`mb-6 flex-row gap-2`,
    slotWrapper: tw`flex-1 gap-1`,
    slot: tw`h-[54px] items-center justify-center rounded-xl border-2 border-dashed border-[#b8c5dd] bg-[#f8faff]`,
    slotText: tw`text-base font-black text-[#4f46e5]`,
    optionsPool: tw`flex-row flex-wrap justify-center gap-2 rounded-2xl border border-[#e7ecf6] bg-[#f8faff] p-4`,
    dragOption: tw`rounded-full border border-[#4f6df5] bg-white px-4 py-2 shadow-sm`,
    dragOptionText: tw`text-base font-bold text-[#4f46e5]`,
    optionsContainer: tw`mb-5 gap-3`,
    optionButton: tw`min-h-[58px] items-center justify-center rounded-2xl border-2 border-[#e1e8f5] bg-[#fbfcff] p-4`,
    optionButtonCorrect: tw`border-[#19a879] bg-[#19a879]`,
    optionButtonIncorrect: tw`border-[#ef4444] bg-[#ef4444]`,
    optionText: tw`text-xl font-black text-[#172554]`,
    optionTextOnColor: tw`text-white`,
    feedbackBox: tw`mb-5 items-center rounded-2xl p-4`,
    feedbackBoxCorrect: tw`bg-[#e8faf3]`,
    feedbackBoxIncorrect: tw`bg-[#fff0f0]`,
    feedbackText: tw`text-center text-base font-extrabold leading-6 text-[#172554]`,
    actionContainer: tw`mt-1`,
    mainButton: tw`min-h-[58px] items-center justify-center rounded-2xl bg-[#19a879] p-4 shadow-sm`,
    nextButton: tw`bg-[#7154d9]`,
    buttonDisabled: tw`bg-[#9ca3af] opacity-60`,
    buttonText: tw`text-lg font-black text-white`,
};

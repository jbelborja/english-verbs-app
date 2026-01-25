export type RootStackParamList = {
    Home: undefined;
    Quiz: { mode: 'typed' | 'choice' };
    Summary: { score: number; total: number };
    Profile: undefined;
    Login: undefined;
};

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    Home: undefined;
    Quiz: { mode: 'typed' | 'choice' };
    Summary: { score: number; total: number };
    Profile: undefined;
};

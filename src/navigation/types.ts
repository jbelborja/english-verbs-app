export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Main: undefined;
    Home: undefined;
    Quiz: { mode: 'typed' | 'choice' | 'drag' };
    Summary: { score: number; total: number; mode: 'typed' | 'choice' | 'drag' };
    Profile: undefined;
};

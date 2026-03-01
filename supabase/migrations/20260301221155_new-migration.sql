-- Create quiz_results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    mode TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for now, should be restricted based on auth setup)
CREATE POLICY "Allow anonymous inserts" ON public.quiz_results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous selects" ON public.quiz_results
    FOR SELECT USING (true);

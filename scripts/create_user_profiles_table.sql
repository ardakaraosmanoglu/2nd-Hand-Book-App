-- Create user_profiles table for user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    profile_image TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON public.user_profiles(name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read user profiles
CREATE POLICY user_profiles_select_policy ON public.user_profiles
    FOR SELECT USING (true);
    
-- Users can only update their own profiles
CREATE POLICY user_profiles_update_policy ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can only insert their own profiles
CREATE POLICY user_profiles_insert_policy ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Table and column comments
COMMENT ON TABLE public.user_profiles IS 'Stores user profile information';
COMMENT ON COLUMN public.user_profiles.id IS 'References the auth.users id';
COMMENT ON COLUMN public.user_profiles.name IS 'User display name';
COMMENT ON COLUMN public.user_profiles.email IS 'User email';
COMMENT ON COLUMN public.user_profiles.profile_image IS 'URL to the user profile image';
COMMENT ON COLUMN public.user_profiles.bio IS 'User biography or description';
COMMENT ON COLUMN public.user_profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.user_profiles.created_at IS 'When the profile was created';
COMMENT ON COLUMN public.user_profiles.updated_at IS 'When the profile was last updated';

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at(); 
-- Add INSERT policy for profiles (allows service role and users to create their own profile)
CREATE POLICY IF NOT EXISTS "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Make your existing user an admin
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
WHERE email = 'joshua@madebymclean.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Also set any existing users as admin (in case email is different)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Update profile to admin role for joshua@madebymclean.com
-- This assumes the user has already signed up via the auth system

-- First, find the user and update their profile to admin
UPDATE public.profiles
SET role = 'admin', first_name = 'Joshua', last_name = 'Admin'
WHERE email = 'joshua@madebymclean.com';

-- If the profile doesn't exist yet, we need to insert it after signup
-- The user should sign up first, then run this script

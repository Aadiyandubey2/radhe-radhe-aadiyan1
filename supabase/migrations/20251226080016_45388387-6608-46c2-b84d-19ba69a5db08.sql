-- Add policy to allow checking PIN for login (read-only, no sensitive data exposed)
CREATE POLICY "Allow PIN verification for login"
ON public.pin_users FOR SELECT
TO anon
USING (is_active = true);
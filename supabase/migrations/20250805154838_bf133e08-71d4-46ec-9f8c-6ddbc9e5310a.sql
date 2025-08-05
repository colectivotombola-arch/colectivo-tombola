-- Insert default site settings if none exist
INSERT INTO public.site_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Also ensure user has profile
INSERT INTO public.profiles (user_id, full_name)
SELECT id, 'Fausto Sarmiento Salgado'
FROM auth.users
WHERE email = 'colectivotombola@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
UPDATE auth.users
SET encrypted_password = crypt('fg0103093027', gen_salt('bf')),
    updated_at = now()
WHERE email = 'colectivotombola@gmail.com';
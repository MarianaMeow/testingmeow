# Supabase Row Level Security (RLS) Setup Guide

## Why RLS is Important

Your Supabase anon key is visible in the browser's JavaScript. Without Row Level Security (RLS), anyone who finds this key could potentially:
- Read other users' encrypted password vaults
- Modify or delete other users' data

RLS ensures each user can **only access their own data**.

## Setup Instructions

### 1. Go to Supabase Dashboard

1. Log in to [Supabase](https://supabase.com)
2. Select your project
3. Go to **SQL Editor** in the left sidebar

### 2. Run These SQL Commands

Copy and paste the following SQL into the SQL Editor and click **Run**:

```sql
-- Enable RLS on the password_vaults table
ALTER TABLE password_vaults ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own vault" ON password_vaults;
DROP POLICY IF EXISTS "Users can insert own vault" ON password_vaults;
DROP POLICY IF EXISTS "Users can update own vault" ON password_vaults;
DROP POLICY IF EXISTS "Users can delete own vault" ON password_vaults;

-- Policy: Users can only SELECT their own vault
CREATE POLICY "Users can view own vault"
ON password_vaults
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own vault
CREATE POLICY "Users can insert own vault"
ON password_vaults
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own vault
CREATE POLICY "Users can update own vault"
ON password_vaults
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own vault
CREATE POLICY "Users can delete own vault"
ON password_vaults
FOR DELETE
USING (auth.uid() = user_id);
```

### 3. Verify RLS is Enabled

Run this query to confirm:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'password_vaults';
```

The `rowsecurity` column should show `true`.

### 4. Test the Policies

You can test by:
1. Creating two different user accounts
2. Adding passwords to each account
3. Trying to access one user's data while logged in as another (it should fail)

## Table Structure Reference

If you haven't created the table yet, here's the recommended structure:

```sql
CREATE TABLE password_vaults (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_password_vaults_user_id ON password_vaults(user_id);
```

## Security Checklist

- [x] RLS enabled on `password_vaults` table
- [x] SELECT policy restricts to own data
- [x] INSERT policy restricts to own data
- [x] UPDATE policy restricts to own data
- [x] DELETE policy restricts to own data
- [ ] Consider adding rate limiting (Supabase Edge Functions)
- [ ] Consider adding audit logging

## Additional Security Recommendations

1. **Never disable RLS** - Even for testing, use service role key instead
2. **Use service role key only server-side** - Never expose it in client code
3. **Monitor your Supabase logs** - Check for suspicious activity
4. **Enable email confirmation** - Prevent fake account creation

## Troubleshooting

### "Permission denied" errors
- Make sure the user is authenticated before making requests
- Check that `auth.uid()` matches the `user_id` in your data

### Data not showing up
- Verify RLS policies are correctly applied
- Check that you're inserting with the correct `user_id`

### Testing with service role
If you need to bypass RLS for admin tasks, use the service role key (server-side only):
```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
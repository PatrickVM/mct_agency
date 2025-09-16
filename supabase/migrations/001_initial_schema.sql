-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Profiles table policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (
    user_id = auth.uid()::text
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    user_id = auth.uid()::text
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text
  );

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Public can read public profiles" ON profiles
  FOR SELECT USING (is_public = true);

-- Notes table policies (admin only)
CREATE POLICY "Admins can insert notes" ON notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
    AND admin_user_id = auth.uid()::text
  );

CREATE POLICY "Admins can read own notes" ON notes
  FOR SELECT USING (
    admin_user_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update own notes" ON notes
  FOR UPDATE USING (
    admin_user_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Invite tokens table policies (admin only)
CREATE POLICY "Admins can manage invite tokens" ON invite_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
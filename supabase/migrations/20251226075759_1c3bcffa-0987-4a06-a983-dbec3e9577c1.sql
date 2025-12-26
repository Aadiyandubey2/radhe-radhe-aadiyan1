-- Create table for PIN-based users managed by main account
CREATE TABLE public.pin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pin_users ENABLE ROW LEVEL SECURITY;

-- Only owner can view their PIN users
CREATE POLICY "Owners can view their PIN users"
ON public.pin_users FOR SELECT
USING (auth.uid() = owner_id);

-- Only owner can create PIN users
CREATE POLICY "Owners can create PIN users"
ON public.pin_users FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Only owner can update PIN users
CREATE POLICY "Owners can update PIN users"
ON public.pin_users FOR UPDATE
USING (auth.uid() = owner_id);

-- Only owner can delete PIN users
CREATE POLICY "Owners can delete PIN users"
ON public.pin_users FOR DELETE
USING (auth.uid() = owner_id);

-- Create trigger for updated_at
CREATE TRIGGER update_pin_users_updated_at
BEFORE UPDATE ON public.pin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
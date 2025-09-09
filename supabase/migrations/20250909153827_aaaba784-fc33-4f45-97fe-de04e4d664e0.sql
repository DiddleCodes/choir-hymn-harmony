-- Create user theme preferences table
CREATE TABLE public.user_theme_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme_name VARCHAR(50) NOT NULL DEFAULT 'sacred-gold',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own theme preferences" 
ON public.user_theme_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own theme preferences" 
ON public.user_theme_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own theme preferences" 
ON public.user_theme_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_theme_preferences_updated_at
BEFORE UPDATE ON public.user_theme_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
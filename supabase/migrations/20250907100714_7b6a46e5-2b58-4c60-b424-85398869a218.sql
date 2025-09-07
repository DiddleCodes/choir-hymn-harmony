-- Add type enum for distinguishing songs from hymns
CREATE TYPE public.item_type AS ENUM ('song', 'hymn');

-- Add new columns to items table
ALTER TABLE public.items 
ADD COLUMN type public.item_type DEFAULT 'song'::public.item_type,
ADD COLUMN english_lyrics text,
ADD COLUMN yoruba_lyrics text,
ADD COLUMN hymn_number integer;

-- Update existing items to be songs by default
UPDATE public.items SET type = 'song'::public.item_type WHERE type IS NULL;

-- Make type not null after setting defaults
ALTER TABLE public.items ALTER COLUMN type SET NOT NULL;

-- Add index for faster queries by type
CREATE INDEX idx_items_type ON public.items(type);

-- Add index for hymn numbers
CREATE INDEX idx_items_hymn_number ON public.items(hymn_number) WHERE hymn_number IS NOT NULL;
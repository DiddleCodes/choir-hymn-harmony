-- Update default theme name in user_theme_preferences table
UPDATE user_theme_preferences 
SET theme_name = 'default' 
WHERE theme_name = 'sacred-gold';

-- Update the default value for the theme_name column
ALTER TABLE user_theme_preferences 
ALTER COLUMN theme_name SET DEFAULT 'default';
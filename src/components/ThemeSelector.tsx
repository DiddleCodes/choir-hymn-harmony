import { useState, useEffect } from "react"
import { Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

type ColorTheme = "sacred-gold" | "burgundy-gold" | "forest-cream" | "navy-amber"

const themes = [
  {
    id: "sacred-gold" as ColorTheme,
    name: "Sacred Gold",
    description: "Warm gold and cream - classic hymnal elegance",
    preview: "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
  },
  {
    id: "burgundy-gold" as ColorTheme,
    name: "Burgundy & Gold",
    description: "Rich burgundy with champagne accents - traditional reverence",
    preview: "bg-gradient-to-r from-red-950 to-amber-200 border-red-900"
  },
  {
    id: "forest-cream" as ColorTheme,
    name: "Forest & Cream",
    description: "Deep forest green with ivory - natural and calming",
    preview: "bg-gradient-to-r from-green-950 to-amber-50 border-green-800"
  },
  {
    id: "navy-amber" as ColorTheme,
    name: "Navy & Amber",
    description: "Deep navy with golden amber - sophisticated spirituality",
    preview: "bg-gradient-to-r from-blue-950 to-amber-300 border-blue-900"
  }
]

export function ThemeSelector() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>("sacred-gold")
  const [loading, setLoading] = useState(false)

  // Load user's theme preference
  useEffect(() => {
    if (user) {
      loadUserTheme()
    }
  }, [user])

  const loadUserTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('user_theme_preferences')
        .select('theme_name')
        .eq('user_id', user?.id)
        .single()

      if (data && !error) {
        const themeName = data.theme_name as ColorTheme
        setCurrentTheme(themeName)
        applyTheme(themeName)
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    }
  }

  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement
    
    // Remove existing theme attributes
    root.removeAttribute('data-theme')
    
    // Apply new theme (sacred-gold is default, no attribute needed)
    if (theme !== 'sacred-gold') {
      root.setAttribute('data-theme', theme)
    }
  }

  const saveTheme = async (theme: ColorTheme) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your theme preference.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_theme_preferences')
        .upsert({
          user_id: user.id,
          theme_name: theme,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setCurrentTheme(theme)
      applyTheme(theme)
      
      toast({
        title: "Theme saved",
        description: `Switched to ${themes.find(t => t.id === theme)?.name} theme.`,
      })
    } catch (error) {
      console.error('Error saving theme:', error)
      toast({
        title: "Error saving theme",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background/10 backdrop-blur-sm border-border/20 hover:bg-background/20">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Select color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Color Themes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => saveTheme(theme.id)}
            disabled={loading}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`w-4 h-4 rounded-full border ${theme.preview}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{theme.name}</span>
                  {currentTheme === theme.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {theme.description}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
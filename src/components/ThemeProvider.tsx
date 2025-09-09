import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

type Theme = "dark" | "light" | "system"
type ColorTheme = "sacred-gold" | "burgundy-gold" | "forest-cream" | "navy-amber"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  colorTheme: "sacred-gold",
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const { user } = useAuth()
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [colorTheme, setColorTheme] = useState<ColorTheme>("sacred-gold")

  // Load user's color theme preference when they sign in
  useEffect(() => {
    if (user) {
      loadUserColorTheme()
    }
  }, [user])

  const loadUserColorTheme = async () => {
    try {
      const { data } = await supabase
        .from('user_theme_preferences')
        .select('theme_name')
        .eq('user_id', user?.id)
        .single()

      if (data?.theme_name) {
        const themeName = data.theme_name as ColorTheme
        setColorTheme(themeName)
        applyColorTheme(themeName)
      }
    } catch (error) {
      // User doesn't have a saved preference yet
      console.log('No saved color theme found')
    }
  }

  const applyColorTheme = (colorTheme: ColorTheme) => {
    const root = document.documentElement
    root.removeAttribute('data-theme')
    
    if (colorTheme !== 'sacred-gold') {
      root.setAttribute('data-theme', colorTheme)
    }
  }

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Apply color theme when it changes
  useEffect(() => {
    applyColorTheme(colorTheme)
  }, [colorTheme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    colorTheme,
    setColorTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
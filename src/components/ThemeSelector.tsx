import { useState } from "react"
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
import { useTheme } from "@/components/ThemeProvider"
import { useToast } from "@/hooks/use-toast"

type ColorTheme = "default" | "burgundy-gold" | "forest-cream" | "navy-amber"

const themes = [
  {
    id: "default" as ColorTheme,
    name: "Default",
    description: "Warm gold and cream - classic hymnal elegance",
    preview: "bg-gradient-to-r from-primary/20 to-accent/30 border-primary/40"
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
  const { colorTheme, setColorTheme } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleThemeChange = (theme: ColorTheme) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use custom themes.",
        variant: "destructive",
      })
      return
    }

    setColorTheme(theme)
    toast({
      title: "Theme changed",
      description: `Switched to ${themes.find(t => t.id === theme)?.name} theme.`,
    })
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
            onClick={() => handleThemeChange(theme.id)}
            disabled={loading}
            className="cursor-pointer transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`w-4 h-4 rounded-full border-2 ${theme.preview} transition-transform hover:scale-110`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{theme.name}</span>
                  {colorTheme === theme.id && (
                    <Check className="h-4 w-4 text-primary transition-colors" />
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
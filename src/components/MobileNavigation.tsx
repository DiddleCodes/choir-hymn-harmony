import { useState } from "react";
import { Menu, X, Home, Search, Library, Settings, User, Music, Heart, Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import AdminButton from "./AdminButton";
import { ThemeSelector } from "./ThemeSelector";
import { ThemeToggle } from "./ThemeToggle";

interface MobileNavigationProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

export const MobileNavigation = ({ currentSection, onSectionChange }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();

  const navigationItems = [
    { id: "home", label: "Home", icon: Home, badge: null },
    { id: "search", label: "Search Songs", icon: Search, badge: null },
    { id: "library", label: "Song Library", icon: Library, badge: "New" },
    { id: "favorites", label: "Favorites", icon: Heart, badge: null },
    { id: "playlists", label: "Playlists", icon: Music, badge: null },
  ];

  const handleNavigate = (sectionId: string) => {
    onSectionChange?.(sectionId);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover-scale bg-background/10 backdrop-blur-sm border-border/20"
          >
            <Menu className="h-5 w-5 text-foreground" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-background/95 backdrop-blur-lg border-border/20">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <Music className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Choir</h2>
                    <p className="text-xs text-muted-foreground">Hymn Harmony</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User Section */}
            {user && (
              <div className="p-6 border-b border-border/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.email?.split('@')[0]}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {userRole === 'super_admin' ? 'Super Admin' : 
                         userRole === 'admin' ? 'Admin' : 
                         userRole === 'choir_member' ? 'Choir Member' : 'Guest'}
                      </Badge>
                      {(userRole === 'admin' || userRole === 'super_admin') && (
                        <Badge variant="default" className="text-xs px-2 py-0 animate-pulse">
                          <Settings className="w-3 h-3 mr-1" />
                          Staff
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start text-left h-12 px-4 transition-all duration-200 ${
                        isActive 
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25" 
                          : "hover:bg-primary/10 hover:text-primary hover-scale"
                      }`}
                      onClick={() => handleNavigate(item.id)}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? "animate-pulse" : ""}`} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}

                {/* Choir Members Section */}
                {userRole === 'choir_member' && (
                  <div className="pt-4 mt-4 border-t border-border/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Choir Features
                    </h3>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-12 px-4 hover:bg-accent/10 hover:text-accent hover-scale"
                      onClick={() => handleNavigate("choir-community")}
                    >
                      <Users className="w-5 h-5 mr-3" />
                      <span className="font-medium">Community</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Coming Soon
                      </Badge>
                    </Button>
                  </div>
                )}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border/20 bg-muted/30">
              <div className="space-y-3">
                {/* Theme Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Appearance</span>
                  <div className="flex gap-2">
                    <ThemeToggle />
                    {user && <ThemeSelector />}
                  </div>
                </div>

                {/* Admin/Auth Controls */}
                <div className="flex gap-2">
                  {user ? (
                    <>
                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <div className="flex-1">
                      <AdminButton />
                    </div>
                  )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={signOut}
                        className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      >
                        <LogIn className="w-4 h-4 mr-2 rotate-180" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleNavigate("auth")}
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  requestChoirMembership: (email: string, fullName: string, message?: string) => Promise<{ error: any }>;
  loading: boolean;
  isAdmin: boolean;
  isChoirMember: boolean;
  userRole: 'admin' | 'choir_member' | 'guest' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChoirMember, setIsChoirMember] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'choir_member' | 'guest' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check user roles when user changes
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsChoirMember(false);
          setUserRole('guest'); // Default to guest for non-authenticated users
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRoles(session.user.id);
      } else {
        setUserRole('guest'); // Default to guest for non-authenticated users
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoles = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (data && data.length > 0) {
        const roles = data.map(item => item.role);
        const isAdminUser = roles.includes('admin');
        const isChoirMemberUser = roles.includes('choir_member');
        
        setIsAdmin(isAdminUser);
        setIsChoirMember(isChoirMemberUser);
        
        // Set primary role (admin takes precedence)
        if (isAdminUser) {
          setUserRole('admin');
        } else if (isChoirMemberUser) {
          setUserRole('choir_member');
        } else {
          setUserRole('guest');
        }
      } else {
        setIsAdmin(false);
        setIsChoirMember(false);
        setUserRole('guest');
      }
    } catch (error) {
      setIsAdmin(false);
      setIsChoirMember(false);
      setUserRole('guest');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole('guest'); // Reset to guest mode after signout
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const requestChoirMembership = async (email: string, fullName: string, message?: string) => {
    try {
      const { error } = await supabase
        .from('choir_member_requests')
        .insert({
          email,
          full_name: fullName,
          message,
        });

      if (error) {
        toast({
          title: "Request Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Submitted",
          description: "Your choir membership request has been submitted. An admin will review it soon.",
        });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    requestChoirMembership,
    loading,
    isAdmin,
    isChoirMember,
    userRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
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
  resetPassword: (email: string) => Promise<{ error: any }>;
  requestChoirMembership: (email: string, fullName: string, message?: string) => Promise<{ error: any }>;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isChoirMember: boolean;
  userRole: 'super_admin' | 'admin' | 'choir_member' | 'guest' | null;
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChoirMember, setIsChoirMember] = useState(false);
  const [userRole, setUserRole] = useState<'super_admin' | 'admin' | 'choir_member' | 'guest' | null>(null);
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
          setIsSuperAdmin(false);
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
        const isSuperAdminUser = roles.includes('super_admin');
        const isAdminUser = roles.includes('admin');
        const isChoirMemberUser = roles.includes('choir_member');
        
        setIsSuperAdmin(isSuperAdminUser);
        setIsAdmin(isAdminUser);
        setIsChoirMember(isChoirMemberUser);
        
        // Set primary role (super_admin takes precedence)
        if (isSuperAdminUser) {
          setUserRole('super_admin');
        } else if (isAdminUser) {
          setUserRole('admin');
        } else if (isChoirMemberUser) {
          setUserRole('choir_member');
        } else {
          setUserRole('guest');
        }
      } else {
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setIsChoirMember(false);
        setUserRole('guest');
      }
    } catch (error) {
      setIsSuperAdmin(false);
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
        // Check if this is a choir member who hasn't been approved yet
        if (error.message.includes('Invalid login credentials')) {
          // Check if there's a pending choir member request
          const { data: request } = await supabase
            .from('choir_member_requests')
            .select('status')
            .eq('email', email)
            .maybeSingle();
            
          if (request?.status === 'pending') {
            toast({
              title: "Membership Pending",
              description: "Your choir membership request is still being reviewed by an admin. Please wait for approval.",
              variant: "destructive",
            });
          } else if (request?.status === 'rejected') {
            toast({
              title: "Membership Rejected",
              description: "Your choir membership request was not approved. Please contact an administrator.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign In Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive",
          });
        }
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
      // For choir members, we create auth account but they can't login until approved
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
          description: "Your account has been created. You'll be able to sign in once an admin approves your choir membership request.",
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

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Link Sent",
          description: "Check your email for a password reset link.",
        });
      }

      return { error };
    } catch (error) {
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const requestChoirMembership = async (email: string, fullName: string, message?: string) => {
    try {
      // Validate inputs before sending to prevent security issues
      const trimmedName = fullName.trim();
      const trimmedEmail = email.trim();
      
      if (!trimmedName || trimmedName.length < 2) {
        const error = new Error("Full name must be at least 2 characters long");
        toast({
          title: "Invalid Input",
          description: "Please enter a valid full name (at least 2 characters)",
          variant: "destructive",
        });
        return { error };
      }

      if (!trimmedEmail || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)) {
        const error = new Error("Invalid email format");
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return { error };
      }

      const { error } = await supabase
        .from('choir_member_requests')
        .insert({
          email: trimmedEmail,
          full_name: trimmedName,
          message: message?.trim() || null,
        });

      if (error) {
        // Provide user-friendly error messages for common validation failures
        let errorMessage = error.message;
        if (error.message.includes('row-level security')) {
          errorMessage = "Unable to submit request. Please check your information and try again.";
        }
        
        toast({
          title: "Request Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Submitted",
          description: "Your choir membership request has been submitted. A super admin will review it soon.",
        });
      }

      return { error };
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    requestChoirMembership,
    loading,
    isSuperAdmin,
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
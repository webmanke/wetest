
import { createContext, useState, useEffect, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Types
export type User = {
  id: string;
  email: string;
};

export type Session = {
  user: User;
  access_token: string;
};

type SupabaseContextType = {
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Get Supabase URL and anon key from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create context
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          return;
        }

        if (data?.session) {
          setSession(data.session as Session);
          
          // Check if user is an admin
          const { data: userData } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", data.session.user.id)
            .single();
            
          setIsAdmin(userData?.is_admin || false);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession as Session | null);
        
        if (currentSession) {
          // Check if user is an admin after sign in
          const { data: userData } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", currentSession.user.id)
            .single();
            
          setIsAdmin(userData?.is_admin || false);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      toast.success("Signed in successfully");
    } catch (err) {
      console.error("Sign in error:", err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      toast.success("Account created successfully. Please check your email.");
    } catch (err) {
      console.error("Sign up error:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      setSession(null);
      toast.success("Signed out successfully");
    } catch (err) {
      console.error("Sign out error:", err);
      throw err;
    }
  };

  const value = {
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseSession = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabaseSession must be used within a SupabaseProvider");
  }
  return context;
};

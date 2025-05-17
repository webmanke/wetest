
import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Import the properly configured client

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
        console.log("Checking session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          console.log("Session found:", data.session.user.id);
          setSession(data.session as Session);
          
          // Check if user is an admin
          const { data: userData, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", data.session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }
            
          setIsAdmin(userData?.is_admin || false);
          console.log("Admin status:", userData?.is_admin);
        } else {
          console.log("No session found");
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
        console.log("Auth state changed:", event);
        setSession(currentSession as Session | null);
        
        if (currentSession) {
          // Check if user is an admin after sign in
          const { data: userData, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", currentSession.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }
            
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


import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import AuthForm from "@/components/AuthForm";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const WelcomePage = () => {
  const [activeView, setActiveView] = useState<"welcome" | "signin" | "signup">("welcome");
  const { session } = useSupabaseSession();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animated-bg">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 text-white">ShareGlow Finance</h1>
        <p className="text-muted-foreground">Secure Investment Platform</p>
      </div>
      
      <GlassCard className="w-full max-w-md p-6">
        {activeView === "welcome" && (
          <div className="space-y-6 text-center">
            <div className="py-4">
              <h2 className="text-2xl font-bold mb-2">Welcome to ShareGlow</h2>
              <p className="text-muted-foreground">
                Invest in our exclusive pool of 10,000 shares and earn a guaranteed 2% profit after 24 hours.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => setActiveView("signin")}
                className="bg-primary hover:bg-primary/80"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setActiveView("signup")}
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
              >
                Create Account
              </Button>
            </div>
            
            <div className="pt-4 text-sm text-muted-foreground">
              <p>
                By using this platform, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        )}
        
        {activeView === "signin" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">
                Sign in to access your investment portfolio
              </p>
            </div>
            
            <AuthForm mode="signin" />
            
            <div className="text-center pt-4">
              <Button 
                variant="link" 
                onClick={() => setActiveView("signup")}
                className="text-primary"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </div>
        )}
        
        {activeView === "signup" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Create Account</h2>
              <p className="text-muted-foreground">
                Join ShareGlow and start your investment journey
              </p>
            </div>
            
            <AuthForm mode="signup" />
            
            <div className="text-center pt-4">
              <Button 
                variant="link" 
                onClick={() => setActiveView("signin")}
                className="text-primary"
              >
                Already have an account? Sign in
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default WelcomePage;

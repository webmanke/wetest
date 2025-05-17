
import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import BottomSheet from "@/components/BottomSheet";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { 
  LogOut, 
  Settings, 
  User,
  ShieldAlert,
  Info,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const { session, signOut, isAdmin } = useSupabaseSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your account"
      />
      
      {/* User Info */}
      <GlassCard className="mb-5">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mr-4">
            <User size={24} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">{session?.user?.email}</h3>
            <div className="flex items-center mt-1">
              {isAdmin ? (
                <span className="inline-flex items-center text-xs text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
                  Administrator
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Standard User
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Security Section */}
      <div className="mb-1">
        <h3 className="flex items-center mb-3 text-muted-foreground">
          <ShieldAlert size={16} className="mr-2" />
          Security
        </h3>
      </div>
      
      <GlassCard className="mb-5">
        <div className="space-y-4">
          <p className="text-sm">
            Your account is secured with email and password authentication. 
            All transactions are encrypted and protected.
          </p>
          
          <div className="bg-accent/30 p-3 rounded-lg">
            <div className="flex">
              <Info size={18} className="text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                ShareGlow uses industry-standard encryption to protect your data and investments. Your shares are secured in our database.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Platform Info */}
      <div className="mb-1">
        <h3 className="flex items-center mb-3 text-muted-foreground">
          <Settings size={16} className="mr-2" />
          About
        </h3>
      </div>
      
      <GlassCard className="mb-5">
        <div className="space-y-4">
          <p className="text-sm">
            ShareGlow Finance is a secure investment platform with a fixed pool of 10,000 shares. Each user can purchase shares once per day and sell them after a 24-hour holding period for a 2% profit.
          </p>
          
          <div className="bg-accent/30 p-3 rounded-lg">
            <div className="flex">
              <Info size={18} className="text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  • Purchase only once per day
                </p>
                <p>
                  • Sell shares after 24 hours 
                </p>
                <p>
                  • Fixed profit of 2% on all sales
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Sign Out Button */}
      <div className="mt-8">
        <Button
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Logout Confirmation Bottom Sheet */}
      <BottomSheet
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out"
      >
        <div className="space-y-6">
          <p className="text-center">
            Are you sure you want to sign out?
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary/80"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Signing Out..." : "Yes, Sign Out"}
              {!loading && <ArrowRight className="ml-2" size={16} />}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </PageContainer>
  );
};

export default SettingsPage;

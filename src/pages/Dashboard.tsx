
import { useState, useEffect } from "react";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { useShares } from "@/hooks/useShares";
import { Clock, TrendingUp, DollarSign, AlertCircle, ShoppingCart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    summary, 
    sharesLoading, 
    canPurchaseToday, 
    nextPurchaseTime,
    sharePrice,
    availableShares
  } = useShares();

  // Mock wallet balance - in a real app, this would come from Supabase
  const walletBalance = 500;

  // Calculate time remaining until next purchase
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    if (!canPurchaseToday && nextPurchaseTime) {
      const updateTimeRemaining = () => {
        const now = new Date();
        const targetTime = new Date(nextPurchaseTime);
        
        if (now >= targetTime) {
          setTimeRemaining("Available now");
          return;
        }
        
        const diff = targetTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      };
      
      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000);
      return () => clearInterval(interval);
    }
  }, [canPurchaseToday, nextPurchaseTime]);

  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard" 
        subtitle="Your investment overview"
      />

      {/* Wallet Card */}
      <GlassCard className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium flex items-center mb-1">
              <Wallet className="mr-2" size={18} />
              Wallet Balance
            </h3>
            <p className="text-2xl font-bold text-primary">${walletBalance.toFixed(2)}</p>
          </div>
          <Button 
            onClick={() => navigate('/wallet')}
            variant="outline"
            size="sm"
          >
            Manage
          </Button>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Button 
          onClick={() => navigate('/buy')}
          className="bg-primary hover:bg-primary/80 h-14"
          disabled={!canPurchaseToday}
        >
          <ShoppingCart className="mr-2" size={18} />
          Buy Shares
        </Button>
        <Button 
          onClick={() => navigate('/sell')}
          variant="outline"
          className="h-14"
          disabled={summary.mature_shares <= 0}
        >
          <DollarSign className="mr-2" size={18} />
          Sell Shares
        </Button>
      </div>

      {/* Purchase Eligibility Card */}
      <GlassCard className="mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium flex items-center">
              <Clock className="mr-2" size={18} />
              Purchase Eligibility
            </h3>
            <div className="mt-2">
              {canPurchaseToday ? (
                <div className="text-green-400 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  You can purchase shares today
                </div>
              ) : (
                <div>
                  <div className="text-amber-400 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mr-2"></div>
                    Next purchase available at:
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {nextPurchaseTime ? format(new Date(nextPurchaseTime), 'PPp') : 'Calculating...'}
                  </div>
                  {timeRemaining && (
                    <div className="text-sm text-amber-400 mt-1">
                      {timeRemaining}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Platform Status */}
      <GlassCard className="mb-5">
        <h3 className="font-medium flex items-center mb-3">
          <AlertCircle className="mr-2" size={18} />
          Platform Status
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Shares Available</span>
              <span className="font-medium">{availableShares.toLocaleString()} / 10,000</span>
            </div>
            <Progress value={(availableShares / 10000) * 100} className="h-2" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Share Price</span>
            <span className="font-medium text-secondary">${sharePrice.toFixed(2)}</span>
          </div>
        </div>
      </GlassCard>
      
      {/* Portfolio Summary */}
      <div className="mb-5">
        <h3 className="font-medium flex items-center mb-3">
          <TrendingUp className="mr-2" size={18} />
          Your Portfolio
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Total Shares */}
          <GlassCard>
            <p className="text-xs text-muted-foreground">Total Shares</p>
            <p className="text-xl font-semibold">
              {sharesLoading ? "..." : summary.total_shares}
            </p>
            <p className="text-xs text-secondary">
              ${sharesLoading ? "..." : summary.total_value.toFixed(2)}
            </p>
          </GlassCard>

          {/* Mature Shares */}
          <GlassCard>
            <p className="text-xs text-muted-foreground">Ready to Sell</p>
            <p className="text-xl font-semibold">
              {sharesLoading ? "..." : summary.mature_shares}
            </p>
            <p className="text-xs text-green-400">
              ${sharesLoading ? "..." : summary.mature_value.toFixed(2)}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Profit Summary */}
      {summary.mature_shares > 0 && (
        <GlassCard className="mb-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium flex items-center">
                <DollarSign className="mr-2" size={18} />
                Available Profit
              </h3>
              <div className="mt-1 text-green-400">
                ${((summary.mature_value - (summary.mature_value / 1.02))).toFixed(2)}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* If portfolio is empty */}
      {!sharesLoading && summary.total_shares === 0 && (
        <GlassCard>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              You don't have any shares yet. Start investing today!
            </p>
            <Button 
              onClick={() => navigate('/buy')}
              className="bg-primary hover:bg-primary/80"
              disabled={!canPurchaseToday}
            >
              Purchase Your First Shares
            </Button>
          </div>
        </GlassCard>
      )}
    </PageContainer>
  );
};

export default Dashboard;

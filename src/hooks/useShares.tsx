
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client"; // Import the properly configured client
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export type Share = {
  id: string;
  user_id: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  maturity_date: string;
  is_mature: boolean;
  is_sold: boolean;
  expected_profit: number;
};

export type ShareSummary = {
  total_shares: number;
  total_value: number;
  mature_shares: number;
  mature_value: number;
  pending_shares: number;
  pending_value: number;
};

export const useShares = () => {
  const [sharesLoading, setSharesLoading] = useState(true);
  const [shares, setShares] = useState<Share[]>([]);
  const [summary, setSummary] = useState<ShareSummary>({
    total_shares: 0,
    total_value: 0,
    mature_shares: 0,
    mature_value: 0,
    pending_shares: 0,
    pending_value: 0,
  });
  const [canPurchaseToday, setCanPurchaseToday] = useState(true);
  const [nextPurchaseTime, setNextPurchaseTime] = useState<Date | null>(null);
  const [sharePrice, setSharePrice] = useState<number>(10);
  const [availableShares, setAvailableShares] = useState<number>(0);
  const { toast } = useToast();

  // Fetch user shares
  const fetchUserShares = async () => {
    try {
      setSharesLoading(true);
      const { data: shareData, error } = await supabase
        .from("shares")
        .select("*")
        .eq("is_sold", false)
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      // Process shares to determine maturity
      const now = new Date();
      const processedShares = shareData.map((share) => {
        const maturityDate = new Date(share.maturity_date);
        const isMature = now >= maturityDate;
        return {
          ...share,
          is_mature: isMature,
          expected_profit: share.purchase_price * 0.02, // 2% profit
        };
      });

      setShares(processedShares);

      // Calculate summary statistics
      const total_shares = processedShares.reduce((sum, share) => sum + share.quantity, 0);
      const total_value = processedShares.reduce((sum, share) => sum + share.purchase_price, 0);
      
      const mature_shares = processedShares
        .filter(share => share.is_mature)
        .reduce((sum, share) => sum + share.quantity, 0);
      
      const mature_value = processedShares
        .filter(share => share.is_mature)
        .reduce((sum, share) => sum + (share.purchase_price + share.expected_profit), 0);
      
      const pending_shares = total_shares - mature_shares;
      const pending_value = total_shares ? (total_value - (mature_value - (mature_value / 1.02))) : 0;

      setSummary({
        total_shares,
        total_value,
        mature_shares,
        mature_value,
        pending_shares,
        pending_value,
      });

      // Check if user can purchase today
      const { data: lastPurchase, error: lastPurchaseError } = await supabase
        .from("transactions")
        .select("created_at")
        .eq("type", "buy")
        .order("created_at", { ascending: false })
        .limit(1);

      if (lastPurchaseError) throw lastPurchaseError;

      if (lastPurchase && lastPurchase.length > 0) {
        const lastPurchaseDate = new Date(lastPurchase[0].created_at);
        const tomorrow = new Date(lastPurchaseDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        setCanPurchaseToday(now >= tomorrow);
        setNextPurchaseTime(now >= tomorrow ? null : tomorrow);
      } else {
        setCanPurchaseToday(true);
        setNextPurchaseTime(null);
      }
    } catch (error) {
      console.error("Error fetching shares:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load share data",
      });
    } finally {
      setSharesLoading(false);
    }
  };

  // Fetch platform data
  const fetchPlatformData = async () => {
    try {
      // Get current share price
      const { data: priceData, error: priceError } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "share_price")
        .single();

      if (priceError) throw priceError;
      
      if (priceData) {
        setSharePrice(parseFloat(priceData.value));
      }
      
      // Get available shares
      const { data: totalSharesData, error: totalError } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "total_shares")
        .single();

      if (totalError) throw totalError;
      
      const { data: soldSharesData, error: soldError } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "shares_sold")
        .single();
        
      if (soldError) throw soldError;
      
      if (totalSharesData && soldSharesData) {
        const totalShares = parseInt(totalSharesData.value);
        const soldShares = parseInt(soldSharesData.value);
        setAvailableShares(totalShares - soldShares);
      }
    } catch (error) {
      console.error("Error fetching platform data:", error);
    }
  };

  const buyShares = async (quantity: number) => {
    try {
      if (!canPurchaseToday) {
        sonnerToast.error("You can only purchase shares once per day");
        return false;
      }
      
      if (quantity > availableShares) {
        sonnerToast.error(`Only ${availableShares} shares available`);
        return false;
      }
      
      const totalPrice = quantity * sharePrice;
      
      // Insert the purchase transaction
      const { data: transaction, error: txError } = await supabase
        .rpc("purchase_shares", { 
          quantity_to_buy: quantity,
          price_per_share: sharePrice
        });
        
      if (txError) {
        console.error("Purchase error:", txError);
        sonnerToast.error(txError.message || "Failed to purchase shares");
        return false;
      }
      
      sonnerToast.success(`Successfully purchased ${quantity} shares`);
      
      // Refresh data
      await fetchUserShares();
      await fetchPlatformData();
      
      return true;
    } catch (error: any) {
      sonnerToast.error(error.message || "Failed to purchase shares");
      return false;
    }
  };

  const sellShares = async (shareId: string, quantity: number) => {
    try {
      const share = shares.find(s => s.id === shareId);
      
      if (!share) {
        sonnerToast.error("Share not found");
        return false;
      }
      
      if (!share.is_mature) {
        sonnerToast.error("Shares are not mature yet");
        return false;
      }
      
      if (quantity > share.quantity) {
        sonnerToast.error("Cannot sell more shares than you own");
        return false;
      }
      
      // Calculate sell price with 2% profit
      const sellPrice = (share.purchase_price / share.quantity) * quantity * 1.02;
      
      // Insert the sell transaction
      const { error: txError } = await supabase
        .rpc("sell_shares", { 
          share_id_to_sell: shareId,
          quantity_to_sell: quantity
        });
        
      if (txError) {
        console.error("Sell error:", txError);
        sonnerToast.error(txError.message || "Failed to sell shares");
        return false;
      }
      
      sonnerToast.success(`Successfully sold ${quantity} shares for $${sellPrice.toFixed(2)}`);
      
      // Refresh data
      await fetchUserShares();
      await fetchPlatformData();
      
      return true;
    } catch (error: any) {
      sonnerToast.error(error.message || "Failed to sell shares");
      return false;
    }
  };

  useEffect(() => {
    fetchUserShares();
    fetchPlatformData();
    
    // Set up interval to refresh data every minute
    const refreshInterval = setInterval(() => {
      fetchUserShares();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return {
    shares,
    summary,
    sharesLoading,
    canPurchaseToday,
    nextPurchaseTime,
    sharePrice,
    availableShares,
    buyShares,
    sellShares,
    refetchShares: fetchUserShares,
  };
};

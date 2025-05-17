
import { useState, useEffect } from "react";
import { supabase } from "./useSupabaseSession";
import { toast } from "sonner";

export type PlatformSummary = {
  total_shares: number;
  shares_sold: number;
  shares_available: number;
  share_price: number;
  total_users: number;
  total_transactions: number;
  total_volume: number;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  shares_owned: number;
  total_spent: number;
};

export const useAdminData = () => {
  const [platformSummary, setPlatformSummary] = useState<PlatformSummary>({
    total_shares: 10000,
    shares_sold: 0,
    shares_available: 10000,
    share_price: 10,
    total_users: 0,
    total_transactions: 0,
    total_volume: 0,
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlatformSummary = async () => {
    try {
      setLoading(true);

      // Get platform settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("platform_settings")
        .select("*");

      if (settingsError) throw settingsError;

      const settings = settingsData.reduce((acc: any, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (userError) throw userError;

      // Get transaction data
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("id, total_amount");

      if (txError) throw txError;

      const totalTransactions = txData.length;
      const totalVolume = txData.reduce((sum, tx) => sum + tx.total_amount, 0);

      setPlatformSummary({
        total_shares: parseInt(settings.total_shares || "10000"),
        shares_sold: parseInt(settings.shares_sold || "0"),
        shares_available: parseInt(settings.total_shares || "10000") - parseInt(settings.shares_sold || "0"),
        share_price: parseFloat(settings.share_price || "10"),
        total_users: userCount || 0,
        total_transactions: totalTransactions,
        total_volume: totalVolume,
      });
    } catch (error) {
      console.error("Error fetching platform summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get users with their profile data
      const { data, error } = await supabase
        .from("admin_user_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSharePrice = async (newPrice: number) => {
    if (newPrice <= 0) {
      toast.error("Price must be greater than zero");
      return false;
    }

    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value: newPrice.toString() })
        .eq("key", "share_price");

      if (error) throw error;

      toast.success(`Share price updated to $${newPrice}`);
      await fetchPlatformSummary();
      return true;
    } catch (error) {
      console.error("Error updating share price:", error);
      toast.error("Failed to update share price");
      return false;
    }
  };

  const toggleAdminStatus = async (userId: string, makeAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: makeAdmin })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User admin status updated`);
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update admin status");
      return false;
    }
  };

  useEffect(() => {
    fetchPlatformSummary();
    fetchUsers();
  }, []);

  return {
    platformSummary,
    users,
    loading,
    updateSharePrice,
    toggleAdminStatus,
    refetchData: () => {
      fetchPlatformSummary();
      fetchUsers();
    },
  };
};

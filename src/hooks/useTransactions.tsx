
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client"; // Import the properly configured client
import { useToast } from "@/components/ui/use-toast";

export type Transaction = {
  id: string;
  user_id: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total_amount: number;
  created_at: string;
  share_id?: string;
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Validate and cast the transaction type to ensure it matches our expected type
      const typedTransactions = data.map(transaction => {
        // Ensure type is either "buy" or "sell"
        if (transaction.type !== "buy" && transaction.type !== "sell") {
          console.warn(`Invalid transaction type: ${transaction.type}, defaulting to "buy"`);
          return { ...transaction, type: "buy" as const };
        }
        return transaction as Transaction;
      });

      setTransactions(typedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transaction history",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    refetchTransactions: fetchTransactions,
  };
};

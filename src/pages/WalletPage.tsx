
import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import BottomSheet from "@/components/BottomSheet";
import { useShares } from "@/hooks/useShares";

const WalletPage = () => {
  const [amount, setAmount] = useState<string>("0");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { summary } = useShares();
  
  // Mock wallet balance - in a real app, this would come from the database
  const walletBalance = 500;
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) && Number(value) >= 0) {
      setAmount(value);
    }
  };
  
  const handleDeposit = async () => {
    setProcessing(true);
    try {
      // In a real application, this would call a Supabase function
      // to handle the deposit transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Deposit successful",
        description: `$${amount} has been added to your wallet`,
      });
      setShowDepositModal(false);
      setAmount("0");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deposit failed",
        description: "Please try again later",
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleWithdraw = async () => {
    setProcessing(true);
    try {
      // In a real application, this would call a Supabase function
      // to handle the withdrawal transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (Number(amount) > walletBalance) {
        throw new Error("Insufficient funds");
      }
      
      toast({
        title: "Withdrawal successful",
        description: `$${amount} has been withdrawn from your wallet`,
      });
      setShowWithdrawModal(false);
      setAmount("0");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Withdrawal failed",
        description: error.message || "Please try again later",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Wallet" 
        subtitle="Manage your funds" 
      />
      
      {/* Wallet Balance */}
      <GlassCard className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center">
            <Wallet className="mr-2" size={18} />
            Wallet Balance
          </h3>
          <span className="text-2xl font-bold text-primary">${walletBalance.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => setShowDepositModal(true)}
            className="bg-primary hover:bg-primary/80"
          >
            <ArrowDownToLine className="mr-2" size={16} />
            Deposit
          </Button>
          
          <Button 
            onClick={() => setShowWithdrawModal(true)}
            variant="outline"
          >
            <ArrowUpFromLine className="mr-2" size={16} />
            Withdraw
          </Button>
        </div>
      </GlassCard>
      
      {/* Portfolio Value */}
      <GlassCard className="mb-5">
        <h3 className="font-medium mb-3">Portfolio Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Shares</span>
            <span className="font-medium">{summary.total_shares}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Portfolio Value</span>
            <span className="font-medium text-green-400">${summary.total_value.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Available to Sell</span>
            <span className="font-medium text-green-400">${summary.mature_value.toFixed(2)}</span>
          </div>
        </div>
      </GlassCard>
      
      {/* Transaction History */}
      <GlassCard>
        <h3 className="font-medium mb-3">Recent Transactions</h3>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-2">
            <div className="text-center py-4 text-muted-foreground text-sm">
              <AlertCircle className="mx-auto mb-2" size={20} />
              No recent transactions
            </div>
          </TabsContent>
          
          <TabsContent value="deposits" className="space-y-2">
            <div className="text-center py-4 text-muted-foreground text-sm">
              <AlertCircle className="mx-auto mb-2" size={20} />
              No deposit transactions
            </div>
          </TabsContent>
          
          <TabsContent value="withdrawals" className="space-y-2">
            <div className="text-center py-4 text-muted-foreground text-sm">
              <AlertCircle className="mx-auto mb-2" size={20} />
              No withdrawal transactions
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>
      
      {/* Deposit Modal */}
      <BottomSheet
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Deposit Funds"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Amount to Deposit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <Button
            onClick={handleDeposit}
            className="w-full bg-primary hover:bg-primary/80"
            disabled={processing || Number(amount) <= 0}
          >
            {processing ? "Processing..." : "Deposit Funds"}
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowDepositModal(false)}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </BottomSheet>
      
      {/* Withdraw Modal */}
      <BottomSheet
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Funds"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Amount to Withdraw</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            <div className="text-right text-xs text-muted-foreground">
              Available: ${walletBalance.toFixed(2)}
            </div>
          </div>
          
          <Button
            onClick={handleWithdraw}
            className="w-full bg-primary hover:bg-primary/80"
            disabled={processing || Number(amount) <= 0 || Number(amount) > walletBalance}
          >
            {processing ? "Processing..." : "Withdraw Funds"}
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowWithdrawModal(false)}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </BottomSheet>
    </PageContainer>
  );
};

export default WalletPage;

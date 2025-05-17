
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { useTransactions } from "@/hooks/useTransactions";
import { 
  ArrowDownRight, 
  ArrowUpRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HistoryPage = () => {
  const { transactions, loading } = useTransactions();
  
  // Separate transactions by type
  const buyTransactions = transactions.filter(tx => tx.type === "buy");
  const sellTransactions = transactions.filter(tx => tx.type === "sell");
  
  const TransactionItem = ({ 
    type, 
    date, 
    quantity, 
    amount
  }: { 
    type: "buy" | "sell", 
    date: string, 
    quantity: number, 
    amount: number 
  }) => (
    <div className="flex justify-between items-center py-3">
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${type === "buy" ? "bg-primary/20" : "bg-green-400/20"}`}>
          {type === "buy" ? (
            <ArrowDownRight size={16} className="text-primary" />
          ) : (
            <ArrowUpRight size={16} className="text-green-400" />
          )}
        </div>
        <div>
          <div className="font-medium">
            {type === "buy" ? "Purchased" : "Sold"} {quantity} {quantity === 1 ? "share" : "shares"}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), "PPp")}
          </div>
        </div>
      </div>
      <div className={`text-right font-medium ${type === "buy" ? "text-primary" : "text-green-400"}`}>
        {type === "buy" ? "-" : "+"}${amount.toFixed(2)}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Transaction History" 
        subtitle="Record of your investment activity"
      />
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 glass mb-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="buy">Purchases</TabsTrigger>
          <TabsTrigger value="sell">Sales</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <GlassCard>
            <div className="flex items-center justify-center py-10">
              <Clock className="mr-2 animate-pulse text-muted-foreground" />
              <span className="text-muted-foreground">Loading transactions...</span>
            </div>
          </GlassCard>
        ) : transactions.length === 0 ? (
          <GlassCard>
            <div className="text-center py-8">
              <AlertCircle className="mx-auto mb-3" size={24} />
              <h3 className="text-lg font-medium mb-2">No Transactions</h3>
              <p className="text-muted-foreground">
                You haven't made any transactions yet.
              </p>
            </div>
          </GlassCard>
        ) : (
          <>
            <TabsContent value="all" className="space-y-1 mt-0">
              <GlassCard>
                <div className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      type={tx.type}
                      date={tx.created_at}
                      quantity={tx.quantity}
                      amount={tx.total_amount}
                    />
                  ))}
                </div>
              </GlassCard>
            </TabsContent>
            
            <TabsContent value="buy" className="space-y-1 mt-0">
              {buyTransactions.length > 0 ? (
                <GlassCard>
                  <div className="divide-y divide-border">
                    {buyTransactions.map((tx) => (
                      <TransactionItem
                        key={tx.id}
                        type="buy"
                        date={tx.created_at}
                        quantity={tx.quantity}
                        amount={tx.total_amount}
                      />
                    ))}
                  </div>
                </GlassCard>
              ) : (
                <GlassCard>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      No purchase transactions found
                    </p>
                  </div>
                </GlassCard>
              )}
            </TabsContent>
            
            <TabsContent value="sell" className="space-y-1 mt-0">
              {sellTransactions.length > 0 ? (
                <GlassCard>
                  <div className="divide-y divide-border">
                    {sellTransactions.map((tx) => (
                      <TransactionItem
                        key={tx.id}
                        type="sell"
                        date={tx.created_at}
                        quantity={tx.quantity}
                        amount={tx.total_amount}
                      />
                    ))}
                  </div>
                </GlassCard>
              ) : (
                <GlassCard>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      No sell transactions found
                    </p>
                  </div>
                </GlassCard>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </PageContainer>
  );
};

export default HistoryPage;

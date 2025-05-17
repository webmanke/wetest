
import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import BottomSheet from "@/components/BottomSheet";
import { useShares, type Share } from "@/hooks/useShares";
import { 
  DollarSign, 
  Clock, 
  ArrowRight, 
  LockIcon,
  UnlockIcon,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";

const SellPage = () => {
  const { shares, sharesLoading, sellShares } = useShares();
  const [selectedShare, setSelectedShare] = useState<Share | null>(null);
  const [quantityToSell, setQuantityToSell] = useState(0);
  const [showSellModal, setShowSellModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const matureShares = shares.filter(share => share.is_mature);
  const pendingShares = shares.filter(share => !share.is_mature);

  const handleShareSelect = (share: Share) => {
    setSelectedShare(share);
    setQuantityToSell(share.quantity);
    setShowSellModal(true);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedShare) return;
    
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= selectedShare.quantity) {
      setQuantityToSell(value);
    }
  };

  const handleSell = async () => {
    if (!selectedShare) return;
    
    setProcessing(true);
    try {
      const success = await sellShares(selectedShare.id, quantityToSell);
      if (success) {
        setShowSellModal(false);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Calculate sell price with 2% profit
  const calculateSellPrice = () => {
    if (!selectedShare) return 0;
    return (selectedShare.purchase_price / selectedShare.quantity) * quantityToSell * 1.02;
  };

  const sellPrice = calculateSellPrice();
  const originalCost = selectedShare 
    ? (selectedShare.purchase_price / selectedShare.quantity) * quantityToSell
    : 0;
  const profit = sellPrice - originalCost;

  return (
    <PageContainer>
      <PageHeader 
        title="Sell Shares" 
        subtitle="Sell your mature shares for profit" 
      />
      
      {sharesLoading ? (
        <GlassCard>
          <div className="py-8 text-center">
            <div className="animate-pulse text-primary">Loading your shares...</div>
          </div>
        </GlassCard>
      ) : shares.length === 0 ? (
        <GlassCard>
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4" size={32} />
            <h3 className="text-lg font-medium mb-2">No Shares Found</h3>
            <p className="text-muted-foreground">
              You don't have any shares to sell. Purchase shares first.
            </p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Mature shares section */}
          <div className="mb-6">
            <h3 className="flex items-center mb-3 text-green-400">
              <UnlockIcon size={18} className="mr-2" />
              Available to Sell
            </h3>
            
            {matureShares.length > 0 ? (
              <div className="space-y-3">
                {matureShares.map((share) => (
                  <GlassCard 
                    key={share.id} 
                    className="border-green-400/30 cursor-pointer"
                    onClick={() => handleShareSelect(share)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                          <span className="font-medium">{share.quantity} Shares</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Purchased on {format(new Date(share.purchase_date), 'PP')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-400">
                          Mature
                        </div>
                        <div className="text-lg font-medium">
                          ${(share.purchase_price * 1.02).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="border-dashed border-border">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No mature shares available to sell
                  </p>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Immature shares section */}
          {pendingShares.length > 0 && (
            <div>
              <h3 className="flex items-center mb-3 text-muted-foreground">
                <LockIcon size={18} className="mr-2" />
                Pending Maturity
              </h3>
              
              <div className="space-y-3">
                {pendingShares.map((share) => {
                  const maturityDate = new Date(share.maturity_date);
                  const timeToMaturity = formatDistanceToNow(maturityDate, { addSuffix: true });
                  
                  return (
                    <GlassCard key={share.id} className="opacity-80">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center mb-1">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{share.quantity} Shares</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Purchased on {format(new Date(share.purchase_date), 'PP')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Matures {timeToMaturity}
                          </div>
                          <div className="text-lg">
                            ${(share.purchase_price * 1.02).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sell Confirmation Bottom Sheet */}
      {selectedShare && (
        <BottomSheet
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          title="Sell Shares"
        >
          <div className="space-y-6">
            {/* Share Info */}
            <div className="bg-accent/30 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Purchase Date</span>
                <span>{format(new Date(selectedShare.purchase_date), 'PP')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Maturity Date</span>
                <span>{format(new Date(selectedShare.maturity_date), 'PP')}</span>
              </div>
            </div>
            
            {/* Quantity Selection */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Quantity to Sell
              </label>
              <div className="flex space-x-3">
                <Input
                  type="number"
                  value={quantityToSell}
                  onChange={handleQuantityChange}
                  min={1}
                  max={selectedShare.quantity}
                  className="bg-accent/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantityToSell(selectedShare.quantity)}
                >
                  Max
                </Button>
              </div>
            </div>
            
            {/* Pricing Calculation */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Cost</span>
                <span>${originalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit (2%)</span>
                <span className="text-green-400">+${profit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium">
                <span>Total Payout</span>
                <span className="text-green-400">${sellPrice.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Sell Button */}
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleSell}
                className="w-full bg-primary hover:bg-primary/80"
                disabled={processing}
              >
                <DollarSign className="mr-2" size={16} />
                {processing ? "Processing..." : "Confirm Sale"}
                {!processing && <ArrowRight className="ml-2" size={16} />}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowSellModal(false)}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}
    </PageContainer>
  );
};

export default SellPage;

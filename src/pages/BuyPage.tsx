
import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import BottomSheet from "@/components/BottomSheet";
import { useShares } from "@/hooks/useShares";
import { ShoppingCart, Info, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const BuyPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const { 
    sharePrice, 
    availableShares, 
    canPurchaseToday, 
    nextPurchaseTime,
    buyShares,
  } = useShares();

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= availableShares) {
      setQuantity(value);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setQuantity(value[0]);
  };

  const handleBuy = async () => {
    setProcessing(true);
    try {
      const success = await buyShares(quantity);
      if (success) {
        setShowConfirm(false);
      }
    } finally {
      setProcessing(false);
    }
  };

  const totalPrice = quantity * sharePrice;
  const futureValue = totalPrice * 1.02;
  const profit = futureValue - totalPrice;

  // Calculate when shares will mature
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + 1);

  return (
    <PageContainer>
      <PageHeader 
        title="Buy Shares" 
        subtitle="Purchase shares from our fixed pool"
      />
      
      {/* Eligibility Notice */}
      {!canPurchaseToday && (
        <GlassCard className="mb-5 border-amber-400/30">
          <div className="flex items-start">
            <AlertCircle className="text-amber-400 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-amber-400">Purchase Limit Reached</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You've already purchased shares today. Next purchase available at:
              </p>
              <p className="text-sm mt-1">
                {nextPurchaseTime ? format(new Date(nextPurchaseTime), 'PPp') : 'Calculating...'}
              </p>
            </div>
          </div>
        </GlassCard>
      )}
      
      {/* Platform Status */}
      <GlassCard className="mb-5">
        <h3 className="font-medium flex items-center mb-3">
          <Info className="mr-2" size={18} />
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
      
      {/* Buy Form */}
      <GlassCard>
        <h3 className="font-medium mb-4">Purchase Shares</h3>
        
        <div className="space-y-6">
          {/* Quantity Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={availableShares}
                disabled={!canPurchaseToday}
                className="bg-accent/50"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                of {availableShares}
              </span>
            </div>
          </div>
          
          {/* Quantity Slider */}
          <div>
            <Slider
              value={[quantity]}
              min={1}
              max={Math.min(availableShares, 100)}
              step={1}
              onValueChange={handleSliderChange}
              disabled={!canPurchaseToday}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>{Math.min(availableShares, 100)}</span>
            </div>
          </div>
          
          {/* Price Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per share</span>
              <span>${sharePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium">
              <span>Total Price</span>
              <span className="text-secondary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Future Value */}
          <div className="bg-accent/30 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Future Value (after 24h)</span>
              <span className="text-green-400">${futureValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expected Profit</span>
              <span className="text-green-400">+${profit.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Buy Button */}
          <Button
            className="w-full bg-primary hover:bg-primary/80"
            onClick={() => setShowConfirm(true)}
            disabled={!canPurchaseToday || quantity < 1}
          >
            <ShoppingCart className="mr-2" size={16} />
            {canPurchaseToday ? "Buy Shares" : "Purchase Limit Reached"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Shares will mature 24 hours after purchase
          </p>
        </div>
      </GlassCard>

      {/* Confirmation Bottom Sheet */}
      <BottomSheet
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Purchase"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium">{quantity} shares</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price per share</span>
              <span>${sharePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Total Cost</span>
              <span className="text-secondary font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Maturity Date</span>
              <span>{format(maturityDate, 'PPp')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Future Value</span>
              <span className="text-green-400">${futureValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Profit (2%)</span>
              <span className="text-green-400">+${profit.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-accent/30 rounded-lg p-3">
            <div className="flex">
              <Info size={18} className="text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Shares can only be sold after the 24-hour maturity period. You can only purchase shares once per day.
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary/80"
              onClick={handleBuy}
              disabled={processing}
            >
              {processing ? "Processing..." : "Confirm Purchase"}
              {!processing && <ArrowRight className="ml-2" size={16} />}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </PageContainer>
  );
};

export default BuyPage;

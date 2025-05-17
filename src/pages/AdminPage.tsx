
import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import BottomSheet from "@/components/BottomSheet";
import { useAdminData } from "@/hooks/useAdminData";
import { 
  Crown, 
  Users,
  Wallet,
  Settings as SettingsIcon,
  ArrowUpDown,
  Info,
  BadgeCheck,
  BadgeMinus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const AdminPage = () => {
  const { 
    platformSummary, 
    users, 
    loading, 
    updateSharePrice,
    toggleAdminStatus
  } = useAdminData();
  
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState(platformSummary.share_price);
  const [processing, setProcessing] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setNewPrice(value);
    }
  };

  const handlePriceUpdate = async () => {
    setProcessing(true);
    try {
      const success = await updateSharePrice(newPrice);
      if (success) {
        setShowPriceModal(false);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setProcessing(true);
    try {
      await toggleAdminStatus(userId, makeAdmin);
    } finally {
      setProcessing(false);
      setShowUserModal(false);
    }
  };

  // Find selected user
  const userDetails = selectedUser 
    ? users.find(user => user.id === selectedUser) 
    : null;

  return (
    <PageContainer>
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Platform management and overview"
        action={
          <div className="flex items-center">
            <Crown className="text-secondary mr-1.5" size={16} />
            <span className="text-sm text-secondary font-medium">Admin</span>
          </div>
        }
      />
      
      {/* Platform Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <GlassCard>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Users</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">{platformSummary.total_users}</span>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Transaction Volume</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">
                ${platformSummary.total_volume.toFixed(2)}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Share Pool Status */}
      <GlassCard className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center">
            <Wallet className="mr-2" size={18} />
            Share Pool Status
          </h3>
          <Button 
            size="sm"
            onClick={() => setShowPriceModal(true)}
            className="text-xs"
          >
            Adjust Price
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Shares Remaining</span>
              <span>
                {platformSummary.shares_available.toLocaleString()} / {platformSummary.total_shares.toLocaleString()} 
                <span className="text-muted-foreground ml-1">
                  ({Math.round(platformSummary.shares_available / platformSummary.total_shares * 100)}%)
                </span>
              </span>
            </div>
            <Progress 
              value={(platformSummary.shares_available / platformSummary.total_shares) * 100} 
              className="h-2" 
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Current Share Price</span>
            <span className="font-medium text-secondary text-lg">
              ${platformSummary.share_price.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Transactions</span>
            <span>{platformSummary.total_transactions}</span>
          </div>
        </div>
      </GlassCard>
      
      {/* User Management */}
      <div className="mb-1">
        <h3 className="font-medium flex items-center mb-3">
          <Users className="mr-2" size={18} />
          User Management
        </h3>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 glass mb-4">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="regular">Regular Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {loading ? (
            <GlassCard>
              <div className="py-8 text-center">
                <div className="animate-pulse text-primary">Loading users...</div>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <GlassCard 
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user.id);
                    setShowUserModal(true);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        {user.is_admin ? (
                          <Crown size={16} className="text-secondary mr-2" />
                        ) : (
                          <Users size={16} className="text-muted-foreground mr-2" />
                        )}
                        <span className="font-medium">{user.email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Joined {format(new Date(user.created_at), 'PP')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {user.shares_owned} Shares
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${user.total_spent.toFixed(2)} spent
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="admin" className="mt-0">
          {loading ? (
            <div className="animate-pulse text-primary">Loading...</div>
          ) : (
            <div className="space-y-3">
              {users.filter(u => u.is_admin).length > 0 ? (
                users.filter(u => u.is_admin).map(user => (
                  <GlassCard 
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user.id);
                      setShowUserModal(true);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <Crown size={16} className="text-secondary mr-2" />
                          <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined {format(new Date(user.created_at), 'PP')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {user.shares_owned} Shares
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${user.total_spent.toFixed(2)} spent
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <GlassCard>
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground">No admin users found</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="regular" className="mt-0">
          {loading ? (
            <div className="animate-pulse text-primary">Loading...</div>
          ) : (
            <div className="space-y-3">
              {users.filter(u => !u.is_admin).length > 0 ? (
                users.filter(u => !u.is_admin).map(user => (
                  <GlassCard 
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user.id);
                      setShowUserModal(true);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <Users size={16} className="text-muted-foreground mr-2" />
                          <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined {format(new Date(user.created_at), 'PP')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {user.shares_owned} Shares
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${user.total_spent.toFixed(2)} spent
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <GlassCard>
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground">No regular users found</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Price Update Bottom Sheet */}
      <BottomSheet
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        title="Update Share Price"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Current Price: ${platformSummary.share_price.toFixed(2)}
            </label>
            <Input
              type="number"
              value={newPrice}
              onChange={handlePriceChange}
              min="0.01"
              step="0.01"
              className="bg-accent/50"
            />
          </div>
          
          <div className="bg-accent/30 p-3 rounded-lg">
            <div className="flex">
              <Info size={18} className="text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Changing the share price will affect all future purchases. Existing shares will maintain their purchase price.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handlePriceUpdate}
              className="w-full bg-primary hover:bg-primary/80"
              disabled={processing}
            >
              {processing ? "Updating..." : "Update Price"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPriceModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
      
      {/* User Details Bottom Sheet */}
      <BottomSheet
        isOpen={showUserModal && !!userDetails}
        onClose={() => setShowUserModal(false)}
        title="User Details"
      >
        {userDetails && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-3">
                {userDetails.is_admin ? (
                  <div className="bg-secondary/20 p-1.5 rounded-full mr-3">
                    <Crown size={18} className="text-secondary" />
                  </div>
                ) : (
                  <div className="bg-muted/30 p-1.5 rounded-full mr-3">
                    <Users size={18} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{userDetails.email}</div>
                  <div className="text-xs text-muted-foreground">
                    User ID: {userDetails.id.substring(0, 8)}...
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <span>
                    {userDetails.is_admin ? (
                      <span className="text-secondary font-medium">Admin</span>
                    ) : (
                      "Regular User"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined On</span>
                  <span>{format(new Date(userDetails.created_at), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shares Owned</span>
                  <span>{userDetails.shares_owned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span>${userDetails.total_spent.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-accent/30 p-3 rounded-lg">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <SettingsIcon size={14} className="mr-1.5" />
                Admin Actions
              </h4>
              <div className="space-y-3">
                {userDetails.is_admin ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-amber-400/30 text-amber-400"
                    onClick={() => handleToggleAdmin(userDetails.id, false)}
                    disabled={processing}
                  >
                    <BadgeMinus size={14} className="mr-1.5" />
                    Remove Admin Rights
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-secondary/30 text-secondary"
                    onClick={() => handleToggleAdmin(userDetails.id, true)}
                    disabled={processing}
                  >
                    <BadgeCheck size={14} className="mr-1.5" />
                    Make Admin
                  </Button>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowUserModal(false)}
            >
              Close
            </Button>
          </div>
        )}
      </BottomSheet>
    </PageContainer>
  );
};

export default AdminPage;

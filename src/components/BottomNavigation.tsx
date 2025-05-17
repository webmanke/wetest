
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, DollarSign, History, Settings, Crown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const BottomNavigation = () => {
  const { session, isAdmin } = useSupabaseSession();

  if (!session) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-background/80 border-t border-border z-30">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        <NavItem to="/dashboard" icon={<Home size={20} />} label="Home" />
        <NavItem to="/wallet" icon={<Wallet size={20} />} label="Wallet" />
        <NavItem to="/history" icon={<History size={20} />} label="History" />
        {isAdmin && (
          <NavItem to="/admin" icon={<Crown size={20} />} label="Admin" />
        )}
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex flex-col items-center px-3 py-2 rounded-md transition-all",
        isActive
          ? "text-primary bg-primary/10 font-medium scale-105 shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
      )
    }
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </NavLink>
);

export default BottomNavigation;

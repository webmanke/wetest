
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, DollarSign, History, Settings, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const BottomNavigation = () => {
  const { session, isAdmin } = useSupabaseSession();

  if (!session) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-2 z-30">
      <div className="flex justify-around items-center">
        <NavItem to="/dashboard" icon={<Home size={20} />} label="Home" />
        <NavItem to="/buy" icon={<ShoppingCart size={20} />} label="Buy" />
        <NavItem to="/sell" icon={<DollarSign size={20} />} label="Sell" />
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
        "flex flex-col items-center px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "text-primary bg-white/5"
          : "text-muted-foreground hover:text-foreground glass-hover"
      )
    }
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </NavLink>
);

export default BottomNavigation;

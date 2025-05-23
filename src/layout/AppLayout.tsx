
import { Outlet } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const AppLayout = () => {
  const { session } = useSupabaseSession();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-accent/10 overflow-y-auto pb-20">
      <main className="flex-1 flex flex-col pb-16">
        <Outlet />
      </main>
      {session && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;

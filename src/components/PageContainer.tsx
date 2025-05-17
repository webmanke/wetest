
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div className={cn("px-4 py-6 flex-1 overflow-y-auto pb-20", className)}>
      {children}
    </div>
  );
};

export default PageContainer;

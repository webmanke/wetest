
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, className, action }: PageHeaderProps) => {
  return (
    <div className={cn("flex flex-col mb-6", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default PageHeader;

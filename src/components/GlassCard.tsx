
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const GlassCard = ({ className, children, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn("glass-card p-4 animate-fade-in", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;

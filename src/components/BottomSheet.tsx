
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  className,
}: BottomSheetProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="bottom-sheet-overlay animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "bottom-sheet animate-slide-up max-h-[80vh] overflow-y-auto",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-medium">{title}</h2>}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-accent/50 hover:bg-accent text-foreground"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </>
  );
};

export default BottomSheet;

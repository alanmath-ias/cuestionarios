import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export function Spinner({ className, size = 'md', inline = false }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-12 h-12',
  };

  if (inline) {
    return (
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)} />
    );
  }

  return (
    <div className="w-full flex justify-center items-center py-8">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
    </div>
  );
}
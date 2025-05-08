// BackButton.tsx
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter"; // Si estás usando Wouter como en tu código original

export const BackButton = () => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link href="/">
        <Button variant="outline" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
      </Link>
    </div>
  );
};

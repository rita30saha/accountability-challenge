import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ message = "Loading...", size = "md" }: LoadingProps) {
  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <Loader2 className={`animate-spin text-orange-500 ${spinnerSizes[size]}`} />
      {message && <p className="text-sm text-neutral-400 font-medium">{message}</p>}
    </div>
  );
}

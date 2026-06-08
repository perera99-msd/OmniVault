import { cn } from "@/lib/utils";

interface LogoTextProps {
  className?: string;
}

export function LogoText({ className }: LogoTextProps) {
  return (
    <span className={cn("font-black tracking-tighter flex items-center", className)}>
      <span className="text-zinc-900 dark:text-white">Omni</span>
      <span className="text-emerald-500 dark:text-emerald-400">Vault</span>
    </span>
  );
}

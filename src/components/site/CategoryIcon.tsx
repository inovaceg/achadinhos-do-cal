import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICON_OPTIONS = [
  "Smartphone", "CookingPot", "Sparkles", "Shirt", "Watch", "Gamepad2", "Laptop", "Wrench", "PawPrint", "Tag",
  "Headphones", "Baby", "Dumbbell", "Car", "BookOpen", "Gift", "Home", "Lamp", "Heart", "ShoppingBag",
];

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = ((name && (Icons as unknown as Record<string, LucideIcon>)[name]) || Icons.Tag) as LucideIcon;
  return <Icon className={className} />;
}

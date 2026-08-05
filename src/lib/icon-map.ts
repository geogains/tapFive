import {
  MessageCircleHeart,
  MousePointerClick,
  Handshake,
  ListChecks,
  Sparkles,
  Scissors,
  UtensilsCrossed,
  Coffee,
  Hammer,
  Stethoscope,
  Dumbbell,
  BedDouble,
  Circle,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit icon registry so content data files can reference icons by
 * string name (kept in `src/data`) while only the icons actually used
 * are bundled, rather than importing lucide-react's full icon set.
 */
export const iconMap: Record<string, LucideIcon> = {
  MessageCircleHeart,
  MousePointerClick,
  Handshake,
  ListChecks,
  Sparkles,
  Scissors,
  UtensilsCrossed,
  Coffee,
  Hammer,
  Stethoscope,
  Dumbbell,
  BedDouble,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Circle;
}

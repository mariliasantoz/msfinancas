import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useView } from "@/contexts/ViewContext";
interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "liana" | "stefany" | "marilia" | "nosso" | "positive" | "negative";
  subtitle?: string;
}
export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  subtitle
}: StatsCardProps) {
  const {
    showValues
  } = useView();
  const displayValue = showValues ? value : "R$ •••";
  const variantClasses = {
    default: "bg-card border-border",
    liana: "bg-liana/10 border-liana/20",
    stefany: "bg-stefany/10 border-stefany/20",
    marilia: "bg-marilia/10 border-marilia/20",
    nosso: "bg-nosso/10 border-nosso/20",
    positive: "bg-positive/15 border-positive/30",
    negative: "bg-negative/15 border-negative/30"
  };
  const iconClasses = {
    default: "text-primary",
    liana: "text-liana-foreground",
    stefany: "text-stefany-foreground",
    marilia: "text-marilia-foreground",
    nosso: "text-nosso-foreground",
    positive: "text-positive-foreground",
    negative: "text-negative-foreground"
  };
  return <Card className={cn("border-2 shadow-md hover:shadow-lg transition-all", variantClasses[variant])}>
      <CardContent className="p-6 border">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{displayValue}</p>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("p-3 rounded-xl bg-background/50", iconClasses[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>;
}
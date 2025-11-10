import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthNavigator({ currentDate, onDateChange }: MonthNavigatorProps) {
  const handlePrevMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="min-w-[200px] text-center">
        <h2 className="text-2xl font-bold capitalize">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

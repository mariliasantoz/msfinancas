import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { CheckCircle2, Clock, Receipt } from "lucide-react";

interface Transaction {
  id: string;
  valor: number;
  tipo: string;
  status: string | null;
}

interface PaymentProgressCardProps {
  transactions: Transaction[];
  showValues: boolean;
}

export function PaymentProgressCard({ transactions, showValues }: PaymentProgressCardProps) {
  const stats = useMemo(() => {
    const contasECompras = transactions.filter(
      (t) => t.tipo === "conta" || t.tipo === "compra"
    );

    const totalMes = contasECompras.reduce((sum, t) => sum + Number(t.valor), 0);
    const totalPago = contasECompras
      .filter((t) => t.status === "Pago")
      .reduce((sum, t) => sum + Number(t.valor), 0);
    const totalPendente = totalMes - totalPago;
    const percentualPago = totalMes > 0 ? (totalPago / totalMes) * 100 : 0;

    return { totalMes, totalPago, totalPendente, percentualPago };
  }, [transactions]);

  return (
    <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5 text-primary" />
          Evolução dos Pagamentos do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-bold text-primary">
              {stats.percentualPago.toFixed(0)}% quitado
            </span>
          </div>
          <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-liana to-liana-foreground transition-all duration-500 ease-out rounded-full"
              style={{ width: `${stats.percentualPago}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-liana/10 border border-liana/20">
            <CheckCircle2 className="h-5 w-5 text-liana-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pago</p>
              <p className="font-bold text-liana-foreground">
                {formatCurrency(stats.totalPago, showValues)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-stefany/10 border border-stefany/20">
            <Clock className="h-5 w-5 text-stefany-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="font-bold text-stefany-foreground">
                {formatCurrency(stats.totalPendente, showValues)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-nosso/10 border border-nosso/20">
            <Receipt className="h-5 w-5 text-nosso-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total do Mês</p>
              <p className="font-bold text-nosso-foreground">
                {formatCurrency(stats.totalMes, showValues)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

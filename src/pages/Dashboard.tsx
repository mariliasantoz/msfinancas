import { useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { StatsCard } from "@/components/StatsCard";
import { PaymentProgressCard } from "@/components/PaymentProgressCard";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { useView } from "@/contexts/ViewContext";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading } = useTransactions(currentDate);
  const { showValues } = useView();

  const stats = useMemo(() => {
    const receitas = transactions
      .filter((t) => t.tipo === "receita")
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = transactions
      .filter((t) => t.tipo !== "receita")
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const saldo = receitas - despesas;

    return { receitas, despesas, saldo };
  }, [transactions]);

  const despesasPorCategoria = useMemo(() => {
    const categorias = transactions
      .filter((t) => t.tipo !== "receita")
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categorias).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const gastosPorResponsavel = useMemo(() => {
    const responsaveis = transactions
      .filter((t) => t.tipo !== "receita")
      .reduce((acc, t) => {
        acc[t.responsavel] = (acc[t.responsavel] || 0) + Number(t.valor);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(responsaveis).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const contasAPagar = useMemo(() => {
    return transactions.filter((t) => t.tipo !== "receita" && t.status === "A Pagar");
  }, [transactions]);

  const receitasAReceber = useMemo(() => {
    return transactions.filter((t) => t.tipo === "receita" && t.status === "A Receber");
  }, [transactions]);

  const totalAPagar = useMemo(() => contasAPagar.reduce((sum, t) => sum + Number(t.valor), 0), [contasAPagar]);
  const totalAReceber = useMemo(() => receitasAReceber.reduce((sum, t) => sum + Number(t.valor), 0), [receitasAReceber]);

  const COLORS = ["hsl(var(--liana))", "hsl(var(--stefany))", "hsl(var(--marilia))", "hsl(var(--nosso))", "hsl(var(--primary))"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Visão Geral 💰</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total de Receitas"
          value={formatCurrency(stats.receitas, showValues)}
          icon={TrendingUp}
          variant="liana"
        />
        <StatsCard
          title="Total de Despesas"
          value={formatCurrency(stats.despesas, showValues)}
          icon={TrendingDown}
          variant="stefany"
        />
        <StatsCard
          title="Saldo do Mês"
          value={formatCurrency(stats.saldo, showValues)}
          icon={Wallet}
          variant={stats.saldo >= 0 ? "positive" : "negative"}
        />
      </div>

      <PaymentProgressCard transactions={transactions} showValues={showValues} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {despesasPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {despesasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Nenhuma despesa registrada</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Gastos por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            {gastosPorResponsavel.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gastosPorResponsavel}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Nenhum gasto registrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-2 border-stefany/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-stefany-foreground" />
              Contas a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contasAPagar.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {contasAPagar.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="text-sm truncate mr-2">{t.descricao}</span>
                    <span className="text-sm font-semibold text-stefany-foreground whitespace-nowrap">{formatCurrency(Number(t.valor), showValues)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">Tudo pago! 🎉</p>
            )}
          </CardContent>
          {contasAPagar.length > 0 && (
            <div className="flex items-center justify-between px-6 pb-4 pt-0">
              <span className="text-sm text-muted-foreground">Total pendente</span>
              <span className="font-bold text-stefany-foreground">{formatCurrency(totalAPagar, showValues)}</span>
            </div>
          )}
        </Card>

        <Card className="shadow-lg border-2 border-liana/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-liana-foreground" />
              Receitas a Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receitasAReceber.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {receitasAReceber.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="text-sm truncate mr-2">{t.descricao}</span>
                    <span className="text-sm font-semibold text-liana-foreground whitespace-nowrap">{formatCurrency(Number(t.valor), showValues)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">Tudo recebido! 🎉</p>
            )}
          </CardContent>
          {receitasAReceber.length > 0 && (
            <div className="flex items-center justify-between px-6 pb-4 pt-0">
              <span className="text-sm text-muted-foreground">Total a receber</span>
              <span className="font-bold text-liana-foreground">{formatCurrency(totalAReceber, showValues)}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

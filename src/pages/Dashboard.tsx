import { useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { StatsCard } from "@/components/StatsCard";
import { useTransactions } from "@/hooks/useTransactions";
import { useConfig } from "@/hooks/useConfig";
import { formatCurrency, getMonthReference } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { useView } from "@/contexts/ViewContext";
import { TrendingUp, TrendingDown, Wallet, Target, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading } = useTransactions(currentDate);
  const { config } = useConfig();
  const { showValues } = useView();

  const stats = useMemo(() => {
    const receitas = transactions
      .filter((t) => t.tipo === "receita")
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = transactions
      .filter((t) => t.tipo !== "receita")
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const saldo = receitas - despesas;
    const metaMensal = config?.meta_mensal || 8000;
    const percentualMeta = metaMensal > 0 ? (despesas / metaMensal) * 100 : 0;

    return { receitas, despesas, saldo, metaMensal, percentualMeta };
  }, [transactions, config]);

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

  const maiorGasto = useMemo(() => {
    return transactions
      .filter((t) => t.tipo !== "receita")
      .sort((a, b) => Number(b.valor) - Number(a.valor))[0];
  }, [transactions]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          variant={stats.saldo >= 0 ? "liana" : "stefany"}
        />
        <StatsCard
          title="Meta Mensal"
          value={formatCurrency(stats.metaMensal, showValues)}
          icon={Target}
          variant="nosso"
          subtitle={`${stats.percentualMeta.toFixed(1)}% utilizado`}
        />
      </div>

      {stats.percentualMeta >= 80 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stats.percentualMeta >= 100
              ? "⚠️ Você ultrapassou a meta mensal!"
              : `⚠️ Você atingiu ${stats.percentualMeta.toFixed(1)}% da meta mensal.`}
          </AlertDescription>
        </Alert>
      )}

      {stats.percentualMeta < 80 && stats.percentualMeta > 0 && (
        <Alert className="border-liana bg-liana/5">
          <AlertCircle className="h-4 w-4 text-liana-foreground" />
          <AlertDescription className="text-liana-foreground">
            ✅ Você gastou {stats.percentualMeta.toFixed(1)}% da meta de {formatCurrency(stats.metaMensal, showValues)}. Continue
            controlando bem! 👏
          </AlertDescription>
        </Alert>
      )}

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

      {maiorGasto && (
        <Card className="shadow-lg border-2 border-nosso/20 bg-nosso/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-nosso-foreground" />
              Maior Gasto do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{maiorGasto.descricao}</p>
                <p className="text-muted-foreground">
                  {maiorGasto.categoria} • {maiorGasto.responsavel}
                </p>
              </div>
              <p className="text-3xl font-bold text-nosso-foreground">{formatCurrency(Number(maiorGasto.valor), showValues)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

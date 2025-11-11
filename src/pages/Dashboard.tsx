import { useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { StatsCard } from "@/components/StatsCard";
import { useTransactions } from "@/hooks/useTransactions";
import { useConfig } from "@/hooks/useConfig";
import { formatCurrency, getMonthReference } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { TrendingUp, TrendingDown, Wallet, Target, AlertCircle, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading, addTransaction } = useTransactions(currentDate);
  const { config } = useConfig();

  const handleDuplicarMesAnterior = async () => {
    const mesAnterior = new Date(currentDate);
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    const mesReferenciaAnterior = getMonthReference(mesAnterior);

    try {
      const { data: transacoesAnterior, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("mes_referencia", mesReferenciaAnterior)
        .eq("tipo", "conta");

      if (error) throw error;

      if (!transacoesAnterior || transacoesAnterior.length === 0) {
        toast.info("Nenhuma conta fixa encontrada no mês anterior");
        return;
      }

      const novasMesReferencia = getMonthReference(currentDate);
      const novasTransacoes = transacoesAnterior.map((t: any) => ({
        data: t.data,
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
        categoria: t.categoria,
        responsavel: t.responsavel,
        forma_pagamento: t.forma_pagamento,
        parcelas: t.parcelas,
        cartao: t.cartao,
        status: "A Pagar" as const,
        mes_referencia: novasMesReferencia,
      }));

      for (const transacao of novasTransacoes) {
        await addTransaction.mutateAsync(transacao);
      }

      toast.success(`${novasTransacoes.length} contas fixas duplicadas com sucesso!`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao duplicar mês anterior");
    }
  };

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
        <div className="flex gap-4 items-center">
          <Button variant="outline" onClick={handleDuplicarMesAnterior} className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicar Mês Anterior
          </Button>
          <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Receitas"
          value={formatCurrency(stats.receitas)}
          icon={TrendingUp}
          variant="liana"
        />
        <StatsCard
          title="Total de Despesas"
          value={formatCurrency(stats.despesas)}
          icon={TrendingDown}
          variant="stefany"
        />
        <StatsCard
          title="Saldo do Mês"
          value={formatCurrency(stats.saldo)}
          icon={Wallet}
          variant={stats.saldo >= 0 ? "liana" : "stefany"}
        />
        <StatsCard
          title="Meta Mensal"
          value={formatCurrency(stats.metaMensal)}
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
            ✅ Você gastou {stats.percentualMeta.toFixed(1)}% da meta de {formatCurrency(stats.metaMensal)}. Continue
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
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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
              <p className="text-3xl font-bold text-nosso-foreground">{formatCurrency(Number(maiorGasto.valor))}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

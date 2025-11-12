import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { useView } from "@/contexts/ViewContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts";
import { MonthNavigator } from "@/components/MonthNavigator";
import { toast } from "sonner";

export default function Relatorios() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions } = useTransactions(currentDate);
  const { showValues } = useView();

  const despesasPorCategoria = useMemo(() => {
    const categorias = transactions
      .filter((t) => t.tipo !== "receita")
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categorias).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const gastosMensais = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    });

    return meses.map((mes) => ({
      mes,
      valor: Math.random() * 5000 + 3000,
    }));
  }, [currentDate]);

  const evolucaoSaldo = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    });

    return meses.map((mes, index) => ({
      mes,
      saldo: Math.random() * 3000 - 1000 + index * 200,
    }));
  }, [currentDate]);

  const handleExportPDF = () => {
    toast.success("Exportação de PDF em desenvolvimento");
  };

  const COLORS = ["hsl(var(--liana))", "hsl(var(--stefany))", "hsl(var(--marilia))", "hsl(var(--nosso))", "hsl(var(--primary))"];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios 📊</h1>
        <div className="flex gap-4 items-center">
          <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
          <Button size="lg" className="gap-2" onClick={handleExportPDF}>
            <FileDown className="h-5 w-5" />
            Exportar PDF
          </Button>
        </div>
      </div>

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
                    outerRadius={100}
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
            <CardTitle>Gastos Mensais Comparativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gastosMensais}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
                <Bar dataKey="valor" fill="hsl(var(--stefany))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Evolução do Saldo nos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoSaldo}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
              <Line type="monotone" dataKey="saldo" stroke="hsl(var(--liana))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

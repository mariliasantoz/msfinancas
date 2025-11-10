import { useState } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate, getMonthReference } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Receitas() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { transactions, isLoading } = useTransactions(currentDate);

  const receitas = transactions.filter((t) => t.tipo === "receita");
  const totalReceitas = receitas.reduce((sum, r) => sum + Number(r.valor), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Carregando...</p></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Receitas 📈</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <Card className="bg-liana/10 border-liana/20 border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Receitas</p>
              <p className="text-4xl font-bold text-liana-foreground">{formatCurrency(totalReceitas)}</p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nova Receita
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          {receitas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receitas.map((receita) => (
                  <TableRow key={receita.id}>
                    <TableCell>{formatDate(receita.data)}</TableCell>
                    <TableCell className="font-medium">{receita.descricao}</TableCell>
                    <TableCell>{receita.categoria}</TableCell>
                    <TableCell>{receita.responsavel}</TableCell>
                    <TableCell className="text-right font-bold text-liana-foreground">
                      {formatCurrency(Number(receita.valor))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma receita registrada neste mês.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

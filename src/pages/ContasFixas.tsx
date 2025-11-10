import { useState } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ContasFixas() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { transactions, isLoading } = useTransactions(currentDate);

  const contas = transactions.filter((t) => t.tipo === "conta");
  const totalContas = contas.reduce((sum, c) => sum + Number(c.valor), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Carregando...</p></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contas Fixas 💳</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <Card className="bg-marilia/10 border-marilia/20 border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Contas Fixas</p>
              <p className="text-4xl font-bold text-marilia-foreground">{formatCurrency(totalContas)}</p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nova Conta Fixa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Contas Fixas</CardTitle>
        </CardHeader>
        <CardContent>
          {contas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell>{formatDate(conta.data)}</TableCell>
                    <TableCell className="font-medium">{conta.descricao}</TableCell>
                    <TableCell>{conta.categoria}</TableCell>
                    <TableCell>{conta.responsavel}</TableCell>
                    <TableCell>
                      <Badge variant={conta.status === "Pago" ? "default" : "secondary"}>
                        {conta.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-marilia-foreground">
                      {formatCurrency(Number(conta.valor))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma conta fixa registrada neste mês.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

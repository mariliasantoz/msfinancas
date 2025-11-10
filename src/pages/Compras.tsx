import { useState } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Compras() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { transactions, isLoading } = useTransactions(currentDate);

  const compras = transactions.filter((t) => t.tipo === "compra");
  const totalCompras = compras.reduce((sum, c) => sum + Number(c.valor), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Carregando...</p></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compras / Cartões 🛒</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <Card className="bg-stefany/10 border-stefany/20 border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Compras</p>
              <p className="text-4xl font-bold text-stefany-foreground">{formatCurrency(totalCompras)}</p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nova Compra
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {compras.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cartão</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>{formatDate(compra.data)}</TableCell>
                    <TableCell className="font-medium">{compra.descricao}</TableCell>
                    <TableCell>{compra.cartao || "-"}</TableCell>
                    <TableCell>{compra.parcelas ? `${compra.parcelas}x` : "À vista"}</TableCell>
                    <TableCell>{compra.responsavel}</TableCell>
                    <TableCell>
                      <Badge variant={compra.status === "Pago" ? "default" : "secondary"}>
                        {compra.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-stefany-foreground">
                      {formatCurrency(Number(compra.valor))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma compra registrada neste mês.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

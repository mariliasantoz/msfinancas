import { useState, useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionDialog } from "@/components/TransactionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ComprasAgrupadas() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentDate);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const compras = transactions.filter((t) => t.tipo === "compra");
  
  const comprasPorCartao = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    compras.forEach((compra) => {
      const cartao = compra.cartao || "Sem cartão";
      if (!grupos[cartao]) grupos[cartao] = [];
      grupos[cartao].push(compra);
    });
    return grupos;
  }, [compras]);

  const totalCompras = compras.reduce((sum, c) => sum + Number(c.valor), 0);

  const handleMarcarCartaoPago = async (cartao: string, isPago: boolean) => {
    const comprasCartao = comprasPorCartao[cartao];
    try {
      for (const compra of comprasCartao) {
        await updateTransaction.mutateAsync({
          id: compra.id,
          status: isPago ? "Pago" : "A Pagar",
        });
      }
      toast.success(`Cartão ${isPago ? "marcado como pago" : "pagamento revertido"}!`);
    } catch (error) {
      toast.error("Erro ao atualizar status do cartão");
    }
  };

  const handleSave = async (transaction: any) => {
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, ...transaction });
        toast.success("Compra atualizada!");
      } else {
        await addTransaction.mutateAsync(transaction);
        toast.success("Compra adicionada!");
      }
    } catch (error) {
      toast.error("Erro ao salvar compra");
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteTransaction.mutateAsync(deletingId);
        toast.success("Compra excluída!");
      } catch (error) {
        toast.error("Erro ao excluir compra");
      }
      setDeletingId(null);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Carregando...</p></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compras / Cartões 💳</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <Card className="bg-nosso/10 border-nosso/20 border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Compras</p>
              <p className="text-4xl font-bold text-nosso-foreground">{formatCurrency(totalCompras)}</p>
            </div>
            <Button size="lg" className="gap-2" onClick={() => { setEditingTransaction(null); setDialogOpen(true); }}>
              <Plus className="h-5 w-5" />
              Nova Compra
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(comprasPorCartao).map(([cartao, comprasCartao]) => {
          const totalCartao = comprasCartao.reduce((sum, c) => sum + Number(c.valor), 0);
          const todasPagas = comprasCartao.every((c) => c.status === "Pago");

          return (
            <Card key={cartao} className={`shadow-lg ${todasPagas ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    <div>
                      <CardTitle>{cartao}</CardTitle>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(totalCartao)}</p>
                    </div>
                  </div>
                  <Button
                    variant={todasPagas ? "outline" : "default"}
                    onClick={() => handleMarcarCartaoPago(cartao, !todasPagas)}
                  >
                    {todasPagas ? "Reverter Pagamento" : "Marcar como Pago"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprasCartao.map((compra) => (
                      <TableRow key={compra.id}>
                        <TableCell>{formatDate(compra.data)}</TableCell>
                        <TableCell className="font-medium">{compra.descricao}</TableCell>
                        <TableCell>{compra.categoria}</TableCell>
                        <TableCell>{compra.responsavel}</TableCell>
                        <TableCell>{compra.parcelas}x</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(Number(compra.valor))}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(compra)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(compra.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTransaction}
        tipo="compra"
        onSave={handleSave}
        currentDate={currentDate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta compra?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

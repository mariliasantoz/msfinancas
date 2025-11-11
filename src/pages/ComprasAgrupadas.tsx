import { useState, useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { useCartoes } from "@/hooks/useCartoes";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionDialog } from "@/components/TransactionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function ComprasAgrupadas() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentDate);
  const { cartoes } = useCartoes();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const compras = transactions.filter((t) => t.tipo === "compra");

  const cartoesMap = useMemo(() => {
    return cartoes.reduce((acc, cartao) => {
      acc[cartao.id] = cartao.nome;
      return acc;
    }, {} as Record<string, string>);
  }, [cartoes]);

  const comprasPorCartao = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    compras.forEach((compra) => {
      const cartaoId = compra.cartao || "sem-cartao";
      if (!grupos[cartaoId]) grupos[cartaoId] = [];
      grupos[cartaoId].push(compra);
    });
    return grupos;
  }, [compras]);

  const totalCompras = compras.reduce((sum, c) => sum + Number(c.valor), 0);

  const handleMarcarCartaoPago = async (cartaoId: string, isPago: boolean) => {
    const comprasCartao = comprasPorCartao[cartaoId];
    try {
      // Atualizar diretamente apenas as transações do mês atual, sem propagar para outras parcelas
      const idsParaAtualizar = comprasCartao.map(c => c.id);
      
      const { error } = await supabase
        .from("transacoes")
        .update({ status: isPago ? "Pago" : "A Pagar" })
        .in("id", idsParaAtualizar);

      if (error) throw error;

      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
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

  const handleDeleteClick = (transaction: any) => {
    setDeletingId(transaction.id);
    setDeletingTransaction(transaction);
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
        {Object.entries(comprasPorCartao).map(([cartaoId, comprasCartao]) => {
          const totalCartao = comprasCartao.reduce((sum, c) => sum + Number(c.valor), 0);
          const todasPagas = comprasCartao.every((c) => c.status === "Pago");
          const nomeCartao = cartaoId === "sem-cartao" ? "Sem cartão" : (cartoesMap[cartaoId] || cartaoId);
          const isExpanded = expandedCards[cartaoId] || false;
          const comprasVisiveis = isExpanded ? comprasCartao : comprasCartao.slice(0, 3);
          const totalComprasCartao = comprasCartao.length;

          return (
            <Card key={cartaoId} className={`shadow-lg ${todasPagas ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    <div>
                      <CardTitle>{nomeCartao}</CardTitle>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(totalCartao)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {totalComprasCartao} {totalComprasCartao === 1 ? "compra" : "compras"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={todasPagas ? "outline" : "default"}
                    onClick={() => handleMarcarCartaoPago(cartaoId, !todasPagas)}
                  >
                    {todasPagas ? "Reverter Pagamento" : "Marcar como Pago"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    {comprasVisiveis.map((compra) => (
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
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(compra)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalComprasCartao > 3 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {comprasVisiveis.length} de {totalComprasCartao} compras
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedCards(prev => ({ ...prev, [cartaoId]: !isExpanded }))}
                      className="gap-2"
                    >
                      {isExpanded ? (
                        <>
                          Mostrar menos <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Ver todas <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
                </div>
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
              {deletingTransaction?.grupo_parcelas 
                ? `Tem certeza que deseja excluir TODAS AS PARCELAS desta compra? Esta ação não pode ser desfeita e afetará todos os meses onde esta compra aparece.`
                : "Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita."
              }
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

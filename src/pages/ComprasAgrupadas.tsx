import { useState, useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { useCartoes } from "@/hooks/useCartoes";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { useView } from "@/contexts/ViewContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, CreditCard, ChevronDown, ChevronUp, Search, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionDialog } from "@/components/TransactionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

function VencimentoEditor({ cartaoId, vencimento, onSave }: { cartaoId: string; vencimento: number | null; onSave: (id: string, v: number | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(vencimento?.toString() || "");

  const handleSave = () => {
    const num = parseInt(value);
    if (value === "" || isNaN(num)) {
      onSave(cartaoId, null);
    } else {
      const clamped = Math.max(1, Math.min(31, num));
      onSave(cartaoId, clamped);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Input
          type="number"
          min={1}
          max={31}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-16 h-7 text-sm px-2"
          autoFocus
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => { setValue(vencimento?.toString() || ""); setEditing(true); }}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Calendar className="h-4 w-4" />
      {vencimento ? `Venc. dia ${vencimento}` : "Definir vencimento"}
    </button>
  );
}

export default function ComprasAgrupadas() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentDate);
  const { cartoes, updateCartao } = useCartoes();
  const queryClient = useQueryClient();
  const { showValues } = useView();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [searchByCard, setSearchByCard] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState("");

  const compras = transactions.filter((t) => t.tipo === "compra");

  const cartoesMap = useMemo(() => {
    return cartoes.reduce((acc, cartao) => {
      acc[cartao.id] = cartao;
      return acc;
    }, {} as Record<string, typeof cartoes[0]>);
  }, [cartoes]);

  const comprasPorCartao = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    compras.forEach((compra) => {
      const cartaoId = compra.cartao || "sem-cartao";
      if (!grupos[cartaoId]) grupos[cartaoId] = [];

      if (globalSearch) {
        const searchLower = globalSearch.toLowerCase();
        if (compra.descricao.toLowerCase().includes(searchLower) || compra.valor.toString().includes(globalSearch)) {
          grupos[cartaoId].push(compra);
        }
      } else {
        grupos[cartaoId].push(compra);
      }
    });
    // Remove empty groups when filtering
    if (globalSearch) {
      Object.keys(grupos).forEach((key) => {
        if (grupos[key].length === 0) delete grupos[key];
      });
    }
    return grupos;
  }, [compras, globalSearch]);

  const totalCompras = compras.reduce((sum, c) => sum + Number(c.valor), 0);

  const handleVencimentoSave = async (cartaoId: string, vencimento: number | null) => {
    try {
      await updateCartao.mutateAsync({ id: cartaoId, vencimento });
      toast.success("Vencimento atualizado!");
    } catch {
      toast.error("Erro ao atualizar vencimento");
    }
  };

  const handleMarcarCartaoPago = async (cartaoId: string, isPago: boolean) => {
    const comprasCartao = comprasPorCartao[cartaoId];
    try {
      const idsParaAtualizar = comprasCartao.map(c => c.id);
      
      const { error } = await supabase
        .from("transacoes")
        .update({ status: isPago ? "Pago" : "A Pagar" })
        .in("id", idsParaAtualizar);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(`Cartão ${isPago ? "marcado como pago" : "pagamento revertido"}!`);
    } catch {
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
    } catch {
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
      } catch {
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
    <div className="space-y-6 p-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compras / Cartões 💳</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <Card className="bg-nosso/10 border-nosso/20 border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Compras</p>
              <p className="text-4xl font-bold text-nosso-foreground">{formatCurrency(totalCompras, showValues)}</p>
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em todos os cartões..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(comprasPorCartao).map(([cartaoId, comprasCartao]) => {
          const totalCartao = comprasCartao.reduce((sum, c) => sum + Number(c.valor), 0);
          const todasPagas = comprasCartao.every((c) => c.status === "Pago");
          const cartaoData = cartoesMap[cartaoId];
          const nomeCartao = cartaoId === "sem-cartao" ? "Sem cartão" : (cartaoData?.nome || cartaoId);
          const vencimento = cartaoData?.vencimento ?? null;
          const isExpanded = expandedCards[cartaoId] || false;
          const totalComprasCartao = comprasCartao.length;

          const searchTerm = searchByCard[cartaoId] || "";
          const comprasFiltradas = comprasCartao.filter((c) => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return c.descricao.toLowerCase().includes(searchLower) || 
                   c.valor.toString().includes(searchTerm);
          });
          const comprasVisiveis = isExpanded ? comprasFiltradas : comprasFiltradas.slice(0, 3);
          const totalComprasFiltradas = comprasFiltradas.length;

          return (
            <Card key={cartaoId} className={`shadow-lg ${todasPagas ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle>{nomeCartao}</CardTitle>
                        {cartaoId !== "sem-cartao" && (
                          <VencimentoEditor
                            cartaoId={cartaoId}
                            vencimento={vencimento}
                            onSave={handleVencimentoSave}
                          />
                        )}
                      </div>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(totalCartao, showValues)}</p>
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou valor..."
                      value={searchByCard[cartaoId] || ""}
                      onChange={(e) => setSearchByCard(prev => ({ ...prev, [cartaoId]: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
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
                        <TableCell className="text-right font-bold">{formatCurrency(Number(compra.valor), showValues)}</TableCell>
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
                
                {totalComprasFiltradas > 3 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {comprasVisiveis.length} de {totalComprasFiltradas} compras
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

      {/* Floating Nova Compra button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 shadow-xl rounded-full gap-2"
        onClick={() => { setEditingTransaction(null); setDialogOpen(true); }}
      >
        <Plus className="h-5 w-5" />
        Nova Compra
      </Button>

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

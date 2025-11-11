import { useState, useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { useCartoes } from "@/hooks/useCartoes";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionDialog } from "@/components/TransactionDialog";
import { FilterBar } from "@/components/FilterBar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMonth } from "@/contexts/MonthContext";

export default function Compras() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentDate);
  const { cartoes } = useCartoes();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [responsavelFilter, setResponsavelFilter] = useState("Todos");
  const [cartaoFilter, setCartaoFilter] = useState("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const cartoesMap = useMemo(() => {
    return cartoes.reduce((acc, cartao) => {
      acc[cartao.id] = cartao.nome;
      return acc;
    }, {} as Record<string, string>);
  }, [cartoes]);

  const compras = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "compra")
      .filter((t) => {
        const matchesSearch = searchValue === "" || 
          t.descricao.toLowerCase().includes(searchValue.toLowerCase()) ||
          t.valor.toString().includes(searchValue);
        const matchesResponsavel = responsavelFilter === "Todos" || t.responsavel === responsavelFilter;
        const matchesCartao = cartaoFilter === "Todos" || t.cartao === cartaoFilter;
        const matchesCategoria = categoriaFilter === "Todas" || t.categoria === categoriaFilter;
        const matchesStatus = statusFilter === "Todos" || t.status === statusFilter;
        return matchesSearch && matchesResponsavel && matchesCartao && matchesCategoria && matchesStatus;
      });
  }, [transactions, searchValue, responsavelFilter, cartaoFilter, categoriaFilter, statusFilter]);

  const totalCompras = compras.reduce((sum, c) => sum + Number(c.valor), 0);

  const handleSave = async (transaction: any) => {
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, ...transaction });
        toast.success("Compra atualizada com sucesso!");
      } else {
        await addTransaction.mutateAsync(transaction);
        toast.success("Compra adicionada com sucesso!");
      }
      setEditingTransaction(null);
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
        toast.success("Compra excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir compra");
      }
      setDeletingId(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

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
            <Button size="lg" className="gap-2" onClick={handleAddNew}>
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
          <FilterBar
            searchValue={searchValue}
            responsavelFilter={responsavelFilter}
            cartaoFilter={cartaoFilter}
            categoriaFilter={categoriaFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearchValue}
            onResponsavelChange={setResponsavelFilter}
            onCartaoChange={setCartaoFilter}
            onCategoriaChange={setCategoriaFilter}
            onStatusChange={setStatusFilter}
          />

          {compras.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Cartão</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>{formatDate(compra.data)}</TableCell>
                    <TableCell className="font-medium">{compra.descricao}</TableCell>
                    <TableCell>{compra.categoria}</TableCell>
                    <TableCell>{compra.responsavel}</TableCell>
                    <TableCell>{compra.cartao ? cartoesMap[compra.cartao] || compra.cartao : "-"}</TableCell>
                    <TableCell>{compra.parcelas ? `${compra.parcelas}x` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={compra.status === "Pago" ? "default" : "secondary"}>
                        {compra.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-stefany-foreground">
                      {formatCurrency(Number(compra.valor))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(compra)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(compra.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
              Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita.
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

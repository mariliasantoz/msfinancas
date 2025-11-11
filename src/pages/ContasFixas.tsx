import { useState, useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate, getNextMonth } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionDialog } from "@/components/TransactionDialog";
import { FilterBar } from "@/components/FilterBar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ContasFixas() {
  const [currentDate, setCurrentDate] = useState(getNextMonth());
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentDate);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);

  const [searchValue, setSearchValue] = useState("");
  const [responsavelFilter, setResponsavelFilter] = useState("Todos");
  const [cartaoFilter, setCartaoFilter] = useState("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const contas = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "conta")
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

  const totalContas = contas.reduce((sum, c) => sum + Number(c.valor), 0);

  const handleSave = async (transaction: any) => {
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, ...transaction });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await addTransaction.mutateAsync(transaction);
        toast.success("Conta adicionada com sucesso!");
      }
      setEditingTransaction(null);
    } catch (error) {
      toast.error("Erro ao salvar conta");
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
        toast.success("Conta excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir conta");
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
            <Button size="lg" className="gap-2" onClick={handleAddNew}>
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
            showCartao={false}
          />

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
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(conta)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(conta)}
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
              Nenhuma conta fixa registrada neste mês.
            </p>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTransaction}
        tipo="conta"
        onSave={handleSave}
        currentDate={currentDate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTransaction?.grupo_parcelas 
                ? `Tem certeza que deseja excluir TODAS AS PARCELAS desta conta? Esta ação não pode ser desfeita e afetará todos os meses onde esta conta aparece.`
                : "Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
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

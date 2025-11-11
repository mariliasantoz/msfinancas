import { useState, useMemo } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReceitaDialog } from "@/components/ReceitaDialog";
import { FilterBar } from "@/components/FilterBar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Receitas() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentDate);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [responsavelFilter, setResponsavelFilter] = useState("Todos");
  const [cartaoFilter, setCartaoFilter] = useState("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const receitas = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "receita")
      .filter((t) => {
        const matchesSearch = searchValue === "" || 
          t.descricao.toLowerCase().includes(searchValue.toLowerCase()) ||
          t.valor.toString().includes(searchValue);
        const matchesResponsavel = responsavelFilter === "Todos" || t.responsavel === responsavelFilter;
        const matchesStatus = statusFilter === "Todos" || t.status === statusFilter;
        return matchesSearch && matchesResponsavel && matchesStatus;
      });
  }, [transactions, searchValue, responsavelFilter, statusFilter]);

  const totalReceitas = receitas.reduce((sum, r) => sum + Number(r.valor), 0);

  const handleSave = async (transaction: any) => {
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, ...transaction });
        toast.success("Receita atualizada com sucesso!");
      } else {
        await addTransaction.mutateAsync(transaction);
        toast.success("Receita adicionada com sucesso!");
      }
      setEditingTransaction(null);
    } catch (error) {
      toast.error("Erro ao salvar receita");
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
        toast.success("Receita excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir receita");
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
            <Button size="lg" className="gap-2" onClick={handleAddNew}>
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
            showCategoria={false}
          />

          {receitas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receitas.map((receita) => (
                  <TableRow key={receita.id}>
                    <TableCell>{formatDate(receita.data)}</TableCell>
                    <TableCell className="font-medium">{receita.descricao}</TableCell>
                    <TableCell>{receita.responsavel}</TableCell>
                    <TableCell className="text-right font-bold text-liana-foreground">
                      {formatCurrency(Number(receita.valor))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={receita.status === "Recebido" ? "default" : "outline"}>
                        {receita.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(receita)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(receita.id)}
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
              Nenhuma receita registrada neste mês.
            </p>
          )}
        </CardContent>
      </Card>

      <ReceitaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTransaction}
        onSave={handleSave}
        currentDate={currentDate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.
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

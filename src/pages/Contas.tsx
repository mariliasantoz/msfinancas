import { useState, useMemo, useCallback } from "react";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { useView } from "@/contexts/ViewContext";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionDialog } from "@/components/TransactionDialog";
import { FilterBar } from "@/components/FilterBar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function EditableDateCell({ value, onSave }: { value: string; onSave: (val: string) => void }) {
  const [localValue, setLocalValue] = useState(value);
  const [editing, setEditing] = useState(false);

  const handleBlur = useCallback(() => {
    setEditing(false);
    if (localValue !== value) {
      onSave(localValue);
    }
  }, [localValue, value, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  return (
    <input
      type="text"
      className="block w-24 text-sm bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-primary focus:outline-none py-0.5"
      placeholder="dd/mm/aaaa"
      value={editing ? localValue : value}
      onFocus={() => { setLocalValue(value); setEditing(true); }}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

export default function Contas() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions, isLoading, addTransaction, updateTransaction, updateTransactionStatus, deleteTransaction } = useTransactions(currentDate);
  const { showValues } = useView();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentTipo, setCurrentTipo] = useState<"conta" | "despesa">("conta");

  const [searchValue, setSearchValue] = useState("");
  const [responsavelFilter, setResponsavelFilter] = useState("Todos");
  const [cartaoFilter, setCartaoFilter] = useState("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const contasFixas = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "conta")
      .filter((t) => {
        const normalizedSearch = searchValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedDesc = t.descricao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedData = (t.data_recebimento || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const matchesSearch = searchValue === "" || 
          normalizedDesc.includes(normalizedSearch) ||
          t.valor.toString().includes(searchValue) ||
          normalizedData.includes(normalizedSearch);
        const matchesResponsavel = responsavelFilter === "Todos" || t.responsavel === responsavelFilter;
        const matchesCategoria = categoriaFilter === "Todas" || t.categoria === categoriaFilter;
        const matchesStatus = statusFilter === "Todos" || t.status === statusFilter;
        return matchesSearch && matchesResponsavel && matchesCategoria && matchesStatus;
      });
  }, [transactions, searchValue, responsavelFilter, categoriaFilter, statusFilter]);

  const contasVariaveis = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "despesa")
      .filter((t) => {
        const normalizedSearch = searchValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedDesc = t.descricao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedData = (t.data_recebimento || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const matchesSearch = searchValue === "" || 
          normalizedDesc.includes(normalizedSearch) ||
          t.valor.toString().includes(searchValue) ||
          normalizedData.includes(normalizedSearch);
        const matchesResponsavel = responsavelFilter === "Todos" || t.responsavel === responsavelFilter;
        const matchesCategoria = categoriaFilter === "Todas" || t.categoria === categoriaFilter;
        const matchesStatus = statusFilter === "Todos" || t.status === statusFilter;
        return matchesSearch && matchesResponsavel && matchesCategoria && matchesStatus;
      });
  }, [transactions, searchValue, responsavelFilter, categoriaFilter, statusFilter]);

  const totalFixas = contasFixas.reduce((sum, c) => sum + Number(c.valor), 0);
  const totalVariaveis = contasVariaveis.reduce((sum, c) => sum + Number(c.valor), 0);

  const handleSave = async (transaction: any) => {
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, ...transaction });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await addTransaction.mutateAsync(transaction);
        toast.success("Conta adicionada com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao salvar conta");
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
        toast.success("Conta excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir conta");
      }
      setDeletingId(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleAddNew = (tipo: "conta" | "despesa") => {
    setCurrentTipo(tipo);
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Carregando...</p></div>;
  }

  const renderTable = (contas: any[], tipo: "conta" | "despesa") => (
    <>
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
              <TableHead className="w-[120px]">Data</TableHead>
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
                <TableCell>
                  <div>
                    <span className="text-xs text-muted-foreground">Pagar Em:</span>
                    <EditableDateCell
                      value={conta.data_recebimento || ""}
                      onSave={async (val) => {
                        try {
                          await updateTransaction.mutateAsync({ id: conta.id, data_recebimento: val || null });
                          toast.success("Data atualizada");
                        } catch {
                          toast.error("Erro ao atualizar data");
                        }
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{conta.descricao}</TableCell>
                <TableCell>{conta.categoria}</TableCell>
                <TableCell>{conta.responsavel}</TableCell>
                <TableCell>
                  <Badge 
                    variant={conta.status === "Pago" ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80"
                    onClick={async () => {
                      const novoStatus = conta.status === "Pago" ? "A Pagar" : "Pago";
                      try {
                        await updateTransactionStatus.mutateAsync({ id: conta.id, status: novoStatus });
                        toast.success(`Status alterado para ${novoStatus}`);
                      } catch (error) {
                        toast.error("Erro ao alterar status");
                      }
                    }}
                  >
                    {conta.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(Number(conta.valor), showValues)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(conta)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(conta.id)}>
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
          Nenhuma conta registrada neste mês.
        </p>
      )}
    </>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contas 📋</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <Tabs defaultValue="fixas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="fixas">Contas Fixas</TabsTrigger>
          <TabsTrigger value="variaveis">Contas Variáveis</TabsTrigger>
        </TabsList>

        <TabsContent value="fixas" className="space-y-6">
          <Card className="bg-marilia/10 border-marilia/20 border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contas Fixas</p>
                  <p className="text-4xl font-bold text-marilia-foreground">{formatCurrency(totalFixas, showValues)}</p>
                </div>
                <Button size="lg" className="gap-2" onClick={() => handleAddNew("conta")}>
                  <Plus className="h-5 w-5" />
                  Nova Conta Fixa
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contas Fixas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(contasFixas, "conta")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variaveis" className="space-y-6">
          <Card className="bg-stefany/10 border-stefany/20 border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contas Variáveis</p>
                  <p className="text-4xl font-bold text-stefany-foreground">{formatCurrency(totalVariaveis, showValues)}</p>
                </div>
                <Button size="lg" className="gap-2" onClick={() => handleAddNew("despesa")}>
                  <Plus className="h-5 w-5" />
                  Nova Conta Variável
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contas Variáveis</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(contasVariaveis, "despesa")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTransaction}
        tipo={currentTipo}
        onSave={handleSave}
        currentDate={currentDate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
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

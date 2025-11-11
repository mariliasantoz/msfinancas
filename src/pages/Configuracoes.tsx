import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/useConfig";
import { useCartoes } from "@/hooks/useCartoes";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Configuracoes() {
  const { config, updateConfig } = useConfig();
  const { cartoes, addCartao, deleteCartao } = useCartoes();
  const [metaMensal, setMetaMensal] = useState("");
  const [novoCartao, setNovoCartao] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setMetaMensal(config.meta_mensal.toString());
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        meta_mensal: parseFloat(metaMensal),
      });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  const handleAddCartao = async () => {
    if (!novoCartao.trim()) {
      toast.error("Digite o nome do cartão");
      return;
    }

    if (cartoes.some(c => c.nome.toLowerCase() === novoCartao.trim().toLowerCase())) {
      toast.error("Este cartão já está cadastrado");
      return;
    }

    try {
      await addCartao.mutateAsync(novoCartao.trim());
      setNovoCartao("");
      toast.success("Cartão adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar cartão");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await deleteCartao.mutateAsync(deletingId);
      toast.success("Cartão excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir cartão");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Configurações ⚙️</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Meta Mensal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta">Meta de Gastos Mensais</Label>
            <Input
              id="meta"
              type="number"
              value={metaMensal}
              onChange={(e) => setMetaMensal(e.target.value)}
              placeholder="8000.00"
            />
            <p className="text-sm text-muted-foreground">
              Defina o valor máximo que deseja gastar por mês
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Cartões Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome do novo cartão"
              value={novoCartao}
              onChange={(e) => setNovoCartao(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCartao()}
            />
            <Button onClick={handleAddCartao} disabled={addCartao.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <ul className="space-y-2">
            {cartoes.map((cartao) => (
              <li key={cartao.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  <span>{cartao.nome}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(cartao.id)}
                  disabled={deleteCartao.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>

          {cartoes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum cartão cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartoes } from "@/hooks/useCartoes";
import { useCategorias } from "@/hooks/useCategorias";
import { useState } from "react";
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
  const { cartoes, addCartao, deleteCartao } = useCartoes();
  const { categorias, addCategoria, deleteCategoria } = useCategorias();
  const [novoCartao, setNovoCartao] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"cartao" | "categoria">("cartao");

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

  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }

    if (categorias.some(c => c.nome.toLowerCase() === novaCategoria.trim().toLowerCase())) {
      toast.error("Esta categoria já está cadastrada");
      return;
    }

    try {
      await addCategoria.mutateAsync(novaCategoria.trim());
      setNovaCategoria("");
      toast.success("Categoria adicionada com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar categoria");
    }
  };

  const handleDeleteClick = (id: string, type: "cartao" | "categoria") => {
    setDeletingId(id);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      if (deleteType === "cartao") {
        await deleteCartao.mutateAsync(deletingId);
        toast.success("Cartão excluído com sucesso!");
      } else {
        await deleteCategoria.mutateAsync(deletingId);
        toast.success("Categoria excluída com sucesso!");
      }
    } catch (error) {
      toast.error(`Erro ao excluir ${deleteType === "cartao" ? "cartão" : "categoria"}`);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Configurações ⚙️</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onClick={() => handleDeleteClick(cartao.id, "cartao")}
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Categorias Cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da nova categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategoria()}
              />
              <Button onClick={handleAddCategoria} disabled={addCategoria.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <ul className="space-y-2">
              {categorias.map((categoria) => (
                <li key={categoria.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏷️</span>
                    <span>{categoria.nome}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(categoria.id, "categoria")}
                    disabled={deleteCategoria.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>

            {categorias.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria cadastrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {deleteType === "cartao" ? "este cartão" : "esta categoria"}? Esta ação não pode ser desfeita.
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
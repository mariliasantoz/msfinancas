import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@/hooks/useTransactions";
import { useCartoes } from "@/hooks/useCartoes";
import { getMonthReference } from "@/lib/formatters";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  tipo: "receita" | "despesa" | "conta" | "compra";
  onSave: (transaction: Omit<Transaction, "id">) => void;
  currentDate: Date;
}

const categorias = [
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Moradia",
  "Vestuário",
  "Outros",
];

const responsaveis = ["Liana", "Stefany", "Marília", "Nosso ❤️"];
const formasPagamento = ["PIX", "Cartão", "Parcelado", "Dinheiro", "Outros"];

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  tipo,
  onSave,
  currentDate,
}: TransactionDialogProps) {
  const { cartoes } = useCartoes();
  const [formData, setFormData] = useState({
    data: "",
    descricao: "",
    valor: "",
    categoria: "",
    responsavel: "",
    forma_pagamento: "",
    parcelas: "1",
    cartao: "",
    status: "Pago" as Transaction["status"],
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        data: transaction.data,
        descricao: transaction.descricao,
        valor: transaction.valor.toString(),
        categoria: transaction.categoria,
        responsavel: transaction.responsavel,
        forma_pagamento: transaction.forma_pagamento || "",
        parcelas: transaction.parcelas?.toString() || "1",
        cartao: transaction.cartao || "",
        status: transaction.status,
      });
    } else {
      setFormData({
        data: new Date().toISOString().split("T")[0],
        descricao: "",
        valor: "",
        categoria: "",
        responsavel: "",
        forma_pagamento: "",
        parcelas: "1",
        cartao: "",
        status: "Pago",
      });
    }
  }, [transaction, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      data: formData.data,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      tipo,
      categoria: formData.categoria,
      responsavel: formData.responsavel as any,
      forma_pagamento: formData.forma_pagamento,
      parcelas: parseInt(formData.parcelas),
      cartao: formData.cartao || undefined,
      status: tipo === "compra" ? "A Pagar" : (formData.status as any),
      mes_referencia: getMonthReference(currentDate),
    });
    onOpenChange(false);
  };

  const isParcelado = formData.forma_pagamento === "Parcelado";
  const usaCartao = formData.forma_pagamento === "Cartão" || isParcelado;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar" : "Nova"}{" "}
            {tipo === "receita"
              ? "Receita"
              : tipo === "conta"
              ? "Conta Fixa"
              : tipo === "compra"
              ? "Compra"
              : "Despesa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              required
              placeholder="Ex: Supermercado"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="text" value={formData.categoria} required className="sr-only" tabIndex={-1} aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select value={formData.responsavel} onValueChange={(value) => setFormData({ ...formData, responsavel: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp} value={resp}>
                      {resp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="text" value={formData.responsavel} required className="sr-only" tabIndex={-1} aria-hidden="true" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select value={formData.forma_pagamento} onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipo !== "compra" && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="A Pagar">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isParcelado && (
            <div className="space-y-2">
              <Label htmlFor="parcelas">Quantidade de Parcelas</Label>
              <Input
                id="parcelas"
                type="number"
                min="1"
                value={formData.parcelas}
                onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
              />
            </div>
          )}

          {usaCartao && (
            <div className="space-y-2">
              <Label htmlFor="cartao">Cartão</Label>
              <Select value={formData.cartao} onValueChange={(value) => setFormData({ ...formData, cartao: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {cartoes.map((cartao) => (
                    <SelectItem key={cartao.id} value={cartao.id}>
                      {cartao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

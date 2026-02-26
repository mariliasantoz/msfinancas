import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@/hooks/useTransactions";
import { getMonthReference } from "@/lib/formatters";

interface ReceitaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSave: (transaction: Partial<Transaction>) => void;
  currentDate: Date;
}

const responsaveis = ["Liana", "Stefany", "Marília", "Nosso ❤️"];

export function ReceitaDialog({ open, onOpenChange, transaction, onSave, currentDate }: ReceitaDialogProps) {
  const [formData, setFormData] = useState({
    data: "",
    data_recebimento: "",
    descricao: "",
    valor: "",
    responsavel: "",
    status: "A Receber",
    parcelas: "1",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        data: transaction.data,
        data_recebimento: transaction.data_recebimento || transaction.data,
        descricao: transaction.descricao,
        valor: transaction.valor.toString(),
        responsavel: transaction.responsavel,
        status: transaction.status,
        parcelas: transaction.parcelas?.toString() || "1",
      });
    } else {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      
      setFormData({
        data: `${year}-${month}-${day}`,
        data_recebimento: `${year}-${month}-${day}`,
        descricao: "",
        valor: "",
        responsavel: "",
        status: "A Receber",
        parcelas: "1",
      });
    }
  }, [transaction, currentDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      alert("Por favor, insira um valor válido");
      return;
    }

    const mes = new Date(formData.data);
    const mesReferencia = getMonthReference(mes);
    const parcelas = parseInt(formData.parcelas) || 1;

    const transactionData: Partial<Transaction> = {
      data: formData.data,
      data_recebimento: formData.data_recebimento,
      descricao: formData.descricao,
      valor,
      tipo: "receita",
      categoria: "Receita",
      responsavel: formData.responsavel as Transaction["responsavel"],
      status: formData.status as Transaction["status"],
      mes_referencia: mesReferencia,
      parcelas: parcelas,
      forma_pagamento: parcelas > 1 ? "Parcelado" : undefined,
    };

    if (transaction) {
      transactionData.id = transaction.id;
    }

    onSave(transactionData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar Receita" : "Nova Receita"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_recebimento">Receber Em</Label>
            <Input
              id="data_recebimento"
              type="date"
              value={formData.data_recebimento}
              onChange={(e) => setFormData({ ...formData, data_recebimento: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Salário, Freelance, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Select
              value={formData.responsavel}
              onValueChange={(value) => setFormData({ ...formData, responsavel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {responsaveis.map((resp) => (
                  <SelectItem key={resp} value={resp}>
                    {resp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="A Receber">A Receber</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parcelas">Parcelas (meses)</Label>
            <Input
              id="parcelas"
              type="number"
              min="1"
              max="120"
              value={formData.parcelas}
              onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
              placeholder="1"
              disabled={!!transaction}
            />
            <p className="text-xs text-muted-foreground">
              {transaction 
                ? "Não é possível alterar parcelas após cadastro" 
                : "Quantidade de meses que essa receita será recebida"}
            </p>
          </div>

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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMonthReference, getMonthReferenceFromDate } from "@/lib/formatters";

export interface Transaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa" | "conta" | "compra";
  categoria: string;
  responsavel: "Liana" | "Stefany" | "Marília" | "Nosso ❤️";
  forma_pagamento?: string;
  parcelas?: number;
  cartao?: string;
  status: "Pago" | "A Pagar" | "Recebido" | "A Receber";
  mes_referencia: string;
  grupo_parcelas?: string;
  data_recebimento?: string;
}

export function useTransactions(currentDate: Date) {
  const queryClient = useQueryClient();
  const mesReferencia = getMonthReference(currentDate);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", mesReferencia],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("mes_referencia", mesReferencia)
        .order("data", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id">) => {
      // Se for parcelado, criar múltiplas transações
      if (transaction.forma_pagamento === "Parcelado" && transaction.parcelas && transaction.parcelas > 1) {
        const grupoParcelasId = crypto.randomUUID();
        const transacoes = [];

        for (let i = 1; i <= transaction.parcelas; i++) {
          // Para receitas: começar no mesmo mês (i-1)
          // Para outros tipos (compras/contas): começar no mês seguinte (i)
          const monthOffset = transaction.tipo === "receita" ? (i - 1) : i;
          const mesRef = getMonthReferenceFromDate(transaction.data, monthOffset);
          
          // Cada parcela inicia com status individual (A Pagar/A Receber)
          const statusInicial = transaction.tipo === "receita" ? "A Receber" : "A Pagar";
          
          transacoes.push({
            ...transaction,
            descricao: `${transaction.descricao} - Parcela ${i}/${transaction.parcelas}`,
            valor: transaction.valor,
            mes_referencia: mesRef,
            grupo_parcelas: grupoParcelasId,
            status: statusInicial,
          });
        }

        const { data, error } = await supabase
          .from("transacoes")
          .insert(transacoes)
          .select();

        if (error) throw error;
        return data;
      }

      // Se não for parcelado, inserir normalmente
      const { data, error } = await supabase
        .from("transacoes")
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // Atualiza APENAS o status de uma transação específica (não afeta outras parcelas)
  const updateTransactionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("transacoes")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...transaction }: Partial<Transaction> & { id: string }) => {
      // Buscar a transação original para verificar se é parcelada
      const { data: originalTransaction } = await supabase
        .from("transacoes")
        .select("grupo_parcelas, parcelas")
        .eq("id", id)
        .maybeSingle();

      // Se for parcelada, atualizar todas as parcelas (exceto status)
      if (originalTransaction?.grupo_parcelas) {
        // Campos que NÃO devem ser atualizados em grupo: mes_referencia, descricao, status
        const { mes_referencia, descricao, status, ...updateFields } = transaction;
        
        const { data, error } = await supabase
          .from("transacoes")
          .update(updateFields)
          .eq("grupo_parcelas", originalTransaction.grupo_parcelas)
          .select();

        if (error) throw error;
        return data;
      }

      // Se não for parcelada, atualizar normalmente
      const { data, error } = await supabase
        .from("transacoes")
        .update(transaction)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      // Buscar a transação para verificar se é parcelada
      const { data: transaction } = await supabase
        .from("transacoes")
        .select("grupo_parcelas")
        .eq("id", id)
        .maybeSingle();

      // Se for parcelada, excluir todas as parcelas
      if (transaction?.grupo_parcelas) {
        const { error } = await supabase
          .from("transacoes")
          .delete()
          .eq("grupo_parcelas", transaction.grupo_parcelas);
        
        if (error) throw error;
      } else {
        // Se não for parcelada, excluir apenas a transação específica
        const { error } = await supabase
          .from("transacoes")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    updateTransactionStatus,
    deleteTransaction,
  };
}

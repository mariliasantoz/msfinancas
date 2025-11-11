import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMonthReference } from "@/lib/formatters";

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
      const { data, error } = await supabase
        .from("transacoes")
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", mesReferencia] });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...transaction }: Partial<Transaction> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["transactions", mesReferencia] });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", mesReferencia] });
    },
  });

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

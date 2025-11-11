import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Cartao {
  id: string;
  nome: string;
  created_at: string;
}

export function useCartoes() {
  const queryClient = useQueryClient();

  const { data: cartoes = [], isLoading } = useQuery({
    queryKey: ["cartoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cartoes")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as Cartao[];
    },
  });

  const addCartao = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from("cartoes")
        .insert([{ nome }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
    },
  });

  const deleteCartao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cartoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
    },
  });

  return {
    cartoes,
    isLoading,
    addCartao,
    deleteCartao,
  };
}

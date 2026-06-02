import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CategoriaReceita {
  id: string;
  nome: string;
  criado_em: string;
}

export function useCategoriasReceita() {
  const queryClient = useQueryClient();

  const { data: categoriasReceita = [], isLoading } = useQuery({
    queryKey: ["categorias_receita"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_receita")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as CategoriaReceita[];
    },
  });

  const addCategoriaReceita = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from("categorias_receita")
        .insert([{ nome }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias_receita"] });
    },
  });

  const deleteCategoriaReceita = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias_receita").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias_receita"] });
    },
  });

  return {
    categoriasReceita,
    isLoading,
    addCategoriaReceita,
    deleteCategoriaReceita,
  };
}

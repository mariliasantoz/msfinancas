import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Categoria {
  id: string;
  nome: string;
  created_at: string;
}

export function useCategorias() {
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as Categoria[];
    },
  });

  const addCategoria = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from("categorias")
        .insert([{ nome }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  return {
    categorias,
    isLoading,
    addCategoria,
    deleteCategoria,
  };
}

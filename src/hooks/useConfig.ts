import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Config {
  id: string;
  meta_mensal: number;
  tema: "claro" | "escuro";
  notificacoes: boolean;
}

export function useConfig() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      return data as Config;
    },
  });

  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<Config>) => {
      if (!config?.id) throw new Error("Config not found");
      
      const { data, error } = await supabase
        .from("configuracoes")
        .update(updates)
        .eq("id", config.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });

  return {
    config,
    isLoading,
    updateConfig,
  };
}

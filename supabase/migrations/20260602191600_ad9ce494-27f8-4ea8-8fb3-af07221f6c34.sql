CREATE TABLE public.categorias_receita (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  criado_em timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_receita TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_receita TO authenticated;
GRANT ALL ON public.categorias_receita TO service_role;

ALTER TABLE public.categorias_receita ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso público para categorias de receita"
ON public.categorias_receita
FOR ALL
USING (true)
WITH CHECK (true);

INSERT INTO public.categorias_receita (nome) VALUES
  ('Salário'),
  ('Vendas'),
  ('Pag. Terceiros'),
  ('Rebuceteio'),
  ('Outras Receitas');
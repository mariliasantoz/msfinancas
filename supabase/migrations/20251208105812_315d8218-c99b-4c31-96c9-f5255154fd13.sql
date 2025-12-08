-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Permitir acesso público para categorias" 
ON public.categorias 
AS RESTRICTIVE
FOR ALL 
USING (true)
WITH CHECK (true);

-- Inserir categorias padrão
INSERT INTO public.categorias (nome) VALUES 
  ('Alimentação'),
  ('Transporte'),
  ('Moradia'),
  ('Lazer'),
  ('Saúde'),
  ('Educação'),
  ('Outros');
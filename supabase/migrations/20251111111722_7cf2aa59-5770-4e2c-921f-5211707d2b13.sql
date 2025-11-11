-- Remover constraint antiga de status
ALTER TABLE public.transacoes DROP CONSTRAINT IF EXISTS transacoes_status_check;

-- Adicionar nova constraint que aceita os 4 valores
ALTER TABLE public.transacoes ADD CONSTRAINT transacoes_status_check 
CHECK (status IN ('Pago', 'A Pagar', 'Recebido', 'A Receber'));

-- Criar tabela de cartões
CREATE TABLE public.cartoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;

-- Criar policy para acesso público
CREATE POLICY "Permitir acesso público para cartões"
ON public.cartoes
FOR ALL
USING (true)
WITH CHECK (true);

-- Popular com cartões existentes
INSERT INTO public.cartoes (nome) VALUES
  ('Nubank'),
  ('Santander'),
  ('Mercado Pago'),
  ('Amazon');

-- Atualizar status de receitas existentes
UPDATE public.transacoes 
SET status = 'Recebido' 
WHERE tipo = 'receita' AND status = 'Pago';

UPDATE public.transacoes 
SET status = 'A Receber' 
WHERE tipo = 'receita' AND status = 'A Pagar';
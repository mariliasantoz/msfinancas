-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS public.transacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa', 'conta', 'compra')),
  categoria TEXT NOT NULL,
  responsavel TEXT NOT NULL CHECK (responsavel IN ('Liana', 'Stefany', 'Marília', 'Nosso ❤️')),
  forma_pagamento TEXT CHECK (forma_pagamento IN ('PIX', 'Cartão', 'Parcelado', 'Outros')),
  parcelas INTEGER DEFAULT 1,
  cartao TEXT CHECK (cartao IN ('Nubank', 'Santander', 'Mercado Pago', 'Amazon')),
  status TEXT DEFAULT 'Pago' CHECK (status IN ('Pago', 'A Pagar')),
  mes_referencia TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_mensal DECIMAL(10, 2) NOT NULL DEFAULT 8000.00,
  tema TEXT DEFAULT 'claro' CHECK (tema IN ('claro', 'escuro')),
  notificacoes BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.configuracoes (meta_mensal, tema, notificacoes)
VALUES (8000.00, 'claro', true)
ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security (acesso público para este painel)
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público (painel familiar)
CREATE POLICY "Permitir acesso público para transações"
  ON public.transacoes
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir acesso público para configurações"
  ON public.configuracoes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at
CREATE TRIGGER update_transacoes_updated_at
  BEFORE UPDATE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_transacoes_mes_referencia ON public.transacoes(mes_referencia);
CREATE INDEX idx_transacoes_tipo ON public.transacoes(tipo);
CREATE INDEX idx_transacoes_responsavel ON public.transacoes(responsavel);
CREATE INDEX idx_transacoes_data ON public.transacoes(data DESC);
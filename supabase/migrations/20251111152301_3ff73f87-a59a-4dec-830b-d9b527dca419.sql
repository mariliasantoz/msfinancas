-- Adicionar coluna grupo_parcelas para identificar parcelas relacionadas
ALTER TABLE transacoes 
ADD COLUMN grupo_parcelas UUID;

-- Criar índice para melhorar performance de queries por grupo
CREATE INDEX idx_transacoes_grupo_parcelas ON transacoes(grupo_parcelas);
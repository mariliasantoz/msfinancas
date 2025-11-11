-- 1. Adicionar nova coluna UUID para cartões
ALTER TABLE transacoes ADD COLUMN cartao_uuid uuid;

-- 2. Migrar dados existentes (mapear nomes para UUIDs)
UPDATE transacoes SET cartao_uuid = cartoes.id 
FROM cartoes 
WHERE transacoes.cartao = cartoes.nome;

-- 3. Remover coluna antiga de texto
ALTER TABLE transacoes DROP COLUMN cartao;

-- 4. Renomear nova coluna para o nome original
ALTER TABLE transacoes RENAME COLUMN cartao_uuid TO cartao;

-- 5. Adicionar Foreign Key
ALTER TABLE transacoes 
ADD CONSTRAINT fk_transacoes_cartao 
FOREIGN KEY (cartao) REFERENCES cartoes(id) ON DELETE SET NULL;

-- 6. Remover constraint antiga de forma_pagamento
ALTER TABLE transacoes DROP CONSTRAINT IF EXISTS transacoes_forma_pagamento_check;

-- 7. Adicionar constraint atualizada incluindo "Dinheiro"
ALTER TABLE transacoes 
ADD CONSTRAINT transacoes_forma_pagamento_check 
CHECK (forma_pagamento = ANY (ARRAY['PIX'::text, 'Cartão'::text, 'Parcelado'::text, 'Dinheiro'::text, 'Outros'::text]));
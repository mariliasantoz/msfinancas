

## Corrigir erro ao salvar o campo "Receber Em"

### Problema

O campo `data_recebimento` no banco de dados esta definido como tipo `date` (data). Quando voce digita algo como "15/02" ou qualquer texto livre, o banco rejeita o valor porque nao e uma data valida no formato esperado (AAAA-MM-DD).

### Solucao

1. **Alterar o tipo da coluna no banco de dados**: Mudar `data_recebimento` de `date` para `text`, permitindo armazenar qualquer valor (numeros, letras, datas em qualquer formato, ou vazio)

2. **Atualizar o tipo TypeScript**: Ajustar a interface `Transaction` em `src/hooks/useTransactions.ts` para refletir que `data_recebimento` e uma string, nao uma data

### Detalhes Tecnicos

**Migracao SQL**:
```sql
ALTER TABLE transacoes ALTER COLUMN data_recebimento TYPE text;
```

**Arquivo `src/hooks/useTransactions.ts`**: O campo `data_recebimento` ja esta tipado como `string` na interface, entao nao precisa mudar.

**Arquivo `src/pages/Receitas.tsx`**: O codigo ja esta correto com input de texto livre. Nenhuma alteracao necessaria.

Apos a migracao, o campo aceitara qualquer valor digitado sem erro.


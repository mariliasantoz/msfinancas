

## Plano: Campo "Receber Em" na Pagina de Receitas

### Resumo
Adicionar um novo campo `data_recebimento` na tabela `transacoes` para armazenar a data prevista de recebimento, separada da data de cadastro. Na tabela de receitas, a coluna "Data" passará a exibir o label "Receber Em:" com a data de recebimento editável inline, e abaixo a data original de cadastro.

### 1. Migração de Banco de Dados

Adicionar a coluna `data_recebimento` (date, nullable) na tabela `transacoes`:

```sql
ALTER TABLE public.transacoes ADD COLUMN data_recebimento date;
```

### 2. Atualizar Interface `Transaction` em `useTransactions.ts`

Adicionar o campo `data_recebimento` (string opcional) na interface `Transaction`.

### 3. Atualizar a Tabela na Pagina `Receitas.tsx`

Na coluna "Data" de cada receita, exibir:

```
Receber Em: [data editável]
dd/mm/aaaa (data cadastro)
```

- O label "Receber Em:" aparece em texto menor e discreto
- A data de recebimento é editável via um input de data inline (clicável para editar)
- Abaixo, a data original de cadastro aparece em fonte menor e cor discreta
- Ao alterar a data de recebimento, salvar automaticamente no banco via `updateTransaction`

### 4. Atualizar o Dialog `ReceitaDialog.tsx`

Adicionar o campo "Receber Em" no formulário de criação/edição de receitas, permitindo definir a data prevista de recebimento ao cadastrar.

### Arquivos a modificar

| Arquivo | Alteracao |
|---------|-----------|
| Migracao SQL | Adicionar coluna `data_recebimento` |
| `src/hooks/useTransactions.ts` | Adicionar `data_recebimento` na interface |
| `src/pages/Receitas.tsx` | Exibir campo editavel "Receber Em" na coluna Data |
| `src/components/ReceitaDialog.tsx` | Adicionar campo "Receber Em" no formulario |

### Detalhes Tecnicos

**Edicao inline**: Ao clicar na data de recebimento na tabela, um input `type="date"` aparece. Ao confirmar (blur ou Enter), a data e salva via `updateTransaction`. Se nao houver `data_recebimento` definida, exibe a data de cadastro como fallback.

**Formulario**: O campo "Receber Em" sera um input de data separado do campo "Data" existente, com valor padrao igual a data de cadastro.

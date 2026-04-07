

## Tornar coluna Data editavel na pagina Contas (Fixas e Variaveis)

### O que muda

1. A coluna "Data" nas tabelas de Contas Fixas e Contas Variaveis deixara de exibir a data de cadastro (`formatDate(conta.data)`) e passara a usar o campo `data_recebimento` com edicao livre, identico ao da pagina Receitas.
2. O filtro de busca passara a incluir o campo `data_recebimento` na pesquisa, com normalizacao de acentos e case insensitive.

### Detalhes Tecnicos

**Arquivo**: `src/pages/Contas.tsx`

1. **Adicionar `EditableDateCell`**: Copiar o componente `EditableDateCell` da pagina Receitas (ou extrair para componente compartilhado) e adicionar no topo do arquivo, com import de `useCallback`.

2. **Atualizar filtros** (linhas 38-46 e 52-60): Adicionar normalizacao NFD e incluir `data_recebimento` no `matchesSearch`, igual ao Receitas:
   ```
   const normalizedData = (t.data_recebimento || "").toLowerCase().normalize("NFD").replace(...)
   matchesSearch = ... || normalizedData.includes(normalizedSearch)
   ```

3. **Atualizar `renderTable`** (linha 133 e 145):
   - `TableHead` da coluna Data: adicionar `className="w-[120px]"`
   - `TableCell` da coluna Data: trocar `formatDate(conta.data)` por label "Pagar Em:" + `EditableDateCell` que salva no campo `data_recebimento` via `updateTransaction.mutateAsync`



## Substituir "Maior Gasto do Mes" por duas listas lado a lado

### O que muda
A seção "Maior Gasto do Mês" (linhas 154-174) sera removida e substituida por duas cards lado a lado:

1. **Contas a Pagar** - Lista todas as transacoes do mes com status "A Pagar" (tipo: despesa, conta, compra)
2. **Receitas a Receber** - Lista todas as receitas do mes com status "A Receber"

### Layout
Duas cards em grid `grid-cols-1 lg:grid-cols-2`, cada uma com:
- Icone e titulo no header
- Lista scrollavel das transacoes pendentes (descricao + valor)
- Mensagem vazia quando nao houver itens pendentes
- Total pendente no rodape de cada card

### Detalhes Tecnicos

**Arquivo**: `src/pages/Dashboard.tsx`

- Remover o `useMemo` de `maiorGasto` (linhas 54-58)
- Adicionar dois novos `useMemo`:
  - `contasAPagar`: filtra transacoes com `tipo !== "receita"` e `status === "A Pagar"`
  - `receitasAReceber`: filtra transacoes com `tipo === "receita"` e `status === "A Receber"`
- Substituir o bloco JSX do "Maior Gasto" (linhas 154-174) por um grid com duas cards:
  - Card esquerda: icone Clock, borda stefany, lista `contasAPagar` com descricao e valor
  - Card direita: icone TrendingUp, borda liana, lista `receitasAReceber` com descricao e valor
  - Cada card com `max-h` e `overflow-y-auto` para scroll quando houver muitos itens
  - Rodape com total de cada lista

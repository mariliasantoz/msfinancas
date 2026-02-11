

## Alterar "Contas a Pagar" no Dashboard

### O que muda

A lista "Contas a Pagar" no Dashboard deixara de listar cada compra de cartao individualmente. Em vez disso:

- **Cartoes**: Agrupa todas as compras pendentes ("A Pagar") por cartao e exibe apenas o nome do cartao com o total somado
- **Contas fixas** (tipo "conta") e **contas variaveis** (tipo "despesa"): Continuam listadas individualmente como ja estao

### Como vai ficar a lista

```
Cartao Nubank .............. R$ 1.200,00
Cartao Inter ............... R$ 800,00
Conta de Luz ............... R$ 150,00
Internet ................... R$ 120,00
```

### Detalhes Tecnicos

**Arquivo**: `src/pages/Dashboard.tsx`

1. Importar `useCartoes` para obter os nomes dos cartoes (a transacao armazena o ID do cartao, nao o nome)

2. Substituir o `useMemo` de `contasAPagar` por uma logica que:
   - Filtra transacoes nao-receita com status "A Pagar"
   - Separa em dois grupos:
     - `contasFixasEVariaveis`: transacoes com tipo "conta" ou "despesa" (listadas individualmente)
     - `cartoesAgrupados`: transacoes com tipo "compra", agrupadas pelo campo `cartao` (ID), somando os valores e exibindo o nome do cartao via `useCartoes`
   - Combina ambos em uma lista unica de itens `{ descricao, valor }` para renderizar

3. Atualizar o calculo de `totalAPagar` para somar todos os itens da lista combinada

4. A renderizacao JSX permanece praticamente igual (descricao + valor), so muda a fonte de dados

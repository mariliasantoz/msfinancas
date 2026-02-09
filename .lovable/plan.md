

## Plano: Melhorias na Pagina Compras / Cartoes

### 1. Adicionar coluna "Vencimento" na tabela `cartoes` (Banco de Dados)

Criar uma migração para adicionar o campo `vencimento` (integer, nullable) na tabela `cartoes`. Esse campo armazenará o dia do vencimento (1-31).

```sql
ALTER TABLE cartoes ADD COLUMN vencimento integer;
```

### 2. Atualizar o hook `useCartoes`

- Adicionar `vencimento` na interface `Cartao`
- Criar uma mutation `updateCartao` para atualizar o vencimento de um cartão:
  ```
  updateCartao({ id, vencimento })
  ```

### 3. Campo de Vencimento editável ao lado do nome de cada cartão

No `ComprasAgrupadas.tsx`, ao lado do nome do cartão no header de cada card:
- Exibir "Venc. dia XX" se já tiver vencimento cadastrado
- Ao clicar, abrir um input inline para editar o dia (1-31)
- Salvar automaticamente ao confirmar (blur ou Enter)

```
┌─────────────────────────────────────────────────┐
│  [icone] NUBANK  |  Venc. dia 15 [editar]       │
│  R$ 1.500,00                                    │
│  5 compras                                      │
└─────────────────────────────────────────────────┘
```

### 4. Campo de filtro geral no topo da página

Adicionar um campo de busca global no card de "Total de Compras", ao lado do valor total. Este filtro buscará em todas as compras de todos os cartões simultaneamente por descrição ou valor.

- Quando ativo, filtrar `comprasPorCartao` aplicando o termo de busca
- Cartões sem resultados ficam ocultos
- Limpar o filtro restaura a visualização normal

```
┌─────────────────────────────────────────────────────────┐
│  Total de Compras           [🔍 Buscar em todos...]     │
│  R$ 8.500,00                                            │
└─────────────────────────────────────────────────────────┘
```

### 5. Botão "Nova Compra" flutuante

Remover o botão do card de total e torná-lo um botão flutuante (fixed) no canto inferior direito da tela, sempre visível ao rolar a página.

```css
fixed bottom-6 right-6 z-50 shadow-xl rounded-full
```

### Arquivos a modificar

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Adicionar coluna `vencimento` na tabela `cartoes` |
| `src/hooks/useCartoes.ts` | Adicionar campo `vencimento` na interface e mutation `updateCartao` |
| `src/pages/ComprasAgrupadas.tsx` | Campo vencimento editável, filtro geral, botão flutuante |

### Detalhes Técnicos

**Vencimento**: Será armazenado como integer (dia do mês, 1-31). A edição será inline com um input numérico pequeno que aparece ao clicar no texto do vencimento. O salvamento ocorre ao pressionar Enter ou ao sair do campo (onBlur).

**Filtro geral**: Um estado `globalSearch` controlará a busca. O `useMemo` de `comprasPorCartao` será ajustado para aplicar o filtro global quando preenchido, filtrando por `descricao` e `valor` em todas as compras.

**Botão flutuante**: Será posicionado com `fixed bottom-6 right-6` com `z-50` para garantir que fique acima de todo o conteúdo. Terá sombra e formato arredondado para destaque visual.


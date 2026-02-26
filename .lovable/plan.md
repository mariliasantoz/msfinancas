

## Alteracoes na pagina de Receitas

### 1. Campo "Receber Em" no dialog (ReceitaDialog.tsx)

- Mudar o input de `type="date"` para `type="text"` com placeholder `dd/mm/aaaa`
- Valor padrao vazio (nao preencher com data atual)
- O valor digitado sera salvo diretamente no campo `data_recebimento` (texto livre)

### 2. Coluna "Data" na tabela (Receitas.tsx)

- Remover o label "Receber Em:" e o componente `EditableDateCell`
- Exibir diretamente o valor de `data_recebimento` como texto simples
- Manter a edicao inline clicavel, mas simplificada
- Registros antigos que tenham datas no formato ISO (AAAA-MM-DD) serao convertidos para dd/mm/aaaa na exibicao

### 3. Filtro por data (FilterBar.tsx e Receitas.tsx)

- Adicionar dois campos de texto ao FilterBar: "Data Inicial" e "Data Final" (formato dd/mm/aaaa)
- Filtrar receitas comparando o `data_recebimento` com o intervalo informado
- Funcao auxiliar para parsear dd/mm/aaaa em objeto Date para comparacao

### 4. Ordenacao

- Parsear `data_recebimento` (dd/mm/aaaa) em Date para ordenar corretamente
- Receitas sem data ficam no final

### Detalhes Tecnicos

**Arquivos a alterar:**

- `src/components/ReceitaDialog.tsx` - campo "Receber Em" para texto livre, default vazio
- `src/pages/Receitas.tsx` - exibicao da coluna, filtro por data, ordenacao
- `src/components/FilterBar.tsx` - adicionar props e inputs para filtro de data inicial/final
- `src/lib/formatters.ts` - funcao para parsear dd/mm/aaaa e converter ISO para dd/mm/aaaa


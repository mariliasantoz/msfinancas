

## Reduzir largura da coluna "Data"

Adicionar classe `w-[120px]` (ou similar) ao `TableHead` e `TableCell` da coluna Data na tabela de receitas, limitando a largura ao minimo necessario para o conteudo "Receber Em: dd/mm/aaaa".

### Detalhes Tecnicos

**Arquivo**: `src/pages/Receitas.tsx`

- No `TableHead` da coluna Data (linha ~148): adicionar `className="w-[120px]"`
- No `TableCell` correspondente (linha ~156): adicionar `className="w-[120px]"` para garantir consistencia
- Tambem reduzir a largura do input dentro do `EditableDateCell`, ajustando para `w-24` ou `max-w-[100px]`


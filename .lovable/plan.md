
## Tornar campo de data de recebimento com edicao livre

### O que muda

O campo `input type="date"` na coluna "Data" da pagina Receitas sera trocado por um `input type="text"`. Isso permite:
- Digitar qualquer valor livremente
- Apagar o conteudo do campo
- Nao exigir formato de data especifico do navegador

### Detalhes Tecnicos

**Arquivo**: `src/pages/Receitas.tsx` (linhas 161-172)

- Trocar `type="date"` por `type="text"`
- Adicionar `placeholder="dd/mm/aaaa"` para orientar o usuario
- Salvar ao perder o foco (`onBlur`) em vez de `onChange`, para evitar salvar a cada tecla digitada
- Permitir valor vazio (apagar a data)
- Usar estado local temporario para controlar o valor durante a edicao

-- Remover política restritiva incorreta
DROP POLICY IF EXISTS "Permitir acesso público para categorias" ON public.categorias;

-- Criar política permissiva correta
CREATE POLICY "Permitir acesso público para categorias" 
ON public.categorias 
AS PERMISSIVE
FOR ALL 
TO public
USING (true)
WITH CHECK (true);
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResumoFinanceiro() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState("");

  useEffect(() => {
    supabase
      .from("transacoes")
      .select("*")
      .then(({ data }) => {
        const items = data || [];
        setTransacoes(items);
        const mesesUnicos = [...new Set(items.map((t: any) => t.mes_referencia))] as string[];
        mesesUnicos.sort((a, b) => b.localeCompare(a));
        if (mesesUnicos.length > 0) {
          setMesSelecionado(mesesUnicos[0]);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">Carregando...</div>;

  const transacoesMes = transacoes.filter((t) => t.mes_referencia === mesSelecionado);

  const receitas = transacoesMes
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const gastos = transacoesMes
    .filter((t) => t.tipo !== "receita")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldo = receitas - gastos;

  let status = "Saudável 🟢";
  if (saldo < 0) status = "Negativo 🔴";
  else if (saldo < receitas * 0.2) status = "Alerta 🟡";

  const hoje = new Date().getDate();
  const diasNoMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const diasRestantes = diasNoMes - hoje;
  const limiteDiario = saldo / (diasRestantes || 1);

  const categorias: Record<string, number> = {};
  transacoesMes
    .filter((t) => t.tipo !== "receita")
    .forEach((t) => {
      categorias[t.categoria] = (categorias[t.categoria] || 0) + Number(t.valor);
    });

  const topCategorias = Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const meses = [...new Set(transacoes.map((t: any) => t.mes_referencia))] as string[];
  meses.sort((a, b) => {
    const [mesA, anoA] = a.split("/");
    const [mesB, anoB] = b.split("/");
    if (anoA !== anoB) return Number(anoB) - Number(anoA);
    return Number(mesB) - Number(mesA);
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Resumo Financeiro</h1>

      <div className="flex items-center gap-3">
        <strong>Selecionar mês:</strong>
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {meses.map((mes) => (
              <SelectItem key={mes} value={mes}>{mes}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="text-lg">💰 Receitas: <strong className="text-positive-foreground">R$ {receitas.toFixed(2)}</strong></div>
        <div className="text-lg">💸 Gastos: <strong className="text-negative-foreground">R$ {gastos.toFixed(2)}</strong></div>
        <div className="text-lg">🧾 Saldo: <strong>R$ {saldo.toFixed(2)}</strong></div>
      </div>

      <div>
        <strong>Status:</strong> {status}
      </div>

      <div>
        📅 Limite diário: <strong>R$ {limiteDiario.toFixed(2)}</strong>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">📈 Top gastos por categoria</h3>
        <ul className="list-disc list-inside space-y-1">
          {topCategorias.map(([cat, val]) => (
            <li key={cat}>
              {cat}: R$ {(val as number).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

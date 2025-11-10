import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/useConfig";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

export default function Configuracoes() {
  const { config, updateConfig } = useConfig();
  const [metaMensal, setMetaMensal] = useState("");

  useEffect(() => {
    if (config) {
      setMetaMensal(config.meta_mensal.toString());
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        meta_mensal: parseFloat(metaMensal),
      });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Configurações ⚙️</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Meta Mensal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta">Meta de Gastos Mensais</Label>
            <Input
              id="meta"
              type="number"
              value={metaMensal}
              onChange={(e) => setMetaMensal(e.target.value)}
              placeholder="8000.00"
            />
            <p className="text-sm text-muted-foreground">
              Defina o valor máximo que deseja gastar por mês
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Cartões Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span>Nubank</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span>Santander</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span>Mercado Pago</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span>Amazon</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

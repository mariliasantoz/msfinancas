import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function Relatorios() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios 📊</h1>
        <Button size="lg" className="gap-2">
          <FileDown className="h-5 w-5" />
          Exportar PDF
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Relatórios em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta seção está sendo desenvolvida e em breve trará gráficos comparativos,
            evolução mensal e relatórios detalhados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
